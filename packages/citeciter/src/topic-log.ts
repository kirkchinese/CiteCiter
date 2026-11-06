/** Pure projections of one Topic Session log: transcript rows, board state, title and source cursor. */
import { assembleAssistantStream, lastAssistantStreamChunk, type ContentBlock } from '@deepseek-ai/dsh-llm'
import type { SessionEvent, SessionHeader, SessionLogOffset } from '@deepseek-ai/dsh-session'
import { foldSessionTitle } from '@deepseek-ai/dsh-session-title'
import { applyBoardOps, boardBatchSchema, EMPTY_BOARD_STATE, type BoardSnapshot } from './board.ts'
import { animationSpecSchema, compileTimeline, type BoardTimeline } from './board-animation.ts'

/** Name of the model tool that records a board animation timeline. */
export const BOARD_ANIMATE_TOOL = 'blackboard_animate'
import { hasInterruptedPtcParent } from './blocking-question-recovery.ts'
import { contextMessage } from './message-projection.ts'
import { readQuestionReply, questionReplyText } from './question-reply.ts'
import { projectRejectedToolApprovals } from './tool-approval-projection.ts'
import { toolCallRecord, toolResultRecord } from './tool-events.ts'
import type { TopicMessage, TopicMetadata, TopicUsage } from './topic.ts'

/** Session header and events used to project one Topic. */
export interface TopicLog {
  readonly header: SessionHeader
  readonly events: readonly SessionEvent[]
  readonly inheritedEventCount: SessionLogOffset
  readonly liveMessage?: TopicMessage | undefined
  readonly renderKeys?: ReadonlyMap<number, string> | undefined
}

function textBlocks(content: readonly ContentBlock[], type: 'text' | 'reasoning'): string {
  return content.flatMap((block) => block.type === type ? [block.text] : []).join('')
}

function toolResultText(content: readonly ContentBlock[]): string {
  return textBlocks(content, 'text')
}

function contentAttachments(content: readonly ContentBlock[], imageName: string, fileName: string): Array<{ kind: 'image' | 'file', id: string, name: string }> {
  return content.flatMap(block => block.type === 'image' || block.type === 'file'
    ? [{ kind: block.type, id: String(block.attachment.attachmentId), name: block.attachment.name ?? (block.type === 'image' ? imageName : fileName) }]
    : [])
}

/** One model-request retry event, read field by field: DSH 0.2.0 logged no retries and declares them elsewhere. */
type RetryRecord =
  | { readonly kind: 'scheduled', readonly retryId: string, readonly turn: number, readonly step: number, readonly retry: number, readonly maxRetries?: number, readonly delayMs: number, readonly failure: string, readonly code?: string }
  | { readonly kind: 'started', readonly retryId: string }

/** @returns the structured code of a DSH failure, when it carries one. */
function failureCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('code' in error)) return undefined
  const { code } = error as { code: unknown }
  return typeof code === 'string' && code !== '' ? code : undefined
}

function retryRecord(event: SessionEvent): RetryRecord | undefined {
  const type = event.type as string
  if (type !== 'llm/retry' && type !== 'llm/retry-started') return undefined
  const data = event.data as unknown as Record<string, unknown> | null
  if (typeof data !== 'object' || data === null || typeof data['retryId'] !== 'string') return undefined
  const retryId = data['retryId']
  if (type === 'llm/retry-started') return { kind: 'started', retryId }
  const { turn, step, retry, maxRetries, delayMs, failure } = data
  if (!Number.isSafeInteger(turn) || !Number.isSafeInteger(step) || !Number.isSafeInteger(retry) || (retry as number) < 1) return undefined
  const message = typeof failure === 'object' && failure !== null && 'message' in failure && typeof failure.message === 'string' ? failure.message : ''
  const code = failureCode(failure)
  return {
    kind: 'scheduled', retryId, turn: turn as number, step: step as number, retry: retry as number,
    ...(Number.isSafeInteger(maxRetries) && (maxRetries as number) > 0 ? { maxRetries: maxRetries as number } : {}),
    delayMs: typeof delayMs === 'number' && Number.isFinite(delayMs) && delayMs >= 0 ? delayMs : 0,
    failure: message, ...(code === undefined ? {} : { code }),
  }
}

/** Fold Topic-owned assistant usage, including retried attempts, without inherited source events. */
export function projectTopicUsage(log: TopicLog): TopicUsage | undefined {
  const count = (value: number | undefined): value is number => value !== undefined && Number.isSafeInteger(value) && value >= 0
  let inputTokens = 0
  let outputTokens = 0
  let cachedInputTokens = 0
  let lastContextTokens: number | undefined
  let contextWindow: number | undefined
  let previous: { turn: number, step: number, input: number, output: number, cached: number } | undefined
  let reported = false
  for (const event of log.events.slice(log.inheritedEventCount)) {
    if (event.type === 'request/context') {
      const window = event.data.contextWindow
      contextWindow = count(window) && window > 0 ? window : undefined
      continue
    }
    if ((event.type as string) === 'llm/retry-started') {
      const retry = event.data as { turn?: unknown, step?: unknown }
      if (previous !== undefined && retry.turn === previous.turn && retry.step === previous.step) previous = undefined
      continue
    }
    if (event.type !== 'assistant/message' && event.type !== 'assistant/attempt') continue
    const sample = (event.type === 'assistant/message' ? event.data.usage : undefined)
      ?? lastAssistantStreamChunk(event.data.stream, 'usage')?.usage
    if (sample === undefined || !count(sample.inputTokens) || !count(sample.outputTokens)
      || (sample.cacheReadTokens !== undefined && !count(sample.cacheReadTokens))
      || (sample.cacheWriteTokens !== undefined && !count(sample.cacheWriteTokens))) continue
    const input = sample.inputTokens + (sample.cacheReadTokens ?? 0) + (sample.cacheWriteTokens ?? 0)
    if (!count(input)) continue
    const cached = sample.cacheReadTokens ?? 0
    const replacing = previous?.turn === event.data.turn && previous.step === event.data.step ? previous : undefined
    const nextInput = inputTokens - (replacing?.input ?? 0) + input
    const nextOutput = outputTokens - (replacing?.output ?? 0) + sample.outputTokens
    const nextCached = cachedInputTokens - (replacing?.cached ?? 0) + cached
    if (!count(nextInput) || !count(nextOutput) || !count(nextCached)) continue
    inputTokens = nextInput
    outputTokens = nextOutput
    cachedInputTokens = nextCached
    lastContextTokens = input
    previous = { turn: event.data.turn, step: event.data.step, input, output: sample.outputTokens, cached }
    reported = true
  }
  return reported ? {
    inputTokens, outputTokens, cachedInputTokens,
    ...(lastContextTokens === undefined ? {} : { lastContextTokens }),
    ...(contextWindow === undefined ? {} : { contextWindow }),
  } : undefined
}

/** Last read scan cursor from this Topic log; it may move backward and never limits future reads. */
export function latestObservedSeq(events: readonly SessionEvent[]): number | null {
  const sourceCalls = new Set<string>()
  let observed: number | null = null
  for (const event of events) {
    const call = toolCallRecord(event)
    if (call?.name === 'read_source_session') {
      sourceCalls.add(call.callId)
      continue
    }
    const result = toolResultRecord(event)
    if (result === undefined || result.isError || !sourceCalls.has(result.callId)) continue
    let meta: unknown = result.meta
    if (meta === undefined) {
      try { meta = JSON.parse(toolResultText(result.content)) }
      catch { continue } // Non-JSON results do not contain a recoverable source cursor.
    }
    if (typeof meta !== 'object' || meta === null || Array.isArray(meta)) continue
    const value = 'capturedThroughSeq' in meta ? meta.capturedThroughSeq : undefined
    if (value === null || typeof value === 'number') observed = value
  }
  return observed
}

/**
 * Project transcript rows and the latest turn's active failure banner.
 * @param log - Topic Session contents; an inherited prefix from older versions is skipped.
 * @returns transcript rows plus an error only while the newest turn remains failed.
 */
export function topicMessages(log: TopicLog): { messages: TopicMessage[], error: string | null } {
  const messages: TopicMessage[] = []
  const toolIndexes = new Map<string, number>()
  const start = log.inheritedEventCount
  const events = log.events.slice(start)
  const rejectedToolApprovals = projectRejectedToolApprovals(events)
  let error: string | null = null
  const attemptByTurn = new Map<number, number>()
  const bodyByTurn = new Set<number>()
  const retryIndexes = new Map<string, number>()
  // Calls started in the open turn; any still without a result when the turn ends were interrupted.
  let openTurnCalls: string[] = []
  const settleOpenTurn = () => {
    for (const callId of openTurnCalls) {
      const index = toolIndexes.get(callId)
      const call = index === undefined ? undefined : messages[index]
      if (index !== undefined && call?.role === 'tool' && call.running) messages[index] = { ...call, running: false, interruptionOutcome: 'interrupted' }
    }
    openTurnCalls = []
  }
  for (const event of events) {
    if (event.type === 'turn/start') {
      error = null
      settleOpenTurn()
      continue
    }
    if (event.type === 'step/start') {
      attemptByTurn.set(event.data.turn, (attemptByTurn.get(event.data.turn) ?? 0) + 1)
      continue
    }
    if (event.type === 'user/message' && event.data.source.kind === 'user-question-reply') {
      const reply = readQuestionReply(textBlocks(event.data.content, 'text'), String(event.data.source.callId))
      messages.push({ id: event.data.id, seq: event.seq, role: 'user', text: questionReplyText(reply), questionReply: reply })
      const index = toolIndexes.get(reply.callId)
      const call = index === undefined ? undefined : messages[index]
      if (index !== undefined && call?.role === 'tool' && call.name === 'ask_user_question') {
        // A reply after a restart answers a question the ended turn left open.
        const { interruptionOutcome: _interrupted, ...answered } = call
        messages[index] = { ...answered, questionReply: reply, running: false }
      }
      continue
    }
    if (event.type === 'user/message' && event.data.source.kind === 'user') {
      const text = textBlocks(event.data.content, 'text')
      const attachments = contentAttachments(event.data.content, '图片', '文件')
      if (text !== '' || attachments.length > 0) messages.push({
        id: event.data.id,
        seq: event.seq,
        role: 'user',
        attachments,
        text,
      })
      continue
    }
    const context = contextMessage(event)
    if (context !== undefined) {
      const text = textBlocks(context.content, 'text')
      if (text !== '') messages.push({
        id: context.id,
        seq: event.seq,
        role: 'context',
        label: context.label,
        contextRole: context.contextRole,
        producer: context.producer,
        ...(context.summary === undefined ? {} : { summary: context.summary }),
        text,
      })
      continue
    }
    if (event.type === 'assistant/message' || event.type === 'assistant/attempt') {
      const content = event.type === 'assistant/message'
        ? event.data.message.content : assembleAssistantStream(event.data.stream).blocks()
      const text = textBlocks(content, 'text')
      const reasoning = textBlocks(content, 'reasoning')
      const attachments = contentAttachments(content, '图片', '文件')
      const renderKey = log.renderKeys?.get(event.seq)
      if (text !== '' || attachments.length > 0) bodyByTurn.add(event.data.turn)
      if (text !== '' || reasoning !== '' || attachments.length > 0) messages.push({
        id: event.type === 'assistant/message' ? event.data.message.id : `attempt:${event.seq}`,
        ...(renderKey === undefined ? {} : { renderKey }),
        seq: event.seq,
        role: 'assistant',
        ...(attachments.length === 0 ? {} : { attachments }),
        text,
        reasoning: reasoning === '' ? null : reasoning,
        streaming: false,
      })
      continue
    }
    const toolCall = toolCallRecord(event)
    if (toolCall !== undefined) {
      toolIndexes.set(toolCall.callId, messages.length)
      openTurnCalls.push(toolCall.callId)
      messages.push({
        id: toolCall.callId,
        seq: event.seq,
        role: 'tool',
        name: toolCall.name,
        arguments: toolCall.arguments,
        result: null,
        ...(toolCall.parentCallId === undefined ? {} : { parentCallId: toolCall.parentCallId }),
        isError: false,
        running: true,
      })
      continue
    }
    const toolResult = toolResultRecord(event)
    if (toolResult !== undefined) {
      const callId = toolResult.callId
      const index = toolIndexes.get(callId)
      if (index === undefined) continue
      const call = messages[index]
      if (call?.role !== 'tool') continue
      messages[index] = {
        ...call,
        seq: event.seq,
        result: toolResultText(toolResult.content),
        attachments: contentAttachments(toolResult.content, '工具图片', '工具文件'),
        ...(toolResult.meta === undefined ? {} : { meta: toolResult.meta }),
        isError: toolResult.isError,
        ...(toolResult.errorCode === undefined ? {} : { errorCode: toolResult.errorCode }),
        ...(rejectedToolApprovals.has(callId) ? { approvalOutcome: 'rejected' as const } : {}),
        running: false,
      }
      continue
    }
    const retry = retryRecord(event)
    if (retry !== undefined) {
      const index = retryIndexes.get(retry.retryId)
      const previous = index === undefined ? undefined : messages[index]
      if (retry.kind === 'scheduled') {
        const row: TopicMessage = {
          id: `retry:${retry.retryId}`, seq: event.seq, role: 'retry', turn: retry.turn, step: retry.step,
          retry: retry.retry, ...(retry.maxRetries === undefined ? {} : { maxRetries: retry.maxRetries }),
          delayMs: retry.delayMs, state: 'scheduled', failure: retry.failure, ...(retry.code === undefined ? {} : { code: retry.code }),
        }
        // One row per retry chain, updated in place like DSH's own transcript.
        if (index === undefined) { retryIndexes.set(retry.retryId, messages.length); messages.push(row) }
        else messages[index] = row
      } else if (index !== undefined && previous?.role === 'retry') messages[index] = { ...previous, state: 'started' }
      continue
    }
    if (event.type === 'turn/end') {
      // A retry still waiting when its turn ended never ran.
      for (const index of retryIndexes.values()) {
        const row = messages[index]
        if (row?.role === 'retry' && row.turn === event.data.turn && row.state === 'scheduled') messages[index] = { ...row, state: 'cancelled' }
      }
    }
    if (event.type === 'turn/end' && (event.data.reason.kind === 'error' || (
      event.data.reason.kind === 'aborted' && event.data.reason.reason.kind === 'user'
    ))) {
      const reason = event.data.reason
      const stopped = reason.kind === 'aborted'
      const text = reason.kind === 'error' ? reason.error.message : '已停止，可继续。'
      const code = reason.kind === 'error' ? failureCode(reason.error) : undefined
      error = stopped ? null : text
      settleOpenTurn()
      messages.push({
        id: `error:${event.seq}`,
        seq: event.seq,
        role: 'error',
        turn: event.data.turn,
        text,
        ...(code === undefined ? {} : { code }),
        bodyRetained: bodyByTurn.has(event.data.turn),
        attempt: Math.max(1, attemptByTurn.get(event.data.turn) ?? 1),
        status: stopped ? 'stopped' : 'failed',
      })
      continue
    }
    if (event.type === 'turn/end') {
      error = null
      settleOpenTurn()
    }
  }
  // A repaired PTC parent may have no child result. Mark only the proved
  // interruption as presentation state; never invent the missing tool output.
  for (const [callId, index] of toolIndexes) {
    const call = messages[index]
    if (call?.role === 'tool' && call.name === 'ask_user_question' && call.result === null
      && call.questionReply === undefined && hasInterruptedPtcParent(callId, events)) {
      messages[index] = { ...call, interruptionOutcome: 'interrupted', running: false }
    }
  }
  if (log.liveMessage !== undefined) messages.push(log.liveMessage)
  return { messages, error }
}

/**
 * Project final blackboard state from successful blackboard_apply call/result pairs.
 * @param log - Topic Session contents.
 * @returns versioned final state, successful commit revision, and invalid-commit count.
 */
export function projectBoardFromLog(log: TopicLog): BoardSnapshot {
  const calls = new Map<string, { readonly name: string, readonly args: string }>()
  let state = EMPTY_BOARD_STATE
  let timeline: BoardTimeline | null = null
  let revision = 0
  let invalid = 0
  const start = log.inheritedEventCount
  for (const event of log.events.slice(start)) {
    const call = toolCallRecord(event)
    if (call?.name === 'blackboard_apply' || call?.name === BOARD_ANIMATE_TOOL) {
      calls.set(call.callId, { name: call.name, args: call.arguments })
      continue
    }
    const result = toolResultRecord(event)
    if (result === undefined) continue
    const callId = result.callId
    const pending = calls.get(callId)
    if (pending === undefined) continue
    calls.delete(callId)
    if (result.isError) continue
    try {
      const raw: unknown = JSON.parse(pending.args)
      if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
        throw new Error(`expected ${pending.name} arguments`)
      }
      if (pending.name === BOARD_ANIMATE_TOOL) {
        const spec = animationSpecSchema.parse(raw)
        compileTimeline(spec, [...state.values()])
        timeline = { id: callId, spec }
      } else {
        const batch = boardBatchSchema.parse((raw as { readonly ops?: unknown }).ops)
        state = applyBoardOps(state, batch).state
        // A cleared board has nothing left to animate.
        if (batch.some(op => op.op === 'clear')) timeline = null
      }
      revision += 1
    } catch {
      invalid += 1
    }
  }
  return { version: 4, revision, elements: [...state.values()], invalid, timeline }
}

/**
 * Classify a folded title for the cached navigation metadata.
 * @param value - latest title projection, if any.
 * @returns its source kind, or null for no title or a source the index does not record.
 */
export function titleSourceKind(value: ReturnType<typeof foldSessionTitle>): TopicMetadata['cachedTitleSource'] {
  if (value === undefined) return null
  return value.source.kind === 'fallback' || value.source.kind === 'provider' || value.source.kind === 'user'
    ? value.source.kind
    : null
}

/**
 * Fold Topic-owned titles, skipping an inherited prefix kept by older Topics.
 * @param log - restored Topic events and the host-owned inherited event count.
 * @returns the latest Topic title projection, or undefined before any title is recorded.
 */
export function foldTopicTitle(log: TopicLog) {
  return foldSessionTitle(log.events.slice(log.inheritedEventCount))
}

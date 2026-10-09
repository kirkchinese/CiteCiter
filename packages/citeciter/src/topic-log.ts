/** Pure projections of one Topic Session log: transcript rows, board state, title and source cursor. */
import { assembleAssistantStream, type ContentBlock } from '@deepseek-ai/dsh-llm'
import type { SessionEvent, SessionHeader, SessionLogOffset } from '@deepseek-ai/dsh-session'
import { foldSessionTitle } from '@deepseek-ai/dsh-session-title'
import { applyBoardOps, boardBatchSchema, EMPTY_BOARD_STATE, type BoardSnapshot } from './board.ts'
import { hasInterruptedPtcParent } from './blocking-question-recovery.ts'
import { contextMessage } from './message-projection.ts'
import { readQuestionReply, questionReplyText } from './question-reply.ts'
import { projectRejectedToolApprovals } from './tool-approval-projection.ts'
import { toolCallRecord, toolResultRecord } from './tool-events.ts'
import type { TopicMessage, TopicMetadata } from './topic.ts'

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
  for (const event of events) {
    if (event.type === 'turn/start') {
      error = null
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
        messages[index] = { ...call, questionReply: reply, running: false }
      }
      continue
    }
    if (event.type === 'user/message' && event.data.source.kind === 'user') {
      const text = textBlocks(event.data.content, 'text')
      const attachments = event.data.content.flatMap(block => block.type === 'image' || block.type === 'file' ? [{ kind: block.type, id: String(block.attachment.attachmentId), name: block.attachment.name ?? (block.type === 'image' ? '图片' : '文件') }] : [])
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
        text,
      })
      continue
    }
    if (event.type === 'assistant/message' || event.type === 'assistant/attempt') {
      const content = event.type === 'assistant/message'
        ? event.data.message.content : assembleAssistantStream(event.data.stream).blocks()
      const text = textBlocks(content, 'text')
      const reasoning = textBlocks(content, 'reasoning')
      const renderKey = log.renderKeys?.get(event.seq)
      if (text !== '') bodyByTurn.add(event.data.turn)
      if (text !== '' || reasoning !== '') messages.push({
        id: event.type === 'assistant/message' ? event.data.message.id : `attempt:${event.seq}`,
        ...(renderKey === undefined ? {} : { renderKey }),
        seq: event.seq,
        role: 'assistant',
        text,
        reasoning: reasoning === '' ? null : reasoning,
        streaming: false,
      })
      continue
    }
    const toolCall = toolCallRecord(event)
    if (toolCall !== undefined) {
      toolIndexes.set(toolCall.callId, messages.length)
      messages.push({
        id: toolCall.callId,
        seq: event.seq,
        role: 'tool',
        name: toolCall.name,
        arguments: toolCall.arguments,
        result: null,
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
        attachments: toolResult.content.flatMap(part => part.type === 'image' || part.type === 'file' ? [{ kind: part.type, id: String(part.attachment.attachmentId), name: part.attachment.name ?? (part.type === 'image' ? '工具图片' : '工具文件') }] : []),
        isError: toolResult.isError,
        ...(toolResult.errorCode === undefined ? {} : { errorCode: toolResult.errorCode }),
        ...(rejectedToolApprovals.has(callId) ? { approvalOutcome: 'rejected' as const } : {}),
        running: false,
      }
      continue
    }
    if (event.type === 'turn/end' && (event.data.reason.kind === 'error' || (
      event.data.reason.kind === 'aborted' && event.data.reason.reason.kind === 'user'
    ))) {
      const reason = event.data.reason
      const stopped = reason.kind === 'aborted'
      const text = reason.kind === 'error' ? reason.error.message : '已停止，可继续。'
      error = stopped ? null : text
      messages.push({
        id: `error:${event.seq}`,
        seq: event.seq,
        role: 'error',
        text,
        bodyRetained: bodyByTurn.has(event.data.turn),
        attempt: Math.max(1, attemptByTurn.get(event.data.turn) ?? 1),
        status: stopped ? 'stopped' : 'failed',
      })
      continue
    }
    if (event.type === 'turn/end') error = null
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
  const calls = new Map<string, string>()
  let state = EMPTY_BOARD_STATE
  let revision = 0
  let invalid = 0
  const start = log.inheritedEventCount
  for (const event of log.events.slice(start)) {
    const call = toolCallRecord(event)
    if (call?.name === 'blackboard_apply') {
      calls.set(call.callId, call.arguments)
      continue
    }
    const result = toolResultRecord(event)
    if (result === undefined) continue
    const callId = result.callId
    const args = calls.get(callId)
    if (args === undefined) continue
    calls.delete(callId)
    if (result.isError) continue
    try {
      const raw: unknown = JSON.parse(args)
      if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
        throw new Error('expected blackboard_apply arguments')
      }
      const batch = boardBatchSchema.parse((raw as { readonly ops?: unknown }).ops)
      state = applyBoardOps(state, batch).state
      revision += 1
    } catch {
      invalid += 1
    }
  }
  return { version: 4, revision, elements: [...state.values()], invalid }
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

import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type { ContentBlock } from '@deepseek-ai/dsh-llm'
import { toolCallRecord, toolResultRecord } from './tool-events.ts'
import { questionKey } from './topic-questions.ts'

function pending(content: readonly ContentBlock[]): boolean {
  const first = content.find(block => block.type === 'text')
  if (first === undefined) return false
  try {
    const value: unknown = JSON.parse(first.text)
    return typeof value === 'object' && value !== null && 'pending' in value && value.pending === true
  } catch {
    // An ordinary error string is not the Host's JSON pending receipt.
    return false
  }
}

function unresolvedError(event: SessionEvent): boolean {
  if (event.type !== 'tool/result' && event.type !== 'tool/ptc-dispatch') return false
  const error: unknown = 'error' in event.data ? event.data.error : undefined
  return typeof error === 'object' && error !== null && 'code' in error
    && (error.code === 'TOOL_OUTCOME_UNKNOWN' || error.code === 'ASK_TIMED_OUT')
}

/**
 * Inspect exact owned post-seed calls only. Missing projections, queued replies,
 * disconnects and interrupted-call repair never establish a terminal receipt.
 */
export function questionDraftLogStatus(
  sessionId: string, key: string, events: readonly SessionEvent[], inheritedEventCount: number, blocking = false,
): 'open' | 'closed' | 'unknown' {
  let status: 'open' | 'unknown' = 'unknown'
  let callId: string | undefined
  let currentTurn: number | undefined
  let callTurn: number | undefined
  let aborted = false
  for (const event of events.slice(inheritedEventCount)) {
    if (event.type === 'turn/start') currentTurn = event.data.turn
    const call = toolCallRecord(event)
    if (call?.name === 'ask_user_question' && questionKey(sessionId, call.callId) === key) {
      callId = call.callId
      callTurn = currentTurn
      status = 'open'
      continue
    }
    if (callId === undefined) continue
    if (event.type === 'user/message' && event.data.source.kind === 'user-question-reply' && event.data.source.callId === callId) {
      // Admission is final for this exact call, even if a delayed transport result follows it.
      return 'closed'
    }
    const result = toolResultRecord(event)
    if (result?.callId === callId && !unresolvedError(event) && !pending(result.content)) {
      // Disposal and an explicit user stop share ASK_ABORTED. Wait for the
      // structured turn outcome before deciding whether a blocking draft ended.
      if (blocking && result.errorCode === 'ASK_ABORTED') aborted = true
      else return 'closed'
    }
    if (blocking && event.type === 'turn/end' && event.data.turn === callTurn) {
      const reason = event.data.reason
      if (reason.kind === 'aborted' && reason.reason.kind === 'user') return 'closed'
      if (!aborted) continue
      // Crash repair can close this exact turn after ASK_ABORTED was already
      // persisted; the parent tool may have returned an ordinary failure.
      if (reason.kind === 'interrupted' || (reason.kind === 'aborted' && reason.reason.kind === 'disposed')) continue
      // A transport/provider abort is not an explicit user cancellation. Keep
      // its draft but do not invent a resumable call without interruption proof.
      status = 'unknown'
    }
  }
  return status
}

/** Candidate key for a committed result/reply; callers still verify its original ask call. */
export function questionDraftReceiptKey(sessionId: string, event: SessionEvent): string | undefined {
  if (event.type === 'user/message' && event.data.source.kind === 'user-question-reply') return questionKey(sessionId, event.data.source.callId)
  if (event.type !== 'tool/result' && event.type !== 'tool/ptc-dispatch') return undefined
  const result = toolResultRecord(event)
  return result === undefined ? undefined : questionKey(sessionId, result.callId)
}

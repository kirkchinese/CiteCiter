import type { TopicMessage } from '../topic.ts'

/**
 * Decide whether one Topic event belongs in the user-facing transcript.
 * @param message - candidate projected Topic event.
 * @param messages - complete ordered Topic transcript used to detect recovery.
 * @returns whether the event should remain visible.
 */
export function isTopicMessageVisible(message: TopicMessage, messages: readonly TopicMessage[]): boolean {
  if (message.role === 'context') return false
  if (message.role === 'assistant' && message.text.trim() === '' && (message.reasoning ?? '').trim() === '') return false
  // Each dispatch has its own outcome. A later same-name success does not erase an earlier failure.
  if (message.role === 'tool') return true
  if (message.role !== 'error') return true
  return !messages.some((candidate) =>
    candidate.role === 'assistant'
    && candidate.seq > message.seq
    && !candidate.streaming
    && candidate.text.trim() !== '')
}

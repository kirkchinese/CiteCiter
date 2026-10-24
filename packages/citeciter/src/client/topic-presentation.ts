import type { TopicMessage } from '../topic.ts'

/**
 * Decide whether one Topic event belongs in the user-facing transcript. Like DSH's chat, ordinary
 * context (runtime, time, skill catalogs, prompt injections) stays out of the transcript unless the
 * reader asks to see all context; notices with a summary and recalled material, such as Citer's
 * codebase notices and source excerpts, are always listed. Failures and stops stay in the history.
 * @param message - candidate projected Topic event.
 * @param options - `allContext` lists every logged context message.
 * @returns whether the event should remain visible.
 */
export function isTopicMessageVisible(message: TopicMessage, options: { readonly allContext?: boolean } = {}): boolean {
  if (message.role === 'assistant') return message.text.trim() !== '' || (message.reasoning ?? '').trim() !== '' || (message.attachments?.length ?? 0) > 0
  if (message.role === 'context') return options.allContext === true || message.summary !== undefined || message.contextRole === 'recall'
  return true
}

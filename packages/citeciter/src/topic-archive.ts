/** Archive recovery follows accepted user submissions, not later model/tool activity. */
import type {} from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-user-questions/types'
import type { SessionEvent } from '@deepseek-ai/dsh-session'

/** Return the admission time of a user inbox insertion; claims and canceled items do not qualify. */
export function topicSubmissionTime(event: SessionEvent): number | null {
  return event.type === 'agent/inbox/spliced'
    && event.data.inserted.some(message => message.source.kind === 'user' || message.source.kind === 'user-question-reply')
    ? event.time
    : null
}

/** Ignore inherited source history when repairing archive state after a restart. */
export function latestTopicSubmission(events: readonly SessionEvent[], inheritedEventCount: number): number | null {
  for (let index = events.length - 1; index >= inheritedEventCount; index--) {
    const time = topicSubmissionTime(events[index]!)
    if (time !== null) return time
  }
  return null
}

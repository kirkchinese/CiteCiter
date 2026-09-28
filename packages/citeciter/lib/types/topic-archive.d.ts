import type { SessionEvent } from '@deepseek-ai/dsh-session';
/** Return the admission time of a user inbox insertion; claims and canceled items do not qualify. */
export declare function topicSubmissionTime(event: SessionEvent): number | null;
/** Ignore inherited source history when repairing archive state after a restart. */
export declare function latestTopicSubmission(events: readonly SessionEvent[], inheritedEventCount: number): number | null;

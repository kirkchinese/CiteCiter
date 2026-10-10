import type { SessionEvent } from '@deepseek-ai/dsh-session';
/**
 * Identify failed tools whose one exact approval request was explicitly rejected.
 * @param events - ordered events from one private Topic, excluding its inherited seed.
 * @returns call IDs with an unambiguous call → ask → rejection → failed-result chain.
 * This is presentation only: original results and permission decisions remain unchanged.
 * Missing identities, duplicate calls/results/approval IDs, multiple approvals, unknown
 * outcomes and successful results produce no verdict. PTC children retain their own IDs.
 */
export declare function projectRejectedToolApprovals(events: readonly SessionEvent[]): ReadonlySet<string>;

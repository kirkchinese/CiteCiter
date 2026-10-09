import type { SessionEvent } from '@deepseek-ai/dsh-session';
/**
 * Inspect exact owned post-seed calls only. Missing projections, queued replies,
 * disconnects and interrupted-call repair never establish a terminal receipt.
 */
export declare function questionDraftLogStatus(sessionId: string, key: string, events: readonly SessionEvent[], inheritedEventCount: number, blocking?: boolean): 'open' | 'closed' | 'unknown';
/** Candidate key for a committed result/reply; callers still verify its original ask call. */
export declare function questionDraftReceiptKey(sessionId: string, event: SessionEvent): string | undefined;

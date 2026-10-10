import type { SessionEvent } from '@deepseek-ai/dsh-session';
import type { QuestionDraftRecord } from './question-draft-contract.ts';
import type { PendingQuestion } from './topic.ts';
/**
 * Prove that an unfinished PTC child belongs to the exact run_code invocation
 * repaired by DSH after a crash. Every parent link must be logged in the same
 * turn; an ordinary parent failure, settled child or unrelated repair is not proof.
 * @param events - only the owning Topic's post-seed events, in append order.
 */
export declare function hasInterruptedPtcParent(callId: string, events: readonly SessionEvent[]): boolean;
/**
 * Recover only a Host-identified blocking draft and its exact committed ask.
 * Missing/invalid logs never fabricate a question; cancellation and accepted
 * replies remain closed. The returned card can submit only on a user's action.
 */
export declare function recoverBlockingQuestion(sessionId: string, record: QuestionDraftRecord, events: readonly SessionEvent[], inheritedEventCount: number): PendingQuestion | undefined;

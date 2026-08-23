import type { CiteSelection } from './types.ts';
export type CreateMode = 'observer' | 'exact-fork' | 'exact-when-available';
export interface RequestIntent {
    readonly key: string;
    readonly requestId: string;
}
/**
 * Claim the retry-stable request ID for one pending Topic-creation intent.
 * @param selection - cited source selection.
 * @param question - normalized first question.
 * @param mode - resolved Topic creation mode.
 * @returns the pending intent key and request ID.
 */
export declare function claimCreateTopicIntent(selection: CiteSelection, question: string, mode: CreateMode): Promise<RequestIntent>;
/**
 * Claim the retry-stable request ID for one pending Topic follow-up.
 * @param topicSessionId - target private Topic Session.
 * @param question - normalized follow-up question.
 * @returns the pending intent key and request ID.
 */
export declare function claimAskIntent(topicSessionId: string, question: string): Promise<RequestIntent>;
/**
 * Forget a confirmed request so a later identical submission is a new user intent.
 * @param intent - confirmed pending intent.
 */
export declare function completeRequestIntent(intent: RequestIntent): void;

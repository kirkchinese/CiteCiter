import type { TopicScenario } from '../topic.ts';
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
export declare function claimCreateTopicIntent(selection: CiteSelection, question: string, mode: CreateMode, scenario?: TopicScenario): Promise<RequestIntent>;
/**
 * Claim the retry-stable request ID for one uncited Topic creation.
 * @param sourceSessionId - owning DSH Session.
 * @param question - normalized first question.
 * @param scenario - requested Topic presentation.
 * @returns the pending intent key and request ID.
 */
export declare function claimCreateFreeTopicIntent(sourceSessionId: string, question: string, scenario: Extract<TopicScenario, 'qa' | 'present'>): Promise<RequestIntent>;
/** Document-range claim identity shared by the Reader entry point. */
export interface DocumentClaimIntent {
    readonly documentId: string;
    readonly displayText: string;
    readonly prefixText: string;
    readonly suffixText: string;
}
/**
 * Claim the retry-stable request ID for one pending document Topic creation.
 * @param claim - document identity and verified-looking quote context.
 * @param question - normalized first question.
 * @returns the pending intent key and request ID.
 */
export declare function claimCreateDocumentIntent(claim: DocumentClaimIntent, question: string): Promise<RequestIntent>;
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

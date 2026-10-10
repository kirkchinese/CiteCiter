import type { ActionModel } from '../actions.ts';
import type { CiteSelection } from './types.ts';
export interface RequestIntent {
    readonly key: string;
    readonly requestId: string;
}
/**
 * Claim the retry-stable request ID for one pending Topic-creation intent.
 * @param selection - cited source selection.
 * @param question - normalized first question.
 * @param modelRoute - optional model chosen by the wheel action.
 * @returns the pending intent key and request ID.
 */
export declare function claimCreateTopicIntent(selection: CiteSelection, question: string, modelRoute?: ActionModel): Promise<RequestIntent>;
/**
 * Claim the retry-stable request ID for one uncited Topic creation.
 * @param sourceSessionId - owning DSH Session.
 * @param question - normalized first question.
 * @returns the pending intent key and request ID.
 */
export declare function claimCreateFreeTopicIntent(sourceSessionId: string, question: string): Promise<RequestIntent>;
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
export declare function claimCreateDocumentIntent(claim: DocumentClaimIntent, question: string, sourceSessionId?: string, modelRoute?: ActionModel): Promise<RequestIntent>;
/**
 * Forget a confirmed request so a later identical submission is a new user intent.
 * @param intent - confirmed pending intent.
 */
export declare function completeRequestIntent(intent: RequestIntent): void;

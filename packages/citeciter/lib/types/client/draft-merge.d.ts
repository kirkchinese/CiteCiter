import type { DraftContent } from '../draft-contract.ts';
import type { QuestionDraftContent } from '../question-draft-contract.ts';
/** Three-way text merge. Independent edits survive; overlapping edits use the operating window. Unicode code points remain intact. */
export declare function mergeDraftText(base: string, local: string, remote: string, preferLocal: boolean): string;
/** Merge real attachment/reference identities; removal wins over an unchanged copy, never recreating a deleted reference. */
export declare function mergeDraftContent(base: DraftContent, local: DraftContent, remote: DraftContent, preferLocal: boolean): DraftContent;
/** Merge independent questions and text edits; changing the selection keeps the whole answer atomic so single-choice and custom answers cannot be combined. */
export declare function mergeQuestionDraft(base: QuestionDraftContent, local: QuestionDraftContent, remote: QuestionDraftContent, preferLocal: boolean): QuestionDraftContent;

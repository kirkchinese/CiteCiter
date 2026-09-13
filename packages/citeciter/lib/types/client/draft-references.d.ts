import type { TopicSummary } from '../topic.ts';
/** One unsent model-visible reference. Removing this value removes its serialized content. */
export interface DraftReference {
    readonly id: string;
    readonly kind: 'source' | 'excerpt' | 'board';
    readonly label: string;
    readonly content: string;
    readonly address?: string;
}
/** Build initial references without submitting them. Stable Topic-scoped IDs preserve menu focus during live snapshot refreshes. */
export declare function topicDraftReferences(topic: TopicSummary, documentTitle?: string): readonly DraftReference[];
/** Display a document filename while retaining the full title/path in its serialized content. Legacy ID-only references keep their generic label. */
export declare function draftReferenceName(reference: DraftReference): string;
/** Serialize the exact visible attachment collection only at manual submission. */
export declare function serializeDraftReferences(question: string, references: readonly DraftReference[]): string;
/** Present sent reference blocks as expandable attachments while retaining the exact serialized model input in the Session log. Unrecognized text is preserved. */
export declare function parseSentReferences(text: string): {
    readonly question: string;
    readonly references: readonly DraftReference[];
};

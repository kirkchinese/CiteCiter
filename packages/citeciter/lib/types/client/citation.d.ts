import type { CitationDraft } from '../topic.ts';
import type { CiteSelection } from './types.ts';
interface SourceSelection extends CiteSelection {
    readonly sourceText: string;
}
/** Map rendered Markdown selection context back to one exact raw answer range. */
export declare function normalizeSelectionAgainstAnswer(selection: CiteSelection, answer: string): SourceSelection;
/** Build the browser claim that the Host later checks against one committed model call. */
export declare function createCitationDraft(selection: SourceSelection, assistantMessageSeq: number): Promise<CitationDraft>;
export {};

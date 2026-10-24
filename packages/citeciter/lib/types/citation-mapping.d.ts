/** Rendered selection facts used to resolve one exact Markdown source range. */
export interface CitationTextSelection {
    readonly displayText: string;
    readonly sourceHintText?: string;
    readonly prefixText: string;
    readonly suffixText: string;
}
/** Exact Markdown source range selected from one committed assistant message. */
export interface ResolvedCitationRange {
    readonly startOffset: number;
    readonly endOffset: number;
    readonly sourceText: string;
    readonly prefixText: string;
    readonly suffixText: string;
}
/**
 * Locate a literal textarea selection in authoritative document source text.
 * @param selection - raw selected text and page-local surrounding context.
 * @param content - complete normalized document; offsets use UTF-16 code units.
 * @returns the unique best exact match, retaining Markdown and code punctuation.
 * @throws when the quote is absent or repeated context cannot disambiguate it.
 */
export declare function resolveDocumentRange(selection: CitationTextSelection, content: string): ResolvedCitationRange;
/**
 * Locate a selection made in rendered Markdown, inside the source of the blocks it touched.
 * The reader reports those blocks' source range; searching only there keeps a repeated phrase
 * elsewhere in the document from competing.
 * @param selection - visible selected text and its visible surrounding context.
 * @param content - complete normalized document; offsets use UTF-16 code units.
 * @param blocks - source range of the rendered blocks containing the selection.
 * @returns the exact source range with document-level context.
 */
export declare function resolveRenderedDocumentRange(selection: CitationTextSelection, content: string, blocks: {
    readonly start: number;
    readonly end: number;
}): ResolvedCitationRange;
/** Resolve rendered selection context against authoritative Markdown source. */
export declare function resolveCitationRange(selection: CitationTextSelection, answer: string): ResolvedCitationRange;

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
/** Resolve rendered selection context against authoritative Markdown source. */
export declare function resolveCitationRange(selection: CitationTextSelection, answer: string): ResolvedCitationRange;

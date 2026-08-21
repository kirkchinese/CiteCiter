/** One raw Markdown range that renders as the requested visible text. */
export interface MarkdownSourceCandidate {
    readonly startOffset: number;
    readonly endOffset: number;
    readonly sourceText: string;
    readonly displayPrefix: string;
    readonly displaySuffix: string;
}
/**
 * Locate every GFM source range that renders as one browser-visible selection.
 *
 * @param markdown - committed assistant/message Markdown source.
 * @param displayText - trimmed text returned by the browser Selection.
 * @returns raw ranges plus rendered context for caller-side disambiguation.
 */
export declare function markdownSourceCandidates(markdown: string, displayText: string): readonly MarkdownSourceCandidate[];

/**
 * Safe, presentation-only extraction of CiteCiter rich fences.
 *
 * Markdown remains the default renderer.  Only complete `svg` and `html`
 * fences become dedicated, isolated views; malformed, unsafe, or oversized
 * content is intentionally returned to MarkdownText as an ordinary code
 * fence.
 */
/** One presentation segment derived from an assistant Markdown response. */
export type RichSegment = {
    readonly kind: 'markdown';
    readonly text: string;
} | {
    readonly kind: 'svg';
    readonly source: string;
    readonly dataUrl: string;
} | {
    readonly kind: 'html';
    readonly document: string;
};
/**
 * Split complete safe rich fences from Markdown while preserving all prose.
 * @param text - current assistant response text.
 * @returns ordered Markdown and isolated rich-preview segments.
 */
export declare function splitRichContent(text: string): readonly RichSegment[];
/**
 * Check whether SVG markup is self-contained and non-active.
 * @param source - SVG fence body.
 * @returns whether the source may be rendered as an inert image preview.
 */
export declare function isSafeSvg(source: string): boolean;
/**
 * Build a network-free, script-free iframe document for an HTML fence.
 * @param source - HTML fence body.
 * @returns complete iframe `srcDoc` markup with restrictive CSP metadata.
 */
export declare function isolatedHtmlDocument(source: string): string;

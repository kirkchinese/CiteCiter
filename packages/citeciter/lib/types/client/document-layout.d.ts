/**
 * How the document reader cuts a document into renderable pieces. Pure functions, so the
 * reader can render progressively and still know exactly which source text each piece holds.
 */
/** One rendered piece: a Markdown block or a text line, with its source range and first line. */
export interface DocumentPiece {
    /** UTF-16 offset of the first character. */
    readonly start: number;
    /** UTF-16 offset after the last character, excluding the separating line break. */
    readonly end: number;
    /** One-based line of `start`. */
    readonly line: number;
}
/** Each line of a text document, for the line-numbered view. */
export declare function textLines(content: string): DocumentPiece[];
/**
 * Top-level Markdown blocks: runs of lines separated by blank lines. A fenced code block or a
 * `$$` math block stays whole across blank lines, and an indented line after a blank line
 * continues the block before it, so list items with several paragraphs stay together.
 */
export declare function markdownBlocks(content: string): DocumentPiece[];
/** @returns the index of the piece holding `offset`, or of the last piece starting before it. */
export declare function pieceAt(pieces: readonly DocumentPiece[], offset: number): number;
/**
 * A literal selection trimmed of surrounding whitespace, with its context.
 * @param content - the document text.
 * @param start - selection start offset.
 * @param end - selection end offset.
 * @returns the trimmed range and quote, or null when only whitespace was selected.
 */
export declare function literalSelection(content: string, start: number, end: number): {
    readonly start: number;
    readonly end: number;
    readonly displayText: string;
    readonly prefixText: string;
    readonly suffixText: string;
} | null;

/** A small, bounded line diff for rendering edit payloads that carry old and new text. */
/**
 * Render a unified-style line diff (hunks only, no file headers).
 * @param oldText - previous text.
 * @param newText - replacement text.
 * @param options - context lines around changes and the LCS size limit.
 * @returns hunks text, an empty string when both texts have identical lines, or null when the changed region exceeds the limit.
 */
export declare function unifiedLineDiff(oldText: string, newText: string, options?: {
    readonly context?: number;
    readonly maxCells?: number;
}): string | null;

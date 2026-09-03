/** Reader textarea selection facts resolved from the user-owned textarea value. */
export interface ReaderSelection {
    readonly displayText: string;
    readonly prefixText: string;
    readonly suffixText: string;
}
/**
 * Resolve the current textarea selection into a verifiable document claim.
 * @param textarea - read-only document textarea holding the complete loaded page.
 * @returns trimmed quote with surrounding context, or null for a collapsed/empty selection.
 */
export declare function readTextareaSelection(textarea: HTMLTextAreaElement): ReaderSelection | null;

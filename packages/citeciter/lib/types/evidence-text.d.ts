/** Shared tool-evidence text projections used by Host validation and Client claims. */
/** Tool-result projection kinds carried by a tool EvidenceRef. */
export type ToolEvidenceProjection = 'result-text' | 'terminal' | 'diff';
/** One diff entry inside the opaque `tool/result.meta` written by dsh-tool-fs. */
export interface FileDiffMetaEntry {
    readonly path: string;
    readonly oldText: string | null;
    readonly newText: string;
}
/**
 * Join the text blocks of one tool result into its citable projection.
 * @param blocks - model-facing tool-result content blocks.
 * @returns concatenated text blocks.
 */
export declare function projectToolResultText(blocks: readonly unknown[]): string;
/**
 * Project one diff payload from a tool-result presentation meta.
 * @param meta - opaque tool-result meta carrying an optional `diffs` array.
 * @returns deterministic whole-card diff text, or null when no valid diff exists.
 */
export declare function projectDiffMeta(meta: unknown): string | null;
/**
 * Resolve the citable whole-card projection for one tool result.
 * @param projection - declared evidence projection kind.
 * @param content - model-facing tool-result content blocks.
 * @param meta - opaque presentation meta (diff payload for the diff projection).
 * @returns projection text, or null when the payload cannot satisfy the kind.
 */
export declare function projectToolEvidence(projection: ToolEvidenceProjection, content: readonly unknown[], meta: unknown): string | null;

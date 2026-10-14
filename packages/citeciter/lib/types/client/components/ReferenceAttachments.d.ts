import { type DraftReference } from '../draft-references.ts';
/**
 * Removable draft chips and rendered previews. No model calls or source reads.
 * @param sourceTitle - resolves a source session's display title for its chip.
 */
export declare function ReferenceAttachments({ references, onRemove, sourceTitle }: {
    readonly references: readonly DraftReference[];
    readonly onRemove?: (id: string) => void;
    readonly sourceTitle?: ((sessionId: string) => string | undefined) | undefined;
}): import("react").JSX.Element;

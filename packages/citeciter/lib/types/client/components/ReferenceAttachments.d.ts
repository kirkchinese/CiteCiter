import { type DraftReference } from '../draft-references.ts';
/** Removable draft chips and rendered previews. No model calls or source reads. */
export declare function ReferenceAttachments({ references, onRemove }: {
    readonly references: readonly DraftReference[];
    readonly onRemove?: (id: string) => void;
}): import("react").JSX.Element;

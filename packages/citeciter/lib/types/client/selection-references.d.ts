import { type ActionSource } from './action-controller.ts';
import type { DraftReference } from './draft-references.ts';
/** Capture an actual selected passage and its address; never reconstruct a citation from Topic metadata. */
export declare function selectionReferences(source: ActionSource, documentId?: string): readonly DraftReference[];

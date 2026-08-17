import type { CiteSelection } from './types.ts';
/**
 * Resolve the current DOM selection into a CiteSelection.
 * Returns null for collapsed/empty selections, selections outside a
 * conversation flow node, and selections that do not belong to a settled
 * assistant step (the only kind CiteCiter explains in v1).
 */
export declare function readSelection(event: MouseEvent): CiteSelection | null;

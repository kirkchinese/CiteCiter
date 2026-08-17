import type { CiteSelection } from './types.ts';
/**
 * Resolve the current DOM selection into a CiteSelection.
 * Returns null for collapsed or empty selections, selections outside a
 * conversation flow node, and selections outside an assistant step.
 * @param event - context-menu event whose pointer position anchors the menu.
 * @returns validated selection metadata, or null when CiteCiter should ignore it.
 */
export declare function readSelection(event: MouseEvent): CiteSelection | null;

import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client';
import type { CiteSelection } from './types.ts';
/**
 * Resolve the current DOM selection into a CiteSelection.
 *
 * A Range inside one assistant flow keeps exact visible offsets. A cross-flow
 * Range binds to its final intersected assistant model call while preserving
 * the complete visible quote for the learning UI.
 *
 * @param event - context-menu event whose pointer position anchors the menu.
 * @param sourceSessionId - current session identity captured with the DOM range.
 * @returns validated selection metadata, or null when CiteCiter should ignore it.
 */
export declare function readSelection(event: MouseEvent, sourceSessionId: SessionId): CiteSelection | null;
/**
 * Claim a context menu only after resolving a valid DSH assistant selection.
 *
 * @param event - context-menu event to validate and optionally cancel.
 * @param sourceSessionId - current source session captured with the selection.
 * @returns validated selection metadata, or null while leaving the native menu untouched.
 */
export declare function claimSelectionContextMenu(event: MouseEvent, sourceSessionId: SessionId): CiteSelection | null;

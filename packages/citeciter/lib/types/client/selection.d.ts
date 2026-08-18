import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client';
import type { CiteSelection } from './types.ts';
/**
 * Resolve the current DOM selection into a CiteSelection.
 *
 * The complete Range must belong to one finalized assistant flow. The returned
 * offsets are measured against that flow's plain text and adjusted after
 * trimming, so identical quotations at different locations remain distinct.
 *
 * @param event - context-menu event whose pointer position anchors the menu.
 * @param sourceSessionId - current session identity captured with the DOM range.
 * @returns validated selection metadata, or null when CiteCiter should ignore it.
 */
export declare function readSelection(event: MouseEvent, sourceSessionId: SessionId): CiteSelection | null;

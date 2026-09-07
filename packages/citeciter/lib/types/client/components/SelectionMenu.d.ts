import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store';
import type { CiteOverlaySnapshot } from '../types.ts';
import type { CompanionSnapshot } from '../companion-controller.ts';
import type { CompanionActions, OverlayActions } from '../view-actions.ts';
export interface SelectionMenuProps {
    readonly useCompanion: SnapshotSelectorHook<CompanionSnapshot>;
    readonly useOverlay: SnapshotSelectorHook<CiteOverlaySnapshot>;
    readonly bus: OverlayActions;
    readonly companion: CompanionActions;
    readonly openPanel: () => void;
}
/**
 * Ask the first question beside the selected source text.
 * @param props - shared selection state and Topic actions.
 * @returns the contextual creation popover and companion launcher.
 */
export declare function SelectionMenu({ useCompanion, useOverlay, bus, companion, openPanel }: SelectionMenuProps): import("react").JSX.Element;

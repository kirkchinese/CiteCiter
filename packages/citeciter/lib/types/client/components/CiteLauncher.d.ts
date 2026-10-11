import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store';
import type { CiteOverlaySnapshot } from '../types.ts';
import type { CompanionSnapshot } from '../companion-controller.ts';
import type { CompanionActions } from '../view-actions.ts';
/**
 * Entry back to Citer while its panel is closed. While an answer is still running it keeps
 * the Topic refreshing, so the pet can mark the finished answer; opening Citer clears the mark.
 */
export declare function CiteLauncher({ useCompanion, useOverlay, companion, openPanel }: {
    useCompanion: SnapshotSelectorHook<CompanionSnapshot>;
    useOverlay: SnapshotSelectorHook<CiteOverlaySnapshot>;
    companion: CompanionActions;
    openPanel: () => void;
}): import("react").JSX.Element | null;

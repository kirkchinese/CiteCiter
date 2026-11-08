import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store';
import type { CiteOverlaySnapshot } from '../types.ts';
import type { CompanionSnapshot } from '../companion-controller.ts';
import type { CompanionActions, TeacherActions } from '../view-actions.ts';
/**
 * Entry back to Citer while its panel is closed. While an answer is still running it keeps
 * the Topic refreshing, so the pet can mark the finished answer; opening Citer clears the mark.
 * Teacher mode's offer speaks from the pet.
 */
export declare function CiteLauncher({ useCompanion, useOverlay, companion, openPanel, teacher }: {
    useCompanion: SnapshotSelectorHook<CompanionSnapshot>;
    useOverlay: SnapshotSelectorHook<CiteOverlaySnapshot>;
    companion: CompanionActions;
    openPanel: () => void;
    teacher: TeacherActions;
}): import("react").JSX.Element | null;

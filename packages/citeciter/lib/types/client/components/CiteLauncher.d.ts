import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store';
import type { CiteOverlaySnapshot } from '../types.ts';
import type { CompanionSnapshot } from '../companion-controller.ts';
/** Independent entry back to the current learning workspace; owns no selection state. */
export declare function CiteLauncher({ useCompanion, useOverlay, openPanel }: {
    useCompanion: SnapshotSelectorHook<CompanionSnapshot>;
    useOverlay: SnapshotSelectorHook<CiteOverlaySnapshot>;
    openPanel: () => void;
}): import("react").JSX.Element | null;

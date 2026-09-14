import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store';
import type { ReaderSnapshot } from '../reader-controller.ts';
import type { CiteOverlaySnapshot } from '../types.ts';
import type { ReaderActions } from '../view-actions.ts';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { SelectionSurfaces } from '../wheel-gesture.ts';
/** Reader shell-overlay entry: compact trigger plus the document library panel. */
export declare function DocumentReader({ reader, useReader, useOverlay, registerSurface, sourceSessionId }: {
    readonly reader: ReaderActions;
    readonly useReader: SnapshotSelectorHook<ReaderSnapshot>;
    readonly useOverlay: SnapshotSelectorHook<CiteOverlaySnapshot>;
    readonly registerSurface: SelectionSurfaces['register'];
    readonly sourceSessionId: () => SessionId | null;
}): import("react").JSX.Element;

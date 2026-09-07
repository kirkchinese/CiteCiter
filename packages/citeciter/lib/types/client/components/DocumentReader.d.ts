import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store';
import type { ReaderSnapshot } from '../reader-controller.ts';
import type { ReaderActions } from '../view-actions.ts';
/** Reader shell-overlay entry: compact trigger plus the document library panel. */
export declare function DocumentReader({ reader, useReader }: {
    readonly reader: ReaderActions;
    readonly useReader: SnapshotSelectorHook<ReaderSnapshot>;
}): import("react").JSX.Element;

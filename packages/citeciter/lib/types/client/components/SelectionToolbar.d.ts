import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store';
import { type CiteAction } from '../../actions.ts';
import type { ActionSource } from '../action-controller.ts';
import type { CompanionSnapshot } from '../companion-controller.ts';
import type { SelectionToolbarSnapshot } from '../selection-toolbar.ts';
/** The explicit way to start a separate Topic: the user's own question about the selection. */
/** Toolbar callbacks; the controllers stay with the Client plugin. */
export interface SelectionToolbarActions {
    readonly dismiss: () => void;
    readonly run: (source: ActionSource, action: CiteAction, x: number, y: number, newTopic?: boolean) => void;
    readonly quote: (source: ActionSource) => Promise<void>;
}
/**
 * Actions for the current selection: the first configured actions inline, the rest and
 * "新 Topic" under a menu. Pressing a button never moves focus or clears the selection first.
 */
export declare function SelectionToolbar({ useToolbar, useCompanion, toolbar }: {
    readonly useToolbar: SnapshotSelectorHook<SelectionToolbarSnapshot>;
    readonly useCompanion: SnapshotSelectorHook<CompanionSnapshot>;
    readonly toolbar: SelectionToolbarActions;
}): import("react").JSX.Element | null;

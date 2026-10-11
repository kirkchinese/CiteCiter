import type { ActionSource } from './action-controller.ts';
/** Where a settled selection ends, in viewport coordinates. */
export interface SelectionAnchor {
    readonly x: number;
    readonly top: number;
    readonly bottom: number;
}
/** The toolbar's subject: one captured selection and the place to show actions for it. */
export interface SelectionToolbarSnapshot {
    current: {
        readonly source: ActionSource;
        readonly anchor: SelectionAnchor;
    } | null;
}
/** Resolvers for the two kinds of selection the toolbar can follow. */
export interface SelectionReaders {
    /** A DOM text range: conversation entries and registered surfaces. */
    readonly range: (event: MouseEvent) => ActionSource | null;
    /** A selection kept inside a registered read-only control, such as the reader's textarea. */
    readonly surface: (event: MouseEvent) => ActionSource | null;
}
/**
 * Show Citer actions next to a settled text selection. It never claims the native context
 * menu and never changes the selection; the selection is captured when the toolbar appears.
 * A plain click never shows it: conversation entries are consulted only for a real text range.
 * @param readers - resolve a pointer-like event to a citable source, or null when Citer does not own it.
 * @param enabled - the user's toolbar preference, read on every selection.
 * @returns the toolbar snapshot store, `dismiss()` and a `dispose()` that removes every listener.
 */
export declare function installSelectionToolbar(readers: SelectionReaders, enabled: () => boolean): {
    getSnapshot: () => SelectionToolbarSnapshot;
    subscribe: (fn: () => void) => () => void;
    dismiss: () => void;
    dispose(): void;
};
export type SelectionToolbarController = ReturnType<typeof installSelectionToolbar>;

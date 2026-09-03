/** CiteCiter-owned accelerator parsing and listener installation. */
export interface Accelerator {
    readonly modifiers: ReadonlySet<'Control' | 'Alt' | 'Shift' | 'Meta'>;
    readonly key: string;
}
/**
 * Parse a `Modifier+Modifier+Key` accelerator string.
 * @param accelerator - user-configured accelerator, e.g. `Control+Shift+C`.
 * @returns normalized modifiers and the final key, or null when malformed.
 */
export declare function parseAccelerator(accelerator: string): Accelerator | null;
/**
 * Install a window-level keydown listener that reads the accelerator fresh on
 * every keypress, so settings changes apply without re-registering.
 * @param accelerator - current accelerator getter; an empty value disables the binding.
 * @param handler - invoked once for each matching, non-editable, non-IME keypress.
 * @returns disposer removing the listener.
 */
export declare function installDynamicAccelerator(accelerator: () => string | undefined, handler: () => void): () => void;

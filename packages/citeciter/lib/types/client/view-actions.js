/**
 * Remove lifecycle and subscription methods from a plain controller's view props.
 * @param controller - Client-owned controller with arrow-function callbacks.
 * @returns callbacks separate from the observable supplied to inject.hooks.
 */
export function viewActions(controller) {
    const { getSnapshot, subscribe, dispose, ...actions } = controller;
    return actions;
}

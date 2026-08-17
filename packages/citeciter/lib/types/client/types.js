/** Observable selection state shared by the overlay and details panel. */
export class CiteBus {
    reportListenerError;
    menuSelection = null;
    panelSelection = null;
    listeners = new Set();
    /** @param reportListenerError - isolates and reports one failed subscriber. */
    constructor(reportListenerError) {
        this.reportListenerError = reportListenerError;
    }
    /** @returns current context-menu selection, or null while hidden. */
    getMenuSelection() {
        return this.menuSelection;
    }
    /** @returns selection currently explained in the details panel. */
    getPanelSelection() {
        return this.panelSelection;
    }
    /** @param selection - next context-menu selection, or null to hide it. */
    setMenuSelection(selection) {
        if (this.menuSelection === selection)
            return;
        this.menuSelection = selection;
        this.notify();
    }
    /** @param selection - next details-panel selection, or null when closed. */
    setPanelSelection(selection) {
        if (this.panelSelection === selection)
            return;
        this.panelSelection = selection;
        this.notify();
    }
    /**
     * Subscribe to either selection value.
     * @param listener - callback invoked after a value changes.
     * @returns disposer for this subscription.
     */
    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
    notify() {
        for (const listener of [...this.listeners]) {
            try {
                listener();
            }
            catch (error) {
                this.reportListenerError(error);
            }
        }
    }
}

/** Tiny observable state shared by the selection popover and independent dock. */
export class CiteBus {
    reportListenerError;
    snapshot = { menuSelection: null, panelOpen: false };
    listeners = new Set();
    /** @param reportListenerError - contains one failed browser subscriber. */
    constructor(reportListenerError) {
        this.reportListenerError = reportListenerError;
    }
    /** @returns stable overlay snapshot. */
    getSnapshot = () => this.snapshot;
    /** @param listener - observer. @returns disposer. */
    subscribe = (listener) => {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    };
    /** Show or dismiss the selection question popover. */
    setMenuSelection(selection) {
        if (this.snapshot.menuSelection === selection)
            return;
        this.snapshot = { ...this.snapshot, menuSelection: selection };
        this.notify();
    }
    /** Open or close the independent companion dock. */
    setPanelOpen(panelOpen) {
        if (this.snapshot.panelOpen === panelOpen)
            return;
        this.snapshot = { ...this.snapshot, panelOpen };
        this.notify();
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

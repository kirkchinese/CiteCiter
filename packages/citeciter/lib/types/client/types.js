export class CiteBus {
    menuSelection = null;
    panelSelection = null;
    listeners = new Set();
    getMenuSelection() {
        return this.menuSelection;
    }
    getPanelSelection() {
        return this.panelSelection;
    }
    setMenuSelection(selection) {
        if (this.menuSelection === selection)
            return;
        this.menuSelection = selection;
        this.notify();
    }
    setPanelSelection(selection) {
        if (this.panelSelection === selection)
            return;
        this.panelSelection = selection;
        this.notify();
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
    notify() {
        for (const listener of [...this.listeners])
            listener();
    }
}

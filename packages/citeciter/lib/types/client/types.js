/** Tiny observable state shared by the selection popover and independent dock. */
export class CiteBus {
    reportListenerError;
    snapshot = { menuSelection: null, panelOpen: false, boardCitation: null };
    listeners = new Set();
    nextCitationId = 1;
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
    /**
     * Queue one user-requested board reference for the matching Topic composer.
     * @param topicSessionId - Topic that owns the referenced board.
     * @param prompt - composer text derived from the selected board element.
     */
    requestBoardCitation(topicSessionId, prompt) {
        this.snapshot = {
            ...this.snapshot,
            boardCitation: { id: this.nextCitationId++, topicSessionId, prompt },
        };
        this.notify();
    }
    /**
     * Clear the citation only when the matching consumer handled it.
     * @param id - monotonically assigned citation request identity.
     */
    clearBoardCitation(id) {
        if (this.snapshot.boardCitation?.id !== id)
            return;
        this.snapshot = { ...this.snapshot, boardCitation: null };
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

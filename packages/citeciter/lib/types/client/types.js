/** Observable panel presentation and board-citation requests; gestures have their own controller. */
export class CiteBus {
    reportListenerError;
    snapshot = { panelOpen: false, activation: 0, presentation: 'side', boardCitation: null };
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
    /** Open or close the independent companion dock. */
    setPanelOpen(panelOpen) {
        if (!panelOpen && !this.snapshot.panelOpen)
            return;
        this.snapshot = { ...this.snapshot, panelOpen, activation: this.snapshot.activation + (panelOpen ? 1 : 0) };
        this.notify();
    }
    /** Change only the current workspace presentation, keeping its Topic and drafts. */
    setPresentation(presentation) {
        if (this.snapshot.presentation === presentation)
            return;
        this.snapshot = { ...this.snapshot, presentation };
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
            boardCitation: { id: crypto.randomUUID(), topicSessionId, prompt },
        };
        this.notify();
    }
    /**
     * Clear the citation only when the matching consumer handled it.
     * @param id - exact request identity, unique across windows and draft restoration.
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

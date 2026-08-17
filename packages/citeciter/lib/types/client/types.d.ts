/** One validated right-click selection inside a conversation flow node. */
export interface CiteSelection {
    /** Selected plain text (already trimmed; display may truncate separately). */
    readonly text: string;
    /** Flow kind of the DOM node that owns the selection. */
    readonly kind: 'assistant-step';
    /** Conversation snapshot node key (`data-chat-anchor-key`). */
    readonly anchorKey: string;
    /** Horizontal pointer position for the floating menu, in client coordinates. */
    readonly x: number;
    /** Vertical pointer position for the floating menu, in client coordinates. */
    readonly y: number;
}
/** Minimal observable bus shared by the menu and the side panel. */
export type CiteBusListener = () => void;
/** Observable selection state shared by the overlay and details panel. */
export declare class CiteBus {
    private readonly reportListenerError;
    private menuSelection;
    private panelSelection;
    private readonly listeners;
    /** @param reportListenerError - isolates and reports one failed subscriber. */
    constructor(reportListenerError: (error: unknown) => void);
    /** @returns current context-menu selection, or null while hidden. */
    getMenuSelection(): CiteSelection | null;
    /** @returns selection currently explained in the details panel. */
    getPanelSelection(): CiteSelection | null;
    /** @param selection - next context-menu selection, or null to hide it. */
    setMenuSelection(selection: CiteSelection | null): void;
    /** @param selection - next details-panel selection, or null when closed. */
    setPanelSelection(selection: CiteSelection | null): void;
    /**
     * Subscribe to either selection value.
     * @param listener - callback invoked after a value changes.
     * @returns disposer for this subscription.
     */
    subscribe(listener: CiteBusListener): () => void;
    private notify;
}

/** One validated right-click selection inside a conversation flow node. */
export interface CiteSelection {
    /** Selected plain text (already trimmed; display may truncate separately). */
    readonly text: string;
    /** Flow kind of the DOM node that owns the selection. */
    readonly kind: string;
    /** Conversation snapshot node key (`data-chat-anchor-key`). */
    readonly anchorKey: string;
    /** Pointer position for the floating menu, in client coordinates. */
    readonly x: number;
    readonly y: number;
}
/** Minimal observable bus shared by the menu and the side panel. */
export type CiteBusListener = () => void;
export declare class CiteBus {
    private menuSelection;
    private panelSelection;
    private readonly listeners;
    getMenuSelection(): CiteSelection | null;
    getPanelSelection(): CiteSelection | null;
    setMenuSelection(selection: CiteSelection | null): void;
    setPanelSelection(selection: CiteSelection | null): void;
    subscribe(listener: CiteBusListener): () => void;
    private notify;
}

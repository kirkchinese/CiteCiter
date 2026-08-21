import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client';
/** One right-click selection inside a rendered assistant model call. */
export interface CiteSelection {
    readonly sourceSessionId: SessionId;
    readonly displayText: string;
    readonly kind: 'assistant-step';
    readonly anchorKey: string;
    readonly startOffset: number;
    readonly endOffset: number;
    readonly prefixText: string;
    readonly suffixText: string;
    readonly x: number;
    readonly y: number;
}
export interface CiteOverlaySnapshot {
    readonly menuSelection: CiteSelection | null;
    readonly panelOpen: boolean;
}
/** Tiny observable state shared by the selection popover and independent dock. */
export declare class CiteBus {
    private readonly reportListenerError;
    private snapshot;
    private readonly listeners;
    /** @param reportListenerError - contains one failed browser subscriber. */
    constructor(reportListenerError: (error: unknown) => void);
    /** @returns stable overlay snapshot. */
    getSnapshot: () => CiteOverlaySnapshot;
    /** @param listener - observer. @returns disposer. */
    subscribe: (listener: () => void) => (() => void);
    /** Show or dismiss the selection question popover. */
    setMenuSelection(selection: CiteSelection | null): void;
    /** Open or close the independent companion dock. */
    setPanelOpen(panelOpen: boolean): void;
    private notify;
}

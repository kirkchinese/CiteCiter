import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { ToolEvidenceProjection } from '../evidence-text.ts';
import type { PanelPresentation } from '../actions.ts';
/** One right-click selection inside a rendered assistant model call. */
export interface AssistantCiteSelection {
    readonly entryId: 'citeciter.entry.assistant';
    readonly sourceSessionId: SessionId;
    readonly displayText: string;
    readonly sourceHintText?: string;
    readonly kind: 'assistant-step';
    readonly anchorKey: string;
    readonly startOffset: number;
    readonly endOffset: number;
    readonly prefixText: string;
    readonly suffixText: string;
    readonly x: number;
    readonly y: number;
}
/** One right-click whole-card selection on a committed tool result. */
export interface ToolCiteSelection {
    readonly entryId: 'citeciter.entry.tool';
    readonly sourceSessionId: SessionId;
    readonly displayText: string;
    readonly kind: 'tool-result';
    readonly callId: string;
    readonly projection: ToolEvidenceProjection;
    readonly anchorKey: string;
    readonly x: number;
    readonly y: number;
}
/** One validated selection claimed by a CiteCiter client entry point. */
export type CiteSelection = AssistantCiteSelection | ToolCiteSelection;
/** One explicit request to append a blackboard reference to the Topic composer. */
export interface BoardCitationRequest {
    readonly id: string;
    readonly topicSessionId: string;
    readonly prompt: string;
}
export interface CiteOverlaySnapshot {
    /** Visible: the docked overlay is open, or the right-sidebar tab is on screen. */
    readonly panelOpen: boolean;
    /** Where the workspace lives: DSH's right sidebar, or Citer's own overlay. */
    readonly host: 'overlay' | 'tab';
    /** Whether the host offers DSH's right sidebar, so the user can choose between the two. */
    readonly sidebarAvailable: boolean;
    /** Explicit navigation request, including reopening a temporarily covered panel. */
    readonly activation: number;
    readonly presentation: PanelPresentation;
    readonly boardCitation: BoardCitationRequest | null;
    /** The library document Citer's own panel shows, when documents cannot open in the sidebar. */
    readonly document: PanelDocument | null;
}
/** A document shown in Citer's own panel; `revision` changes on every request to show it. */
export interface PanelDocument {
    readonly documentId: string;
    readonly offset?: number;
    readonly revision: number;
}
/** Observable panel presentation and board-citation requests; gestures have their own controller. */
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
    /** Open or close the independent companion dock. */
    setPanelOpen(panelOpen: boolean): void;
    private visibleTabs;
    /**
     * Count one Citer sidebar tab on screen. Several can be (split panes, a floating copy); Citer
     * stays open until the last of them is hidden or closed.
     * @returns release, idempotent.
     */
    holdTabVisible(): () => void;
    /** Show a library document in Citer's own panel, scrolled to `offset` when given. */
    showDocument(documentId: string, offset?: number): void;
    /** Close the document shown in Citer's own panel. */
    closeDocument(): void;
    /** Record whether the host offers DSH's right sidebar. */
    setSidebarAvailable(sidebarAvailable: boolean): void;
    /** Move the workspace between Citer's overlay and DSH's right sidebar; the overlay closes when the sidebar takes over. */
    setHost(host: CiteOverlaySnapshot['host']): void;
    /** Change only the current workspace presentation, keeping its Topic and drafts. */
    setPresentation(presentation: PanelPresentation): void;
    /**
     * Queue one user-requested board reference for the matching Topic composer.
     * @param topicSessionId - Topic that owns the referenced board.
     * @param prompt - composer text derived from the selected board element.
     */
    requestBoardCitation(topicSessionId: string, prompt: string): void;
    /**
     * Clear the citation only when the matching consumer handled it.
     * @param id - exact request identity, unique across windows and draft restoration.
     */
    clearBoardCitation(id: string): void;
    private notify;
}

import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { ToolEvidenceProjection } from '../evidence-text.ts'
import type { PanelPresentation } from '../actions.ts'

/** One right-click selection inside a rendered assistant model call. */
export interface AssistantCiteSelection {
  readonly entryId: 'citeciter.entry.assistant'
  readonly sourceSessionId: SessionId
  readonly displayText: string
  readonly sourceHintText?: string
  readonly kind: 'assistant-step'
  readonly anchorKey: string
  readonly startOffset: number
  readonly endOffset: number
  readonly prefixText: string
  readonly suffixText: string
  readonly x: number
  readonly y: number
}

/** One right-click whole-card selection on a committed tool result. */
export interface ToolCiteSelection {
  readonly entryId: 'citeciter.entry.tool'
  readonly sourceSessionId: SessionId
  readonly displayText: string
  readonly kind: 'tool-result'
  readonly callId: string
  readonly projection: ToolEvidenceProjection
  readonly anchorKey: string
  readonly x: number
  readonly y: number
}

/** One validated selection claimed by a CiteCiter client entry point. */
export type CiteSelection = AssistantCiteSelection | ToolCiteSelection

/** One explicit request to append a blackboard reference to the Topic composer. */
export interface BoardCitationRequest {
  readonly id: string
  readonly topicSessionId: string
  readonly prompt: string
}

export interface CiteOverlaySnapshot {
  readonly panelOpen: boolean
  /** Explicit navigation request, including reopening a temporarily covered panel. */
  readonly activation: number
  readonly presentation: PanelPresentation
  readonly boardCitation: BoardCitationRequest | null
}

/** Observable panel presentation and board-citation requests; gestures have their own controller. */
export class CiteBus {
  private snapshot: CiteOverlaySnapshot = { panelOpen: false, activation: 0, presentation: 'side', boardCitation: null }
  private readonly listeners = new Set<() => void>()

  /** @param reportListenerError - contains one failed browser subscriber. */
  constructor(private readonly reportListenerError: (error: unknown) => void) {}

  /** @returns stable overlay snapshot. */
  getSnapshot = (): CiteOverlaySnapshot => this.snapshot

  /** @param listener - observer. @returns disposer. */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /** Open or close the independent companion dock. */
  setPanelOpen(panelOpen: boolean): void {
    if (!panelOpen && !this.snapshot.panelOpen) return
    this.snapshot = { ...this.snapshot, panelOpen, activation: this.snapshot.activation + (panelOpen ? 1 : 0) }
    this.notify()
  }

  /** Change only the current workspace presentation, keeping its Topic and drafts. */
  setPresentation(presentation: PanelPresentation): void {
    if (this.snapshot.presentation === presentation) return
    this.snapshot = { ...this.snapshot, presentation }
    this.notify()
  }

  /**
   * Queue one user-requested board reference for the matching Topic composer.
   * @param topicSessionId - Topic that owns the referenced board.
   * @param prompt - composer text derived from the selected board element.
   */
  requestBoardCitation(topicSessionId: string, prompt: string): void {
    this.snapshot = {
      ...this.snapshot,
      boardCitation: { id: crypto.randomUUID(), topicSessionId, prompt },
    }
    this.notify()
  }

  /**
   * Clear the citation only when the matching consumer handled it.
   * @param id - exact request identity, unique across windows and draft restoration.
   */
  clearBoardCitation(id: string): void {
    if (this.snapshot.boardCitation?.id !== id) return
    this.snapshot = { ...this.snapshot, boardCitation: null }
    this.notify()
  }

  private notify(): void {
    for (const listener of [...this.listeners]) {
      try {
        listener()
      } catch (error) {
        this.reportListenerError(error)
      }
    }
  }
}

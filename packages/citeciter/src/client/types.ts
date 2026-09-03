import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type { ToolEvidenceProjection } from '../evidence-text.ts'

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
  readonly id: number
  readonly topicSessionId: string
  readonly prompt: string
}

export interface CiteOverlaySnapshot {
  readonly menuSelection: CiteSelection | null
  readonly panelOpen: boolean
  readonly boardCitation: BoardCitationRequest | null
}

/** Tiny observable state shared by the selection popover and independent dock. */
export class CiteBus {
  private snapshot: CiteOverlaySnapshot = { menuSelection: null, panelOpen: false, boardCitation: null }
  private readonly listeners = new Set<() => void>()
  private nextCitationId = 1

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

  /** Show or dismiss the selection question popover. */
  setMenuSelection(selection: CiteSelection | null): void {
    if (this.snapshot.menuSelection === selection) return
    this.snapshot = { ...this.snapshot, menuSelection: selection }
    this.notify()
  }

  /** Open or close the independent companion dock. */
  setPanelOpen(panelOpen: boolean): void {
    if (this.snapshot.panelOpen === panelOpen) return
    this.snapshot = { ...this.snapshot, panelOpen }
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
      boardCitation: { id: this.nextCitationId++, topicSessionId, prompt },
    }
    this.notify()
  }

  /**
   * Clear the citation only when the matching consumer handled it.
   * @param id - monotonically assigned citation request identity.
   */
  clearBoardCitation(id: number): void {
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

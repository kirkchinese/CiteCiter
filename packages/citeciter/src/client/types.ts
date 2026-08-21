import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'

/** One right-click selection inside a rendered assistant model call. */
export interface CiteSelection {
  readonly sourceSessionId: SessionId
  readonly displayText: string
  readonly kind: 'assistant-step'
  readonly anchorKey: string
  readonly startOffset: number
  readonly endOffset: number
  readonly prefixText: string
  readonly suffixText: string
  readonly x: number
  readonly y: number
}

export interface CiteOverlaySnapshot {
  readonly menuSelection: CiteSelection | null
  readonly panelOpen: boolean
}

/** Tiny observable state shared by the selection popover and independent dock. */
export class CiteBus {
  private snapshot: CiteOverlaySnapshot = { menuSelection: null, panelOpen: false }
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

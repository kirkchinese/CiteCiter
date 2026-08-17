/** One validated right-click selection inside a conversation flow node. */
export interface CiteSelection {
  /** Selected plain text (already trimmed; display may truncate separately). */
  readonly text: string
  /** Flow kind of the DOM node that owns the selection. */
  readonly kind: 'assistant-step'
  /** Conversation snapshot node key (`data-chat-anchor-key`). */
  readonly anchorKey: string
  /** Horizontal pointer position for the floating menu, in client coordinates. */
  readonly x: number
  /** Vertical pointer position for the floating menu, in client coordinates. */
  readonly y: number
}

/** Minimal observable bus shared by the menu and the side panel. */
export type CiteBusListener = () => void

/** Observable selection state shared by the overlay and details panel. */
export class CiteBus {
  private menuSelection: CiteSelection | null = null
  private panelSelection: CiteSelection | null = null
  private readonly listeners = new Set<CiteBusListener>()

  /** @param reportListenerError - isolates and reports one failed subscriber. */
  constructor(private readonly reportListenerError: (error: unknown) => void) {}

  /** @returns current context-menu selection, or null while hidden. */
  getMenuSelection(): CiteSelection | null {
    return this.menuSelection
  }

  /** @returns selection currently explained in the details panel. */
  getPanelSelection(): CiteSelection | null {
    return this.panelSelection
  }

  /** @param selection - next context-menu selection, or null to hide it. */
  setMenuSelection(selection: CiteSelection | null): void {
    if (this.menuSelection === selection) return
    this.menuSelection = selection
    this.notify()
  }

  /** @param selection - next details-panel selection, or null when closed. */
  setPanelSelection(selection: CiteSelection | null): void {
    if (this.panelSelection === selection) return
    this.panelSelection = selection
    this.notify()
  }

  /**
   * Subscribe to either selection value.
   * @param listener - callback invoked after a value changes.
   * @returns disposer for this subscription.
   */
  subscribe(listener: CiteBusListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
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

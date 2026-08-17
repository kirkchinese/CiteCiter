/** One validated right-click selection inside a conversation flow node. */
export interface CiteSelection {
  /** Selected plain text (already trimmed; display may truncate separately). */
  readonly text: string
  /** Flow kind of the DOM node that owns the selection. */
  readonly kind: string
  /** Conversation snapshot node key (`data-chat-anchor-key`). */
  readonly anchorKey: string
  /** Pointer position for the floating menu, in client coordinates. */
  readonly x: number
  readonly y: number
}

/** Minimal observable bus shared by the menu and the side panel. */
export type CiteBusListener = () => void

export class CiteBus {
  private menuSelection: CiteSelection | null = null
  private panelSelection: CiteSelection | null = null
  private readonly listeners = new Set<CiteBusListener>()

  getMenuSelection(): CiteSelection | null {
    return this.menuSelection
  }

  getPanelSelection(): CiteSelection | null {
    return this.panelSelection
  }

  setMenuSelection(selection: CiteSelection | null): void {
    if (this.menuSelection === selection) return
    this.menuSelection = selection
    this.notify()
  }

  setPanelSelection(selection: CiteSelection | null): void {
    if (this.panelSelection === selection) return
    this.panelSelection = selection
    this.notify()
  }

  subscribe(listener: CiteBusListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify(): void {
    for (const listener of [...this.listeners]) listener()
  }
}

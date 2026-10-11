import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { ActionSource } from './action-controller.ts'

/** Where a settled selection ends, in viewport coordinates. */
export interface SelectionAnchor {
  readonly x: number
  readonly top: number
  readonly bottom: number
}

/** The toolbar's subject: one captured selection and the place to show actions for it. */
export interface SelectionToolbarSnapshot {
  current: { readonly source: ActionSource, readonly anchor: SelectionAnchor } | null
}

const BLOCKED = '[data-citeciter-menu], [data-citeciter-toolbar], [role="dialog"][aria-modal="true"]'
const EDITABLE = 'input, textarea:not([readonly]), [contenteditable="true"], [contenteditable="plaintext-only"]'

function elementOf(node: Node | null): Element | null {
  return node === null ? null : node instanceof Element ? node : node.parentElement
}

/** The end of the selected range, matching the anchor that `readSelection` binds cross-flow ranges to. */
function rangeAnchor(range: Range): { readonly target: Element | null, readonly anchor: SelectionAnchor } | null {
  const rects = [...range.getClientRects()].filter(rect => rect.width > 0 || rect.height > 0)
  const last = rects.at(-1) ?? range.getBoundingClientRect()
  if (last.width === 0 && last.height === 0) return null
  return { target: elementOf(range.endContainer), anchor: { x: last.right, top: last.top, bottom: last.bottom } }
}

/** Resolvers for the two kinds of selection the toolbar can follow. */
export interface SelectionReaders {
  /** A DOM text range: conversation entries and registered surfaces. */
  readonly range: (event: MouseEvent) => ActionSource | null
  /** A selection kept inside a registered read-only control, such as the reader's textarea. */
  readonly surface: (event: MouseEvent) => ActionSource | null
}

/**
 * Show Citer actions next to a settled text selection. It never claims the native context
 * menu and never changes the selection; the selection is captured when the toolbar appears.
 * A plain click never shows it: conversation entries are consulted only for a real text range.
 * @param readers - resolve a pointer-like event to a citable source, or null when Citer does not own it.
 * @param enabled - the user's toolbar preference, read on every selection.
 * @returns the toolbar snapshot store, `dismiss()` and a `dispose()` that removes every listener.
 */
export function installSelectionToolbar(readers: SelectionReaders, enabled: () => boolean) {
  const store = createSnapshotStore<SelectionToolbarSnapshot>({ current: null })
  let pending: ReturnType<typeof setTimeout> | undefined
  // Where the shown selection lives; only scrolling that moves it makes the toolbar stale.
  let anchorNode: Node | null = null
  const dismiss = () => {
    clearTimeout(pending)
    anchorNode = null
    if (store.getSnapshot().current !== null) store.update(draft => { draft.current = null })
  }
  const show = (source: ActionSource, anchor: SelectionAnchor, node: Node) => {
    anchorNode = node
    store.update(draft => { draft.current = { source, anchor } })
  }
  const evaluate = (origin: EventTarget | null, pointer: { readonly x: number, readonly y: number } | null) => {
    if (!enabled()) return dismiss()
    const originElement = origin instanceof Node ? elementOf(origin) : null
    if (originElement?.closest(BLOCKED) != null) return
    const selection = window.getSelection()
    const range = selection !== null && !selection.isCollapsed && selection.rangeCount > 0 ? selection.getRangeAt(0) : null
    // Registered read-only surfaces, such as the document reader's textarea, own their selection.
    const surfaceSelection = range === null && originElement !== null && originElement.closest(EDITABLE) === null && pointer !== null
    if (range === null && !surfaceSelection) return dismiss()
    if (range !== null && elementOf(range.commonAncestorContainer)?.closest(`${EDITABLE}, ${BLOCKED}`) != null) return dismiss()
    const located = range === null ? null : rangeAnchor(range)
    const target = located?.target ?? originElement
    const anchor = located?.anchor ?? (pointer === null ? null : { x: pointer.x, top: pointer.y, bottom: pointer.y })
    if (target === null || anchor === null) return dismiss()
    const synthetic = { target, clientX: anchor.x, clientY: anchor.bottom, preventDefault: () => {} } as unknown as MouseEvent
    const source = range === null ? readers.surface(synthetic) : readers.range(synthetic)
    if (source === null) return dismiss()
    show(source, anchor, range?.commonAncestorContainer ?? target)
  }
  // Read the selection after the browser has finished updating it for this gesture.
  // A timer still runs in an occluded window, where animation frames are paused.
  const settle = (origin: EventTarget | null, pointer: { readonly x: number, readonly y: number } | null) => {
    clearTimeout(pending)
    pending = setTimeout(() => evaluate(origin, pointer), 0)
  }
  const down = (event: PointerEvent) => {
    if (event.target instanceof Element && event.target.closest('[data-citeciter-toolbar]') !== null) return
    dismiss()
  }
  const up = (event: PointerEvent) => {
    if (event.button !== 0) return
    settle(event.target, { x: event.clientX, y: event.clientY })
  }
  const keyup = (event: KeyboardEvent) => {
    if (event.key === 'Shift' || (event.shiftKey && event.key.startsWith('Arrow')) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a')) settle(document.activeElement, null)
  }
  const keydown = (event: KeyboardEvent) => { if (event.key === 'Escape') dismiss() }
  const selectionChange = () => {
    const current = store.getSnapshot().current
    if (current === null || current.source.kind === 'document') return
    if (window.getSelection()?.isCollapsed !== false) dismiss()
  }
  const scroll = (event: Event) => {
    if (anchorNode === null) return
    // Scrolling elsewhere, such as the Citer transcript refreshing, leaves the toolbar in place.
    if (event.target === document || (event.target instanceof Node && event.target.contains(anchorNode))) dismiss()
  }
  document.addEventListener('pointerdown', down, true)
  document.addEventListener('pointerup', up)
  document.addEventListener('keyup', keyup)
  document.addEventListener('keydown', keydown)
  document.addEventListener('selectionchange', selectionChange)
  document.addEventListener('scroll', scroll, true)
  window.addEventListener('resize', dismiss)
  return {
    getSnapshot: store.getSnapshot,
    subscribe: store.subscribe,
    dismiss,
    dispose() {
      dismiss()
      document.removeEventListener('pointerdown', down, true)
      document.removeEventListener('pointerup', up)
      document.removeEventListener('keyup', keyup)
      document.removeEventListener('keydown', keydown)
      document.removeEventListener('selectionchange', selectionChange)
      document.removeEventListener('scroll', scroll, true)
      window.removeEventListener('resize', dismiss)
    },
  }
}
export type SelectionToolbarController = ReturnType<typeof installSelectionToolbar>

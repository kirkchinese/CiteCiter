import { DEFAULT_WHEEL_SLOTS, type CiteAction, type WheelTrigger } from '../actions.ts'
import type { ActionController, ActionSource } from './action-controller.ts'

/** Owned reading surfaces provide captures without probing other plugins' private DOM. */
export function createSelectionSurfaces() {
  const readers = new Map<HTMLElement, () => ActionSource | null>()
  return {
    register(element: HTMLElement, read: () => ActionSource | null) { readers.set(element, read); return () => { readers.delete(element) } },
    read(target: EventTarget | null) { for (const [element, read] of readers) if (target instanceof Node && element.contains(target)) return read(); return null },
  }
}
export type SelectionSurfaces = ReturnType<typeof createSelectionSurfaces>

/** Install hold/move/release gestures; returns a disposer removing every global listener. */
export function installWheelGesture(
  controller: ActionController,
  read: (event: MouseEvent) => ActionSource | null,
  preferences: () => { wheelTrigger?: WheelTrigger | undefined, wheelSlots?: (CiteAction | null)[] | undefined },
): () => void {
  let held: { key: string, time: number } | null = null
  let suppressContextUntil = 0
  let pointer = { x: 0, y: 0, target: null as EventTarget | null }
  const blocked = (target: EventTarget | null) => target instanceof Element && target.closest('[data-citeciter-menu], [role="dialog"][aria-modal="true"]') !== null
  const capture = (event: MouseEvent, key: string) => {
    if (blocked(event.target)) return
    const source = read(event)
    if (source === null) return
    event.preventDefault()
    held = { key, time: Date.now() }
    controller.open(source, event.clientX, event.clientY, preferences().wheelSlots ?? DEFAULT_WHEEL_SLOTS, true)
  }
  const down = (event: PointerEvent) => {
    if (event.button === 2 && (preferences().wheelTrigger ?? 'right-button') === 'right-button' && !event.shiftKey) capture(event, 'right-button')
    else if (!blocked(event.target) && event.button === 0) controller.cancel()
  }
  const move = (event: PointerEvent) => {
    pointer = { x: event.clientX, y: event.clientY, target: event.target }
    if (held !== null) controller.move(event.clientX, event.clientY)
  }
  const release = (key: string) => {
    if (held?.key !== key) return
    const quick = Date.now() - held.time < 220
    held = null
    suppressContextUntil = Date.now() + 800
    controller.release(quick)
  }
  const up = (event: PointerEvent) => { if (event.button === 2) release('right-button') }
  const menu = (event: MouseEvent) => {
    if (held !== null || Date.now() < suppressContextUntil) { event.preventDefault(); return }
    if ((preferences().wheelTrigger ?? 'right-button') !== 'right-button' || event.shiftKey || blocked(event.target)) return
    const source = read(event)
    if (source === null) return
    event.preventDefault()
    controller.open(source, event.clientX, event.clientY, preferences().wheelSlots ?? DEFAULT_WHEEL_SLOTS, false)
  }
  const keydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') { held = null; controller.cancel(); return }
    if (held !== null && held.key !== 'right-button' && event.key !== held.key) { held = null; controller.cancel(); return }
    if (event.repeat || event.isComposing || held !== null) return
    if (event.key !== preferences().wheelTrigger) return
    // Preserve typing, composition and editor shortcuts. Read-only registered viewers are allowed.
    if (event.target instanceof Element && event.target.closest('input, textarea:not([readonly]), [contenteditable="true"]')) return
    const target = document.elementFromPoint(pointer.x, pointer.y) ?? pointer.target
    const synthetic = { target, clientX: pointer.x, clientY: pointer.y, preventDefault: () => event.preventDefault() } as MouseEvent
    capture(synthetic, event.key)
  }
  const keyup = (event: KeyboardEvent) => release(event.key)
  const cancel = () => { held = null; controller.cancel() }
  document.addEventListener('pointerdown', down)
  document.addEventListener('pointermove', move)
  document.addEventListener('pointerup', up)
  document.addEventListener('contextmenu', menu)
  document.addEventListener('keydown', keydown)
  document.addEventListener('keyup', keyup)
  document.addEventListener('pointercancel', cancel)
  window.addEventListener('blur', cancel)
  window.addEventListener('resize', cancel)
  return () => {
    cancel()
    document.removeEventListener('pointerdown', down)
    document.removeEventListener('pointermove', move)
    document.removeEventListener('pointerup', up)
    document.removeEventListener('contextmenu', menu)
    document.removeEventListener('keydown', keydown)
    document.removeEventListener('keyup', keyup)
    document.removeEventListener('pointercancel', cancel)
    window.removeEventListener('blur', cancel)
    window.removeEventListener('resize', cancel)
  }
}

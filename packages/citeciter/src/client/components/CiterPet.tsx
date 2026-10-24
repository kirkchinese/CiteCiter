import { t, useLocale } from '../i18n.ts'
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import peekUrl from '../assets/citer-pet-peek.png'
import proudUrl from '../assets/citer-pet-proud.png'
import { OverlayPortal } from './OverlayPortal.tsx'
import css from './CiterPet.module.css'

type Side = 'left' | 'right'
interface PetPlace { readonly side: Side, readonly y: number }

const STORAGE_KEY = 'citeciter:pet-place'
const DEFAULT_PLACE: PetPlace = { side: 'right', y: 0.58 }
/** Rest and expanded figure heights; they match the CSS and the 2x art. */
const REST = { width: 54, height: 84 }
const EXPANDED = { width: 95, height: 112 }
/** Keep clear of the Desktop title bar and the host composer. */
const TOP_CLEARANCE = 56
const BOTTOM_CLEARANCE = 132
const REVEAL_DISTANCE = 40
const REVEAL_DELAY = 140
const HIDE_DELAY = 600
const DRAG_THRESHOLD = 6

function readPlace(): PetPlace {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (typeof value === 'object' && value !== null) {
      const { side, y } = value as { side?: unknown, y?: unknown }
      if ((side === 'left' || side === 'right') && typeof y === 'number' && Number.isFinite(y)) return { side, y: Math.min(1, Math.max(0, y)) }
    }
  } catch {
    // Blocked or corrupted storage: the default place is used.
  }
  return DEFAULT_PLACE
}

function writePlace(place: PetPlace): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(place))
  } catch {
    // The place is a per-browser convenience; failing to store it loses nothing.
  }
}

function restTop(y: number): number {
  const max = Math.max(TOP_CLEARANCE, window.innerHeight - BOTTOM_CLEARANCE - REST.height)
  return Math.round(Math.min(max, Math.max(TOP_CLEARANCE, y * window.innerHeight)))
}

/**
 * The collapsed Citer entry: the mascot peeking over a window edge. It stands up when the
 * pointer comes near or it receives focus, opens Citer on click, and can be dragged to
 * either side; the side and height are remembered in this browser.
 * @param attention - show a dot because an answer finished or a question waits while Citer is closed.
 */
export function CiterPet({ attention, onOpen }: { readonly attention: boolean, readonly onOpen: () => void }) {
  useLocale()
  const [place, setPlace] = useState(readPlace)
  const [expanded, setExpanded] = useState(false)
  const [drag, setDrag] = useState<{ readonly left: number, readonly top: number } | null>(null)
  const [, setViewport] = useState(0)
  const button = useRef<HTMLButtonElement>(null)
  const expandedRef = useRef(false)
  const timer = useRef<number | undefined>(undefined)
  const gesture = useRef<{ readonly id: number, readonly x: number, readonly y: number, readonly offsetX: number, readonly offsetY: number, moved: boolean } | null>(null)

  const setShown = (next: boolean, delay: number) => {
    window.clearTimeout(timer.current)
    if (expandedRef.current === next) return
    timer.current = window.setTimeout(() => { expandedRef.current = next; setExpanded(next) }, delay)
  }

  // Keyboard focus keeps her standing; the focus a mouse press leaves behind does not.
  const keyboardFocused = () => button.current?.matches(':focus-visible') === true

  useEffect(() => {
    const near = (event: PointerEvent) => {
      if (gesture.current !== null) return
      const rect = button.current?.getBoundingClientRect()
      if (rect === undefined) return
      const inside = event.clientX >= rect.left - REVEAL_DISTANCE && event.clientX <= rect.right + REVEAL_DISTANCE
        && event.clientY >= rect.top - REVEAL_DISTANCE && event.clientY <= rect.bottom + REVEAL_DISTANCE
      if (!keyboardFocused()) setShown(inside, inside ? REVEAL_DELAY : HIDE_DELAY)
    }
    const leave = (event: PointerEvent) => { if (event.relatedTarget === null && !keyboardFocused()) setShown(false, HIDE_DELAY) }
    const resize = () => setViewport(value => value + 1)
    document.addEventListener('pointermove', near, { passive: true })
    document.addEventListener('pointerout', leave)
    window.addEventListener('resize', resize)
    return () => {
      window.clearTimeout(timer.current)
      document.removeEventListener('pointermove', near)
      document.removeEventListener('pointerout', leave)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const down = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const move = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const current = gesture.current
    if (current === null || current.id !== event.pointerId) return
    if (!current.moved && Math.hypot(event.clientX - current.x, event.clientY - current.y) < DRAG_THRESHOLD) return
    current.moved = true
    expandedRef.current = true
    setDrag({
      left: Math.max(0, Math.min(window.innerWidth - EXPANDED.width, event.clientX - current.offsetX)),
      top: Math.max(0, Math.min(window.innerHeight - EXPANDED.height, event.clientY - current.offsetY)),
    })
  }
  const up = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const current = gesture.current
    if (current === null || current.id !== event.pointerId) return
    gesture.current = null
    if (!current.moved) { onOpen(); return }
    const next: PetPlace = { side: event.clientX < window.innerWidth / 2 ? 'left' : 'right', y: Math.max(0, event.clientY - current.offsetY) / window.innerHeight }
    setPlace(next)
    writePlace(next)
    setDrag(null)
  }
  const cancel = () => { gesture.current = null; setDrag(null) }

  const shown = expanded || drag !== null
  const style: CSSProperties = drag !== null ? { left: drag.left, top: drag.top, right: 'auto' } : { top: restTop(place.y) }
  return <OverlayPortal>
    <button ref={button} type="button" className={css.pet} style={style} data-side={place.side} data-expanded={shown || undefined} data-dragging={drag !== null || undefined}
      aria-label={attention ? t('panel.pet.attention') : t('panel.pet.open')} title={t('panel.pet.drag')}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel}
      onFocus={() => { if (keyboardFocused()) setShown(true, 0) }} onBlur={() => setShown(false, HIDE_DELAY)}
      onClick={event => { if (event.detail === 0) onOpen() }}>
      <img className={css.peek} src={peekUrl} alt="" draggable={false} />
      <img className={css.proud} src={proudUrl} alt="" draggable={false} />
      {attention && <span className={css.dot} aria-hidden="true" />}
    </button>
  </OverlayPortal>
}

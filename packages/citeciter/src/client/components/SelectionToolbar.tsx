import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store'
import { DEFAULT_WHEEL_SLOTS, type CiteAction } from '../../actions.ts'
import type { ActionSource } from '../action-controller.ts'
import type { CompanionSnapshot } from '../companion-controller.ts'
import type { SelectionAnchor, SelectionToolbarSnapshot } from '../selection-toolbar.ts'
import { OverlayPortal } from './OverlayPortal.tsx'
import mascotUrl from '../assets/citeciter-mascot.png'
import css from './SelectionToolbar.module.css'

const INLINE_ACTIONS = 4
const GAP = 8
/** The explicit way to start a separate Topic: the user's own question about the selection. */
const NEW_TOPIC_ACTION: CiteAction = { label: '新 Topic', prompt: '', ask: true, presentation: 'side' }

/** Toolbar callbacks; the controllers stay with the Client plugin. */
export interface SelectionToolbarActions {
  readonly dismiss: () => void
  readonly run: (source: ActionSource, action: CiteAction, x: number, y: number, newTopic?: boolean) => void
}

function place(anchor: SelectionAnchor, width: number, height: number): { left: number, top: number } {
  const left = Math.max(GAP, Math.min(anchor.x - width / 2, window.innerWidth - width - GAP))
  const below = anchor.bottom + GAP
  const top = below + height <= window.innerHeight - GAP ? below : Math.max(GAP, anchor.top - height - GAP)
  return { left, top }
}

/**
 * Actions for the current selection: the first configured actions inline, the rest and
 * "新 Topic" under a menu. Pressing a button never moves focus or clears the selection first.
 */
export function SelectionToolbar({ useToolbar, useCompanion, toolbar }: {
  readonly useToolbar: SnapshotSelectorHook<SelectionToolbarSnapshot>
  readonly useCompanion: SnapshotSelectorHook<CompanionSnapshot>
  readonly toolbar: SelectionToolbarActions
}) {
  const current = useToolbar(value => value.current)
  const slots = useCompanion(value => value.settings.wheelSlots ?? DEFAULT_WHEEL_SLOTS)
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ left: number, top: number } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => { setMenuOpen(false) }, [current])
  useLayoutEffect(() => {
    const element = ref.current
    if (current === null || element === null) { setPosition(null); return }
    setPosition(place(current.anchor, element.offsetWidth, element.offsetHeight))
  }, [current])
  if (current === null) return null
  const actions = slots.filter((slot): slot is CiteAction => slot !== null)
  const inline = actions.slice(0, INLINE_ACTIONS)
  const more = actions.slice(INLINE_ACTIONS)
  const choose = (action: CiteAction, newTopic = false) => {
    toolbar.run(current.source, action, current.anchor.x, current.anchor.bottom, newTopic)
    toolbar.dismiss()
    if (current.source.kind === 'conversation') window.getSelection()?.removeAllRanges()
  }
  const style = (position === null ? { visibility: 'hidden', left: 0, top: 0 } : position) as CSSProperties
  return <OverlayPortal>
    <div ref={ref} className={css.toolbar} style={style} role="toolbar" aria-label="Citer 选文动作" data-citeciter-toolbar
      onMouseDown={event => event.preventDefault()} onPointerDown={event => event.preventDefault()}>
      <img className={css.mark} src={mascotUrl} alt="" aria-hidden="true" />
      {inline.map((action, index) => <button key={index} type="button" title={action.ask ? '在 Citer 中写下问题' : action.prompt} onClick={() => choose(action)}>{action.label}</button>)}
      <button type="button" className={css.more} aria-label="更多动作" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}>
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10h.01M10 10h.01M15 10h.01" /></svg>
      </button>
      {menuOpen && <div className={css.menu} role="menu" aria-label="更多动作">
        {more.map((action, index) => <button key={index} type="button" role="menuitem" title={action.ask ? '在 Citer 中写下问题' : action.prompt} onClick={() => choose(action)}>{action.label}</button>)}
        {more.length > 0 && <hr />}
        <button type="button" role="menuitem" onClick={() => choose(actions.find(action => action.ask) ?? NEW_TOPIC_ACTION, true)}>在新 Topic 中提问</button>
      </div>}
    </div>
  </OverlayPortal>
}

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store'
import { localizedWheelSlots, type CiteAction } from '../../actions.ts'
import type { ActionSource } from '../action-controller.ts'
import type { CompanionSnapshot } from '../companion-controller.ts'
import type { SelectionAnchor, SelectionToolbarSnapshot } from '../selection-toolbar.ts'
import { OverlayPortal } from './OverlayPortal.tsx'
import mascotUrl from '../assets/citeciter-mascot.png'
import { isChinese, t, useLocale } from '../i18n.ts'
import css from './SelectionToolbar.module.css'

const INLINE_ACTIONS = 4
const GAP = 8

/** Toolbar callbacks; the controllers stay with the Client plugin. */
export interface SelectionToolbarActions {
  readonly dismiss: () => void
  readonly run: (source: ActionSource, action: CiteAction, x: number, y: number, newTopic?: boolean) => void
  readonly quote: (source: ActionSource) => Promise<void>
}

function place(anchor: SelectionAnchor, width: number, height: number): { left: number, top: number } {
  const left = Math.max(GAP, Math.min(anchor.x - width / 2, window.innerWidth - width - GAP))
  const below = anchor.bottom + GAP
  const top = below + height <= window.innerHeight - GAP ? below : Math.max(GAP, anchor.top - height - GAP)
  return { left, top }
}

/**
 * Actions for the current selection: the first configured actions inline with Quote second, the
 * rest and "Ask in a new Topic" under a menu. Pressing a button never moves focus or clears the selection first.
 */
export function SelectionToolbar({ useToolbar, useCompanion, toolbar }: {
  readonly useToolbar: SnapshotSelectorHook<SelectionToolbarSnapshot>
  readonly useCompanion: SnapshotSelectorHook<CompanionSnapshot>
  readonly toolbar: SelectionToolbarActions
}) {
  useLocale()
  const current = useToolbar(value => value.current)
  const savedSlots = useCompanion(value => value.settings.wheelSlots)
  const slots = localizedWheelSlots(savedSlots, isChinese())
  const newTopicAction: CiteAction = { label: t('settings.toolbar.newTopic'), prompt: '', ask: true, presentation: 'side' }
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ left: number, top: number } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [quoting, setQuoting] = useState(false)
  useEffect(() => { setMenuOpen(false); setQuoteError(null) }, [current])
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
    if (current.source.kind !== 'document') window.getSelection()?.removeAllRanges()
  }
  const quote = async () => {
    if (quoting) return
    setQuoting(true)
    setQuoteError(null)
    try {
      await toolbar.quote(current.source)
      toolbar.dismiss()
      if (current.source.kind !== 'document') window.getSelection()?.removeAllRanges()
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : String(error))
    } finally { setQuoting(false) }
  }
  // A passage of a Topic's own transcript continues that Topic.
  const inTopic = current.source.kind === 'topic'
  const style = (position === null ? { visibility: 'hidden', left: 0, top: 0 } : position) as CSSProperties
  return <OverlayPortal>
    <div ref={ref} className={css.toolbar} style={style} role="toolbar" aria-label={t('settings.toolbar.title')} data-citeciter-toolbar
      onMouseDown={event => event.preventDefault()} onPointerDown={event => event.preventDefault()}>
      <img className={css.mark} src={mascotUrl} alt="" aria-hidden="true" />
      {/* The first action keeps its place; Quote follows it, then the other actions. */}
      {inline.slice(0, 1).map(action => <button key={0} type="button" title={action.ask ? t('settings.toolbar.ask') : action.prompt} onClick={() => choose(action)}>{action.label}</button>)}
      <button type="button" disabled={quoting} title={inTopic ? t('settings.toolbar.quoteTopic') : current.source.kind === 'document' ? t('settings.toolbar.quoteCiter') : t('settings.toolbar.quoteMain')} onClick={() => { void quote() }}>{t('settings.toolbar.quote')}</button>
      {quoteError !== null && <span className={css.error} role="alert" title={quoteError}>{quoteError}</span>}
      {inline.slice(1).map((action, index) => <button key={index + 1} type="button" title={action.ask ? t('settings.toolbar.ask') : action.prompt} onClick={() => choose(action)}>{action.label}</button>)}
      {(more.length > 0 || !inTopic) && <button type="button" className={css.more} aria-label={t('settings.toolbar.more')} aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}>
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10h.01M10 10h.01M15 10h.01" /></svg>
      </button>}
      {menuOpen && <div className={css.menu} role="menu" aria-label={t('settings.toolbar.more')}>
        {more.map((action, index) => <button key={index} type="button" role="menuitem" title={action.ask ? t('settings.toolbar.ask') : action.prompt} onClick={() => choose(action)}>{action.label}</button>)}
        {more.length > 0 && !inTopic && <hr />}
        {!inTopic && <button type="button" role="menuitem" onClick={() => choose(actions.find(action => action.ask) ?? newTopicAction, true)}>{t('settings.toolbar.askNewTopic')}</button>}
      </div>}
    </div>
  </OverlayPortal>
}

import { useEffect, useRef, type CSSProperties } from 'react'
import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store'
import { OverlayPortal } from './OverlayPortal.tsx'
import { actionSourceQuote, type ActionController, type ActionSnapshot } from '../action-controller.ts'
import type { CompanionSnapshot } from '../companion-controller.ts'
import css from './ActionWheel.module.css'
import { actionDelivery, type CiteAction } from '../../actions.ts'

export type ActionCallbacks = Omit<ActionController, 'getSnapshot' | 'subscribe' | 'dispose'>

/** Optional wheel and the action retry prompt. Questions and models are edited only in the Topic composer. */
export function ActionWheel({ useActions, useCompanion, actions }: {
  useActions: SnapshotSelectorHook<ActionSnapshot>, useCompanion: SnapshotSelectorHook<CompanionSnapshot>, actions: ActionCallbacks
}) {
  const state = useActions(value => value)
  const preference = useCompanion(value => value.settings.actionDelivery)
  const outcome = (slot: CiteAction) => slot.ask ? '写下问题' : actionDelivery(slot, preference) === 'send' ? '直接发送' : '放进输入框'
  const menu = useRef<HTMLDivElement>(null)
  const wheel = state.wheel
  const active = wheel?.active == null ? null : wheel.slots[wheel.active]
  const pending = state.pending
  useEffect(() => { if (wheel !== null && !wheel.held) menu.current?.focus() }, [wheel?.held])
  return <OverlayPortal>
    {wheel !== null && <div className={css.wheel} style={{ left: wheel.x, top: wheel.y, '--wheel-scale': wheel.scale } as CSSProperties} data-citeciter-menu data-citeciter-wheel ref={menu} tabIndex={-1} role="menu" aria-label="Citer 选文动作" onKeyDown={event => {
      if (event.key === 'Escape') actions.cancel()
      else if (/^[1-8]$/u.test(event.key)) { event.preventDefault(); actions.choose(Number(event.key) - 1) }
      else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); actions.choose(wheel.active) }
      else if (event.key.startsWith('Arrow')) { event.preventDefault(); actions.focus(((wheel.active ?? 0) + (['ArrowLeft', 'ArrowUp'].includes(event.key) ? 7 : 1)) % 8) }
    }}>
      <svg viewBox="-180 -180 360 360" aria-hidden="true" className={css.ring}>{wheel.slots.map((slot, index) => {
        const a = (index * 45 - 112.5) * Math.PI / 180, b = a + Math.PI / 4
        const p = (r: number, angle: number) => `${r * Math.cos(angle)} ${r * Math.sin(angle)}`
        return <path key={index} data-active={wheel.active === index && slot !== null || undefined} data-empty={slot === null || undefined} d={`M ${p(43,a)} L ${p(178,a)} A 178 178 0 0 1 ${p(178,b)} L ${p(43,b)} A 43 43 0 0 0 ${p(43,a)}`} />
      })}</svg>
      {wheel.slots.map((slot, index) => {
        const angle = (index * 45 - 90) * Math.PI / 180
        return <button key={index} className={css.slot} type="button" role="menuitem" aria-disabled={slot === null} data-active={wheel.active === index || undefined} style={{ left: 180 + Math.cos(angle) * 114, top: 180 + Math.sin(angle) * 114 }} onMouseEnter={() => { if (!wheel.held) actions.focus(index) }} onFocus={() => actions.focus(index)} onClick={() => actions.choose(index)} title={slot?.prompt}>
          <span className={css.slotNumber}>{index + 1}</span><strong>{slot?.label ?? '空槽'}</strong><small>{slot === null ? '在设置中添加' : outcome(slot)}</small>
        </button>
      })}
      <button type="button" className={css.center} onClick={actions.cancel} aria-label="取消轮盘">取消<small>Esc</small></button>
      <div className={css.caption} role="status">{active == null ? '移向动作 · 回到中心取消' : `${active.label} · 松开后${outcome(active)}`}</div>
    </div>}
    {pending !== null && state.error !== null && <form className={css.prompt} data-citeciter-menu role="dialog" aria-label={`${pending.action.label}：未完成`} style={{ '--prompt-x': `${pending.x - 210}px`, '--prompt-y': `${pending.y - 100}px` } as CSSProperties} onSubmit={event => { event.preventDefault(); void actions.submit() }}>
      <header><strong>{pending.action.label}</strong><button type="button" onClick={actions.cancel} aria-label="关闭提问">×</button></header>
      <blockquote>{actionSourceQuote(pending.source).slice(0, 180)}</blockquote>
      {state.error !== null && <p role="alert" className={css.error}>{state.error}</p>}
      <footer><span>选中的内容已保留</span><button type="submit" disabled={state.submitting}>重试</button></footer>
    </form>}
  </OverlayPortal>
}

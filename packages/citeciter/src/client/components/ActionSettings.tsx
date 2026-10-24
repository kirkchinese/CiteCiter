import { useEffect, useRef, useState } from 'react'
import { Button, SegmentedControl, Switch } from '@deepseek-ai/dsh-client-ui-primitives'
import { localizedWheelSlots, wheelSlotsSchema, type ActionDelivery, type CiteAction, type WheelTrigger } from '../../actions.ts'
import { isChinese, t, useLocale } from '../i18n.ts'
import type { CompanionSnapshot } from '../companion-controller.ts'
import type { CompanionActions } from '../view-actions.ts'
import { ModelChoice } from './ModelChoice.tsx'
import css from './Settings.module.css'

const TRIGGERS: readonly WheelTrigger[] = ['right-button', 'Alt', 'Control', 'Shift', 'Meta']

/**
 * Compare action lists by what the user can edit, in a fixed field order. A settings refresh may
 * decode the same actions with other key orders or retired fields; that must not discard local edits.
 */
function slotsRevision(slots: readonly (CiteAction | null)[]): string {
  return JSON.stringify(slots.map(slot => slot === null ? null : [slot.label, slot.prompt, slot.ask, slot.presentation]))
}

/** Selection entry points, preset-action delivery, the new-Topic model and the eight action slots, saved together. */
export function ActionSettings({ snapshot, companion }: { snapshot: CompanionSnapshot, companion: CompanionActions }) {
  useLocale()
  const settings = snapshot.settings
  const savedSlots = localizedWheelSlots(settings.wheelSlots, isChinese())
  const newSlot: CiteAction = { label: t('settings.actions.custom'), prompt: '', ask: true, presentation: 'side' }
  const savedRevision = slotsRevision(savedSlots)
  const [slots, setSlots] = useState<(CiteAction | null)[]>(() => [...savedSlots])
  const slotKeys = useRef(savedSlots.map((_, index) => index))
  const nextSlotKey = useRef(savedSlots.length)
  const [error, setError] = useState<string | null>(null)
  const previousRevision = useRef(savedRevision)
  useEffect(() => {
    // Other settings can decode a new object without changing the saved slots; keep the local edits then.
    if (previousRevision.current === savedRevision) return
    previousRevision.current = savedRevision
    slotKeys.current = savedSlots.map(() => nextSlotKey.current++)
    setSlots([...savedSlots])
  }, [savedSlots, savedRevision])
  const saving = snapshot.settingsSaveStatus === 'saving'
  const dirty = slotsRevision(slots) !== savedRevision
  const change = (index: number, patch: Partial<CiteAction>) => setSlots(current => current.map((slot, i) => i === index ? { ...(slot ?? newSlot), ...patch } : slot))
  const move = (index: number, offset: number) => {
    const to = index + offset
    if (to < 0 || to >= slots.length) return
    const keys = [...slotKeys.current]
    ;[keys[index], keys[to]] = [keys[to]!, keys[index]!]
    slotKeys.current = keys
    setSlots(current => {
      const next = [...current]
      ;[next[index], next[to]] = [next[to]!, next[index]!]
      return next
    })
  }
  const save = () => {
    const result = wheelSlotsSchema.safeParse(slots)
    if (!result.success) { setError(t('settings.actions.invalid')); return }
    setError(null)
    void companion.setSetting('wheelSlots', result.data)
  }
  return <section className={css.group}>
    <h3>{t('settings.actions.title')}</h3>
    <div className={css.row}>
      <div className={css.rowText}><span className={css.title}>{t('settings.actions.toolbar')}</span><span className={css.desc}>{t('settings.actions.toolbarDesc')}</span></div>
      <div className={css.control}><Switch label={t('settings.actions.toolbar')} checked={settings.selectionToolbar ?? true} disabled={saving} onChange={value => { void companion.setSetting('selectionToolbar', value) }} /></div>
    </div>
    <div className={css.row}>
      <div className={css.rowText}><span className={css.title}>{t('settings.actions.wheel')}</span><span className={css.desc}>{t('settings.actions.wheelDesc')}</span></div>
      <div className={css.control}>
        {settings.wheelEnabled === true && <select className={css.select} aria-label={t('settings.actions.trigger')} value={settings.wheelTrigger ?? 'right-button'} onChange={event => { void companion.setSetting('wheelTrigger', event.currentTarget.value as WheelTrigger) }}>
          {TRIGGERS.map(value => <option key={value} value={value}>{value === 'right-button' ? t('settings.actions.rightButton') : value === 'Alt' ? 'Alt / Option' : value === 'Meta' ? 'Meta / Command' : value}</option>)}
        </select>}
        <Switch label={t('settings.actions.wheel')} checked={settings.wheelEnabled === true} disabled={saving} onChange={value => { void companion.setSetting('wheelEnabled', value) }} />
      </div>
    </div>
    <div className={css.row}>
      <div className={css.rowText}><span className={css.title}>{t('settings.actions.delivery')}</span><span className={css.desc}>{t('settings.actions.deliveryDesc')}</span></div>
      <div className={css.control}>
        <SegmentedControl<ActionDelivery> id="citeciter-action-delivery" label={t('settings.actions.delivery')} value={settings.actionDelivery ?? 'send'} disabled={saving}
          options={[{ value: 'send', label: t('settings.actions.send') }, { value: 'draft', label: t('settings.actions.draft') }]}
          onChange={value => { void companion.setSetting('actionDelivery', value) }} />
      </div>
    </div>
    <div className={css.row}>
      <div className={css.rowText}><span className={css.title}>{t('settings.actions.model')}</span><span className={css.desc}>{t('settings.actions.modelDesc')}</span></div>
      <div className={css.control}><ModelChoice className={css.select} label={t('settings.actions.model')} providers={snapshot.providers} value={settings.defaultCiterModel ?? undefined} onChange={value => { void companion.setSetting('defaultCiterModel', value ?? null) }} /></div>
    </div>
    <div className={css.row} data-stack>
      <div className={css.rowText}><span className={css.title}>{t('settings.actions.slots')}</span><span className={css.desc}>{t('settings.actions.slotsDesc')}</span></div>
      <div className={css.slots}>{slots.map((slot, index) => <details key={slotKeys.current[index]} className={css.slot}>
        <summary>
          <span className={css.slotIndex}>{index + 1}</span>
          <span className={css.slotLabel} data-empty={slot === null || undefined}>{slot?.label ?? t('settings.actions.empty')}</span>
          <span className={css.slotKind}>{slot === null ? '' : slot.ask ? t('settings.actions.ask') : t('settings.actions.preset')}</span>
        </summary>
        <div className={css.slotBody}>
          {slot === null ? <div className={css.slotButtons}><Button variant="outline" size="sm" onClick={() => change(index, {})}>{t('settings.actions.add')}</Button></div> : <>
            <label className={css.field}>{t('settings.actions.name')}<input className={css.text} maxLength={20} value={slot.label} onChange={event => change(index, { label: event.currentTarget.value })} /></label>
            <div className={css.field}>{t('settings.actions.kind')}
              <SegmentedControl<'ask' | 'preset'> id={`citeciter-slot-${index}`} label={t('settings.actions.kindAria', { index: index + 1 })} value={slot.ask ? 'ask' : 'preset'}
                options={[{ value: 'ask', label: t('settings.actions.ask') }, { value: 'preset', label: t('settings.actions.preset') }]}
                onChange={value => change(index, { ask: value === 'ask' })} />
            </div>
            <label className={css.field}>{slot.ask ? t('settings.actions.optionalPrompt') : t('settings.actions.prompt')}<textarea className={css.textarea} rows={3} maxLength={4000} value={slot.prompt} onChange={event => change(index, { prompt: event.currentTarget.value })} /></label>
            <label className={css.field}>{t('settings.actions.position')}<select className={css.select} value={slot.presentation} onChange={event => change(index, { presentation: event.currentTarget.value as CiteAction['presentation'] })}><option value="side">{t('settings.actions.side')}</option><option value="floating">{t('settings.actions.floating')}</option></select></label>
            <div className={css.slotButtons}>
              <Button variant="outline" size="sm" disabled={index === 0} onClick={() => move(index, -1)}>{t('settings.actions.up')}</Button>
              <Button variant="outline" size="sm" disabled={index === slots.length - 1} onClick={() => move(index, 1)}>{t('settings.actions.down')}</Button>
              <Button variant="outline" size="sm" onClick={() => setSlots(current => current.map((item, i) => i === index ? null : item))}>{t('settings.actions.clear')}</Button>
            </div>
          </>}
        </div>
      </details>)}</div>
      {error !== null && <p className={css.status} data-status="error" role="alert">{error}</p>}
      <div className={css.footer}>
        <Button variant="ghost" size="sm" onClick={() => { setSlots([...localizedWheelSlots(undefined, isChinese())]); setError(null) }}>{t('settings.actions.restore')}</Button>
        <Button variant="primary" size="sm" disabled={!dirty || saving} onClick={save}>{t('settings.actions.save')}</Button>
      </div>
    </div>
  </section>
}

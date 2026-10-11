import { useEffect, useRef, useState } from 'react'
import { Button, SegmentedControl, Switch } from '@deepseek-ai/dsh-client-ui-primitives'
import { DEFAULT_WHEEL_SLOTS, wheelSlotsSchema, type ActionDelivery, type CiteAction, type WheelTrigger } from '../../actions.ts'
import type { CompanionSnapshot } from '../companion-controller.ts'
import type { CompanionActions } from '../view-actions.ts'
import { ModelChoice } from './ModelChoice.tsx'
import css from './Settings.module.css'

const TRIGGERS: readonly (readonly [WheelTrigger, string])[] = [
  ['right-button', '鼠标右键'], ['Alt', 'Alt / Option'], ['Control', 'Control'], ['Shift', 'Shift'], ['Meta', 'Meta / Command'],
]
const NEW_SLOT: CiteAction = { label: '自定义', prompt: '', ask: true, presentation: 'side' }

/** Selection entry points, preset-action delivery, the new-Topic model and the eight action slots, saved together. */
export function ActionSettings({ snapshot, companion }: { snapshot: CompanionSnapshot, companion: CompanionActions }) {
  const settings = snapshot.settings
  const savedSlots = settings.wheelSlots ?? DEFAULT_WHEEL_SLOTS
  const savedRevision = JSON.stringify(savedSlots)
  const [slots, setSlots] = useState<(CiteAction | null)[]>(() => [...savedSlots])
  const [error, setError] = useState<string | null>(null)
  const previousRevision = useRef(savedRevision)
  useEffect(() => {
    // Other settings can decode a new object without changing the saved slots; keep the local edits then.
    if (previousRevision.current === savedRevision) return
    previousRevision.current = savedRevision
    setSlots([...savedSlots])
  }, [savedSlots, savedRevision])
  const saving = snapshot.settingsSaveStatus === 'saving'
  const dirty = JSON.stringify(slots) !== savedRevision
  const change = (index: number, patch: Partial<CiteAction>) => setSlots(current => current.map((slot, i) => i === index ? { ...(slot ?? NEW_SLOT), ...patch } : slot))
  const move = (index: number, offset: number) => setSlots(current => {
    const to = index + offset
    if (to < 0 || to >= current.length) return current
    const next = [...current]
    ;[next[index], next[to]] = [next[to]!, next[index]!]
    return next
  })
  const save = () => {
    const result = wheelSlotsSchema.safeParse(slots)
    if (!result.success) { setError('请填写动作名称；预设提示词类型的动作需要提示词。'); return }
    setError(null)
    void companion.setSetting('wheelSlots', result.data)
  }
  return <section className={css.group}>
    <h3>选文</h3>
    <div className={css.row}>
      <div className={css.rowText}><span className={css.title}>选中文字后显示工具条</span><span className={css.desc}>在主对话、工具结果和文档里选中文字时，旁边出现 Citer 的动作。</span></div>
      <div className={css.control}><Switch label="选中文字后显示工具条" checked={settings.selectionToolbar ?? true} disabled={saving} onChange={value => { void companion.setSetting('selectionToolbar', value) }} /></div>
    </div>
    <div className={css.row}>
      <div className={css.rowText}><span className={css.title}>按住触发键打开轮盘</span><span className={css.desc}>选中文字后按住触发键，移向动作，松开即执行。按住 Shift 再按右键会保留浏览器菜单。</span></div>
      <div className={css.control}>
        {settings.wheelEnabled === true && <select className={css.select} aria-label="轮盘触发键" value={settings.wheelTrigger ?? 'right-button'} onChange={event => { void companion.setSetting('wheelTrigger', event.currentTarget.value as WheelTrigger) }}>
          {TRIGGERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>}
        <Switch label="按住触发键打开轮盘" checked={settings.wheelEnabled === true} disabled={saving} onChange={value => { void companion.setSetting('wheelEnabled', value) }} />
      </div>
    </div>
    <div className={css.row}>
      <div className={css.rowText}><span className={css.title}>预设动作</span><span className={css.desc}>“解释”“翻译”这类动作是直接发送，还是先放进输入框。“提问”总是先打开输入框。</span></div>
      <div className={css.control}>
        <SegmentedControl<ActionDelivery> id="citeciter-action-delivery" label="预设动作" value={settings.actionDelivery ?? 'send'} disabled={saving}
          options={[{ value: 'send', label: '直接发送' }, { value: 'draft', label: '放进输入框' }]}
          onChange={value => { void companion.setSetting('actionDelivery', value) }} />
      </div>
    </div>
    <div className={css.row}>
      <div className={css.rowText}><span className={css.title}>新 Topic 的模型</span><span className={css.desc}>未指定时使用来源对话的模型。</span></div>
      <div className={css.control}><ModelChoice className={css.select} label="新 Topic 的模型" providers={snapshot.providers} value={settings.defaultCiterModel ?? undefined} onChange={value => { void companion.setSetting('defaultCiterModel', value ?? null) }} /></div>
    </div>
    <div className={css.row} data-stack>
      <div className={css.rowText}><span className={css.title}>动作</span><span className={css.desc}>工具条显示前四个，其余在“⋯”里；轮盘从正上方顺时针排列。</span></div>
      <div className={css.slots}>{slots.map((slot, index) => <details key={index} className={css.slot}>
        <summary>
          <span className={css.slotIndex}>{index + 1}</span>
          <span className={css.slotLabel} data-empty={slot === null || undefined}>{slot?.label ?? '空'}</span>
          <span className={css.slotKind}>{slot === null ? '' : slot.ask ? '写下问题' : '预设提示词'}</span>
        </summary>
        <div className={css.slotBody}>
          {slot === null ? <div className={css.slotButtons}><Button variant="outline" size="sm" onClick={() => change(index, {})}>添加动作</Button></div> : <>
            <label className={css.field}>名称<input className={css.text} maxLength={20} value={slot.label} onChange={event => change(index, { label: event.currentTarget.value })} /></label>
            <div className={css.field}>类型
              <SegmentedControl<'ask' | 'preset'> id={`citeciter-slot-${index}`} label={`动作 ${index + 1} 的类型`} value={slot.ask ? 'ask' : 'preset'}
                options={[{ value: 'ask', label: '写下问题' }, { value: 'preset', label: '预设提示词' }]}
                onChange={value => change(index, { ask: value === 'ask' })} />
            </div>
            <label className={css.field}>{slot.ask ? '提示词（可选，预先填进输入框）' : '提示词'}<textarea className={css.textarea} rows={3} maxLength={4000} value={slot.prompt} onChange={event => change(index, { prompt: event.currentTarget.value })} /></label>
            <label className={css.field}>打开位置<select className={css.select} value={slot.presentation} onChange={event => change(index, { presentation: event.currentTarget.value as CiteAction['presentation'] })}><option value="side">侧边面板</option><option value="floating">悬浮面板</option></select></label>
            <div className={css.slotButtons}>
              <Button variant="outline" size="sm" disabled={index === 0} onClick={() => move(index, -1)}>上移</Button>
              <Button variant="outline" size="sm" disabled={index === slots.length - 1} onClick={() => move(index, 1)}>下移</Button>
              <Button variant="outline" size="sm" onClick={() => setSlots(current => current.map((item, i) => i === index ? null : item))}>清空</Button>
            </div>
          </>}
        </div>
      </details>)}</div>
      {error !== null && <p className={css.status} data-status="error" role="alert">{error}</p>}
      <div className={css.footer}>
        <Button variant="ghost" size="sm" onClick={() => { setSlots([...DEFAULT_WHEEL_SLOTS]); setError(null) }}>恢复默认</Button>
        <Button variant="primary" size="sm" disabled={!dirty || saving} onClick={save}>保存动作</Button>
      </div>
    </div>
  </section>
}

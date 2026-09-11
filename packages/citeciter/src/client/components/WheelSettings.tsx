import { useEffect, useRef, useState } from 'react'
import { DEFAULT_WHEEL_SLOTS, wheelSlotsSchema, type CiteAction, type WheelTrigger } from '../../actions.ts'
import type { CompanionSnapshot } from '../companion-controller.ts'
import type { CompanionActions } from '../view-actions.ts'
import { ModelChoice } from './ModelChoice.tsx'
import css from './ActionWheel.module.css'

/** Edit eight stable slots as one validated settings transaction. */
export function WheelSettings({ snapshot, companion }: { snapshot: CompanionSnapshot, companion: CompanionActions }) {
  const [slots, setSlots] = useState<(CiteAction | null)[]>(() => [...(snapshot.settings.wheelSlots ?? DEFAULT_WHEEL_SLOTS)])
  const [error, setError] = useState<string | null>(null)
  const savedSlots = snapshot.settings.wheelSlots ?? DEFAULT_WHEEL_SLOTS
  const savedRevision = JSON.stringify(savedSlots)
  const previousRevision = useRef(savedRevision)
  useEffect(() => {
    // Model/trigger saves can decode a new settings object without changing the saved slots.
    // Preserve the local draft until the slot values themselves change.
    if (previousRevision.current === savedRevision) return
    previousRevision.current = savedRevision
    setSlots([...savedSlots])
  }, [savedSlots, savedRevision])
  const change = (index: number, patch: Partial<CiteAction>) => setSlots(current => current.map((slot, i) => i === index ? { ...(slot ?? { label: '自定义', prompt: '', ask: true, scenario: 'qa', presentation: 'side' }), ...patch } : slot))
  const swap = (index: number, offset: number) => setSlots(current => { const next = [...current]; const to = (index + offset + 8) % 8; [next[index], next[to]] = [next[to]!, next[index]!]; return next })
  return <section className={css.settings}>
    <h3>选文轮盘</h3>
    <p>选中文字后按住触发键，移向动作，松开执行。中心、空槽和 Esc 取消；右键短按可改为点击选择，Shift + 右键保留原生菜单。</p>
    <label>按住触发键<select aria-label="轮盘触发键" value={snapshot.settings.wheelTrigger ?? 'right-button'} onChange={event => void companion.setSetting('wheelTrigger', event.currentTarget.value as WheelTrigger)}>
      <option value="right-button">鼠标右键（默认）</option><option value="Alt">Alt / Option</option><option value="Control">Control</option><option value="Shift">Shift</option><option value="Meta">Meta / Command</option>
    </select></label>
    <ModelChoice label="Citer 默认模型" providers={snapshot.providers} value={snapshot.settings.defaultCiterModel ?? undefined} onChange={value => void companion.setSetting('defaultCiterModel', value ?? null)} />
    <p>直接执行使用默认模型；需要输入的动作允许在发送前更换模型。未指定时跟随来源模型。八槽从正上方开始顺时针排列。</p>
    {slots.map((slot, index) => <details key={index}><summary>{index + 1} · {slot?.label ?? '空槽'}{slot === null ? '' : slot.ask ? ' · 需输入' : ' · 直接执行'}</summary>
      {slot === null ? <button type="button" onClick={() => change(index,{})}>添加自定义模式</button> : <>
        <label>名称<input aria-label={`槽位 ${index + 1} 名称`} maxLength={20} value={slot.label} onChange={event => change(index, { label: event.currentTarget.value })} /></label>
        <label>提示词<textarea aria-label={`槽位 ${index + 1} 提示词`} rows={3} maxLength={4000} value={slot.prompt} onChange={event => change(index,{ prompt:event.currentTarget.value })} /></label>
        <label className={css.toggle}><input type="checkbox" checked={slot.ask} onChange={event => change(index,{ ask:event.currentTarget.checked })} />先输入问题并选择模型</label>
        <label>内容方式<select value={slot.scenario} onChange={event => change(index,{ scenario:event.currentTarget.value as CiteAction['scenario'] })}><option value="qa">直接问答</option><option value="present">学习讲解与板书</option></select></label>
        <label>默认打开位置<select value={slot.presentation} onChange={event => change(index,{ presentation:event.currentTarget.value as CiteAction['presentation'] })}><option value="side">侧边（空间不足时上下排列）</option><option value="floating">悬浮</option></select></label>
      </>}
      <div className={css.slotActions}><button type="button" onClick={() => swap(index,-1)}>逆时针移动</button><button type="button" onClick={() => swap(index,1)}>顺时针移动</button><button type="button" onClick={() => setSlots(current => current.map((item,i) => i === index ? null : item))}>清空</button></div>
    </details>)}
    {error !== null && <p role="alert" className={css.error}>{error}</p>}
    <div className={css.slotActions}><button type="button" onClick={() => { setSlots([...DEFAULT_WHEEL_SLOTS]); setError(null) }}>恢复默认草稿</button><button className={css.save} type="button" disabled={snapshot.settingsSaveStatus === 'saving'} onClick={() => {
      const result = wheelSlotsSchema.safeParse(slots)
      if (!result.success) { setError('请填写模式名称；直接执行的模式必须有提示词。'); return }
      setError(null); void companion.setSetting('wheelSlots', result.data)
    }}>保存八个槽位</button></div>
  </section>
}

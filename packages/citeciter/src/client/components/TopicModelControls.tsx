import { useCallback, useRef, useState } from 'react'
import type { ProviderOption, TopicModelConfig } from '../../topic.ts'
import { ChoicePopover } from './ChoicePopover.tsx'
import css from './TopicModelControls.module.css'

/** Model and reasoning hierarchy. Route changes are committed by the injected controller. */
export function TopicModelControls({ providers, route, saving, onModel, onReasoning }: {
  readonly providers: readonly ProviderOption[]
  readonly route: TopicModelConfig
  readonly saving: boolean
  readonly onModel: (provider: string, model: string) => void
  readonly onReasoning: (effort: string | null) => void
}) {
  const [page, setPage] = useState<'closed' | 'root' | 'model' | 'effort'>('closed')
  const anchor = useRef<HTMLButtonElement>(null)
  const close = useCallback(() => setPage('closed'), [])
  const model = providers.find(provider => provider.id === route.provider)?.models.find(model => model.id === route.model)
  const name = model?.name ?? route.model
  const effort = model?.reasoningEfforts.find(item => item.id === route.reasoningEffort)?.name ?? '默认'
  const finish = (action: () => void) => { action(); close(); anchor.current?.focus() }
  return <div className={css.controls}>
    <button ref={anchor} type="button" className={css.trigger} disabled={saving} aria-label={`模型与思考强度：${name}，${effort}`} aria-haspopup="menu" aria-expanded={page !== 'closed'} onClick={() => setPage(page === 'closed' ? 'root' : 'closed')}>
      <span>{name}</span><small>{effort}</small><span aria-hidden="true">⌄</span>
    </button>
    {page !== 'closed' && <ChoicePopover anchor={anchor} label="模型与思考强度" onClose={close}>
      {page === 'root' ? <>
        <button type="button" role="menuitem" onClick={() => setPage('model')}><span>模型</span><span>{name} ›</span></button>
        <button type="button" role="menuitem" disabled={!model?.reasoningEfforts.length} onClick={() => setPage('effort')}><span>思考强度</span><span>{effort} ›</span></button>
      </> : <>
        <button type="button" role="menuitem" onClick={() => setPage('root')}><span>‹ {page === 'model' ? '模型' : '思考强度'}</span></button>
        {page === 'model' ? providers.map(provider => <div key={provider.id} role="group" aria-label={provider.name}>
          <small>{provider.name}</small>
          {provider.models.map(item => <button type="button" role="menuitemradio" aria-checked={provider.id === route.provider && item.id === route.model} key={item.id} onClick={() => finish(() => onModel(provider.id, item.id))}><span>{item.name}</span>{provider.id === route.provider && item.id === route.model && <span aria-hidden="true">✓</span>}</button>)}
        </div>) : <>
          <button type="button" role="menuitemradio" aria-checked={route.reasoningEffort === undefined} onClick={() => finish(() => onReasoning(null))}>模型默认</button>
          {model?.reasoningEfforts.map(item => <button type="button" role="menuitemradio" aria-checked={item.id === route.reasoningEffort} key={item.id} onClick={() => finish(() => onReasoning(item.id))}>{item.name}</button>)}
        </>}
      </>}
    </ChoicePopover>}
  </div>
}

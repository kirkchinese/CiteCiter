import type { ProviderOption, TopicModelConfig } from '../../topic.ts'
import css from './TopicModelControls.module.css'

/**
 * Render compact, keyboard-accessible model controls inside the Topic composer.
 * @param props - current route, available models, save state and business callbacks.
 * @returns reasoning on the left and a provider-qualified model selector on the right.
 */
export function TopicModelControls({ providers, route, saving, onModel, onReasoning }: {
  readonly providers: readonly ProviderOption[]
  readonly route: TopicModelConfig
  readonly saving: boolean
  readonly onModel: (provider: string, model: string) => void
  readonly onReasoning: (effort: string | null) => void
}) {
  const model = providers.find(provider => provider.id === route.provider)?.models.find(model => model.id === route.model)
  const name = model?.name ?? `${route.provider} / ${route.model}`
  const effort = model?.reasoningEfforts.find(effort => effort.id === route.reasoningEffort)?.name ?? '默认思考'
  return <div className={css.controls}>
    {model !== undefined && model.reasoningEfforts.length > 0 && <label className={css.choice} title={`思考强度：${effort}`}>
      <span aria-hidden="true">{effort}</span><span className={css.chevron} aria-hidden="true" />
      <select aria-label="思考强度" value={route.reasoningEffort ?? ''} disabled={saving} onChange={event => onReasoning(event.currentTarget.value || null)}>
        <option value="">模型默认思考</option>
        {model.reasoningEfforts.map(effort => <option key={effort.id} value={effort.id}>{effort.name}</option>)}
      </select>
    </label>}
    <label className={`${css.choice} ${css.model}`} title={saving ? '正在保存模型设置…' : name}>
      <span aria-hidden="true">{name}</span><span className={css.chevron} aria-hidden="true" />
      <select aria-label="CiteCiter 模型" value={JSON.stringify([route.provider, route.model])} disabled={saving} onChange={event => {
        const [provider, model] = JSON.parse(event.currentTarget.value) as [string, string]
        onModel(provider, model)
      }}>
        {model === undefined && <option value={JSON.stringify([route.provider, route.model])}>{name}（暂不可用）</option>}
        {providers.map(provider => <optgroup key={provider.id} label={provider.name}>
          {provider.models.map(model => <option key={model.id} value={JSON.stringify([provider.id, model.id])}>{model.name}</option>)}
        </optgroup>)}
      </select>
    </label>
  </div>
}

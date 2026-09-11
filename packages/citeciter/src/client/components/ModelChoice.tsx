import type { ActionModel } from '../../actions.ts'
import type { ProviderOption } from '../../topic.ts'
import css from './ActionWheel.module.css'

/** Model identities are encoded together, so provider-local model IDs never collide. */
export function ModelChoice({ providers, value, onChange, disabled = false, label = '处理模型' }: {
  providers: readonly ProviderOption[], value: ActionModel | undefined, onChange: (value: ActionModel | undefined) => void, disabled?: boolean, label?: string
}) {
  const encoded = value === undefined ? '' : JSON.stringify([value.provider, value.model])
  const known = providers.some(provider => provider.id === value?.provider && provider.models.some(model => model.id === value.model))
  return <label className={css.field}>{label}<select aria-label={label} disabled={disabled} value={encoded} onChange={event => {
    if (event.currentTarget.value === '') onChange(undefined)
    else { const [provider, model] = JSON.parse(event.currentTarget.value) as [string, string]; onChange({ provider, model }) }
  }}><option value="">跟随来源会话模型</option>
    {value !== undefined && !known && <option value={encoded}>{value.provider} / {value.model}（暂不可用）</option>}
    {providers.map(provider => <optgroup key={provider.id} label={provider.name}>{provider.models.map(model => <option key={model.id} value={JSON.stringify([provider.id, model.id])}>{model.name}</option>)}</optgroup>)}
  </select></label>
}

import type { ActionModel } from '../../actions.ts'
import type { ProviderOption } from '../../topic.ts'
import { t, useLocale } from '../i18n.ts'

/**
 * Model select for settings rows; the row supplies the visible label.
 * Model identities are encoded together, so provider-local model IDs never collide.
 */
export function ModelChoice({ providers, value, onChange, disabled = false, label, className }: {
  providers: readonly ProviderOption[], value: ActionModel | undefined, onChange: (value: ActionModel | undefined) => void, disabled?: boolean, label: string, className?: string | undefined
}) {
  useLocale()
  const encoded = value === undefined ? '' : JSON.stringify([value.provider, value.model])
  const known = providers.some(provider => provider.id === value?.provider && provider.models.some(model => model.id === value.model))
  return <select className={className} aria-label={label} disabled={disabled} value={encoded} onChange={event => {
    if (event.currentTarget.value === '') onChange(undefined)
    else { const [provider, model] = JSON.parse(event.currentTarget.value) as [string, string]; onChange({ provider, model }) }
  }}>
    <option value="">{t('settings.actions.inheritModel')}</option>
    {value !== undefined && !known && <option value={encoded}>{t('settings.actions.unavailableModel', { provider: value.provider, model: value.model })}</option>}
    {providers.map(provider => <optgroup key={provider.id} label={provider.name}>{provider.models.map(model => <option key={model.id} value={JSON.stringify([provider.id, model.id])}>{model.name}</option>)}</optgroup>)}
  </select>
}

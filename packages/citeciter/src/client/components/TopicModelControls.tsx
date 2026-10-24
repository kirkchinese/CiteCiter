import { t, useLocale } from '../i18n.ts'
import { useState } from 'react'
import { IconChevronDownOutlineRegular, Menu, type MenuEntry } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ProviderOption, TopicModelConfig } from '../../topic.ts'
import css from './TopicModelControls.module.css'

const MODEL = 'model:'
const EFFORT = 'effort:'

/** Model and reasoning choices in the host's menu. Route changes are committed by the injected controller. */
export function TopicModelControls({ providers, route, saving, onModel, onReasoning }: {
  readonly providers: readonly ProviderOption[]
  readonly route: TopicModelConfig
  readonly saving: boolean
  readonly onModel: (provider: string, model: string) => void
  readonly onReasoning: (effort: string | null) => void
}) {
  useLocale()
  const [open, setOpen] = useState(false)
  const model = providers.find(provider => provider.id === route.provider)?.models.find(model => model.id === route.model)
  const name = model?.name ?? route.model
  const effort = model?.reasoningEfforts.find(item => item.id === route.reasoningEffort)?.name ?? t('panel.model.default')
  const items: MenuEntry[] = [
    ...providers.filter(provider => provider.models.length > 0).flatMap((provider): MenuEntry[] => [
      { type: 'label', id: `provider:${provider.id}`, text: provider.name },
      ...provider.models.map(item => ({ id: MODEL + JSON.stringify([provider.id, item.id]), label: item.name })),
    ]),
    // A flat group rather than a submenu: the panel sits at the window's right edge,
    // where a submenu opening to the right would be clipped.
    ...(model?.reasoningEfforts.length ? [
      { type: 'separator', id: 'efforts' } as const,
      { type: 'label', id: 'effort-label', text: t('panel.model.effort') } as const,
      { id: EFFORT, label: t('panel.model.modelDefault') },
      ...model.reasoningEfforts.map(item => ({ id: EFFORT + item.id, label: item.name })),
    ] : []),
  ]
  const select = (id: string) => {
    setOpen(false)
    if (id.startsWith(MODEL)) {
      const [provider, next] = JSON.parse(id.slice(MODEL.length)) as [string, string]
      onModel(provider, next)
    } else if (id.startsWith(EFFORT)) onReasoning(id === EFFORT ? null : id.slice(EFFORT.length))
  }
  return <Menu
    className={css.controls}
    open={open}
    onClose={() => setOpen(false)}
    side="top"
    align="end"
    portal
    items={items}
    selectedIds={[MODEL + JSON.stringify([route.provider, route.model]), EFFORT + (route.reasoningEffort ?? '')]}
    onSelect={select}
    anchor={<button type="button" className={css.trigger} aria-disabled={saving} aria-busy={saving} aria-label={t('panel.model.label', { name, effort })} aria-haspopup="menu" aria-expanded={open} onClick={() => { if (!saving) setOpen(value => !value) }}>
      <span>{name}</span><small>{effort}</small><IconChevronDownOutlineRegular className={css.chevron} />
    </button>}
  />
}

import { t, useLocale } from '../i18n.ts'
import { useState, type ReactNode } from 'react'
import { Menu, PermissionIconFullAccessRegular, PermissionIconReadOnlyRegular, PermissionIconWorkspaceWriteRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import type { CiteCiterSettings } from '../../topic.ts'
import css from './TopicModelControls.module.css'

export type PermissionMode = NonNullable<CiteCiterSettings['defaultPermission']>
/** DSH's own permission names and glyphs, in the host's order. */
const choices = (): readonly { readonly mode: PermissionMode, readonly label: string, readonly icon: () => ReactNode }[] => [
  { mode: 'read-only', label: t('panel.permission.readOnly'), icon: () => <PermissionIconReadOnlyRegular /> },
  { mode: 'workspace-write', label: t('panel.permission.workspaceWrite'), icon: () => <PermissionIconWorkspaceWriteRegular /> },
  { mode: 'danger-full-access', label: t('panel.permission.fullAccess'), icon: () => <PermissionIconFullAccessRegular /> },
]

/** Explicit permission selection in the host's menu; receives the Host's effective value. */
export function PermissionControl({ value, onChange }: { readonly value: PermissionMode, readonly onChange: (mode: PermissionMode) => void }) {
  useLocale()
  const [open, setOpen] = useState(false)
  const options = choices()
  const current = options.find(choice => choice.mode === value) ?? options[0]!
  return <Menu
    open={open}
    onClose={() => setOpen(false)}
    side="top"
    portal
    items={options.map(choice => ({ id: choice.mode, label: choice.label, icon: choice.icon() }))}
    selectedId={value}
    onSelect={id => { setOpen(false); onChange(id as PermissionMode) }}
    anchor={<button type="button" className={css.trigger} aria-label={t('panel.permission.label', { mode: current.label })} title={t('panel.permission.host')} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(state => !state)}>
      {current.icon()}<span>{current.label}</span>
    </button>}
  />
}

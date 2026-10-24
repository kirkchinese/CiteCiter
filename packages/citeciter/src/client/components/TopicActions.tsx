import { t, useLocale } from '../i18n.ts'
import { useState } from 'react'
import { IconEllipsisOutlineRegular, Menu, MenuItemButton } from '@deepseek-ai/dsh-client-ui-primitives'

/** Everything the Topic menu offers; callbacks own their dialogs and services. */
export interface TopicMenu {
  readonly topic: { readonly archived: boolean } | undefined
  readonly busy: boolean
  readonly learningRoute: boolean
  /** Whether ordinary context (runtime, time, skills, system prompt) is listed in the transcript. */
  readonly allContext: boolean
  readonly onAllContext: (shown: boolean) => void
  readonly onRename: () => void
  readonly onLearningRoute: (enabled: boolean) => void
  readonly onReader: () => void
  readonly onArchive: (archived: boolean) => void
  readonly onDelete: () => void
}

/** The "⋯" menu in the host's menu: rename, learning route, document reader, context visibility, archive and permanent deletion. */
export function TopicActions({ menu }: { readonly menu: TopicMenu }) {
  useLocale()
  const [open, setOpen] = useState(false)
  const choose = (action: () => void) => { setOpen(false); action() }
  const topic = menu.topic
  return <Menu
    open={open}
    onClose={() => setOpen(false)}
    align="end"
    portal
    anchor={<button type="button" title={t('panel.menu.more')} aria-label={t('panel.menu.actions')} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(value => !value)}>
      <IconEllipsisOutlineRegular />
    </button>}
  >
    <MenuItemButton disabled={topic === undefined} shortcut={{ keys: ['F2'] }} onSelect={() => choose(menu.onRename)}>{t('panel.menu.rename')}</MenuItemButton>
    <MenuItemButton onSelect={() => choose(() => menu.onLearningRoute(!menu.learningRoute))}>{menu.learningRoute ? t('panel.menu.disableLearning') : t('panel.menu.enableLearning')}</MenuItemButton>
    <MenuItemButton onSelect={() => choose(menu.onReader)}>{t('panel.menu.reader')}</MenuItemButton>
    <MenuItemButton disabled={topic === undefined} onSelect={() => choose(() => menu.onAllContext(!menu.allContext))}>{menu.allContext ? t('panel.menu.contextNotices') : t('panel.menu.allContext')}</MenuItemButton>
    <MenuItemButton disabled={topic === undefined || menu.busy} onSelect={() => choose(() => menu.onArchive(!topic!.archived))}>{topic?.archived === true ? t('panel.menu.restore') : t('panel.menu.archive')}</MenuItemButton>
    <MenuItemButton separatorBefore danger disabled={topic === undefined || menu.busy} onSelect={() => choose(menu.onDelete)}>{t('panel.menu.delete')}</MenuItemButton>
  </Menu>
}

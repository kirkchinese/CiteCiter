import { useState } from 'react'
import { IconEllipsisOutlineRegular, Menu, MenuItemButton } from '@deepseek-ai/dsh-client-ui-primitives'

/** Everything the Topic menu offers; callbacks own their dialogs and services. */
export interface TopicMenu {
  readonly topic: { readonly archived: boolean } | undefined
  readonly busy: boolean
  readonly learningRoute: boolean
  readonly onRename: () => void
  readonly onLearningRoute: (enabled: boolean) => void
  readonly onReader: () => void
  readonly onArchive: (archived: boolean) => void
  readonly onDelete: () => void
}

/** The "⋯" menu in the host's menu: rename, learning route, document reader, archive and permanent deletion. */
export function TopicActions({ menu }: { readonly menu: TopicMenu }) {
  const [open, setOpen] = useState(false)
  const choose = (action: () => void) => { setOpen(false); action() }
  const topic = menu.topic
  return <Menu
    open={open}
    onClose={() => setOpen(false)}
    align="end"
    portal
    anchor={<button type="button" title="更多" aria-label="Topic 操作" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(value => !value)}>
      <IconEllipsisOutlineRegular />
    </button>}
  >
    <MenuItemButton disabled={topic === undefined} shortcut={{ keys: ['F2'] }} onSelect={() => choose(menu.onRename)}>重命名</MenuItemButton>
    <MenuItemButton onSelect={() => choose(() => menu.onLearningRoute(!menu.learningRoute))}>{menu.learningRoute ? '关闭学习路线' : '开启学习路线'}</MenuItemButton>
    <MenuItemButton onSelect={() => choose(menu.onReader)}>文档阅读</MenuItemButton>
    <MenuItemButton disabled={topic === undefined || menu.busy} onSelect={() => choose(() => menu.onArchive(!topic!.archived))}>{topic?.archived === true ? '恢复 Topic' : '归档 Topic'}</MenuItemButton>
    <MenuItemButton separatorBefore danger disabled={topic === undefined || menu.busy} onSelect={() => choose(menu.onDelete)}>永久删除…</MenuItemButton>
  </Menu>
}

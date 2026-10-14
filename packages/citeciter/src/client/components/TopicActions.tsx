import { useCallback, useRef, useState } from 'react'
import { ChoicePopover } from './ChoicePopover.tsx'

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

/** The "⋯" menu: rename, learning route, document reader, archive and permanent deletion. */
export function TopicActions({ menu }: { readonly menu: TopicMenu }) {
  const [open, setOpen] = useState(false)
  const anchor = useRef<HTMLButtonElement>(null)
  const close = useCallback(() => setOpen(false), [])
  const choose = (action: () => void) => { close(); anchor.current?.focus(); action() }
  const topic = menu.topic
  return <>
    <button ref={anchor} type="button" title="更多" aria-label="Topic 操作" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(value => !value)}>
      <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10h.01M10 10h.01M15 10h.01" /></svg>
    </button>
    {open && <ChoicePopover anchor={anchor} label="Topic 操作" onClose={close}>
      <button type="button" role="menuitem" disabled={topic === undefined} onClick={() => choose(menu.onRename)}><span>重命名</span><kbd>F2</kbd></button>
      <button type="button" role="menuitemcheckbox" aria-checked={menu.learningRoute} onClick={() => choose(() => menu.onLearningRoute(!menu.learningRoute))}><span>学习路线</span><span>{menu.learningRoute ? '已开启' : '已关闭'}</span></button>
      <button type="button" role="menuitem" onClick={() => choose(menu.onReader)}>文档阅读</button>
      <button type="button" role="menuitem" disabled={topic === undefined || menu.busy} onClick={() => choose(() => menu.onArchive(!topic!.archived))}>{topic?.archived === true ? '恢复 Topic' : '归档 Topic'}</button>
      <hr />
      <button type="button" role="menuitem" data-danger disabled={topic === undefined || menu.busy} onClick={() => choose(menu.onDelete)}>永久删除…</button>
    </ChoicePopover>}
  </>
}

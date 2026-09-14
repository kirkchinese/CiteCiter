import { useCallback, useRef, useState } from 'react'
import { ChoicePopover } from './ChoicePopover.tsx'

/** Workspace actions remain reachable without a floating launcher over the composer. Callbacks own their dialogs and services. */
export function TopicActions({ hasTopic, onSettings, onReader }: { readonly hasTopic: boolean, readonly onSettings: () => void, readonly onReader: () => void }) {
  const [open, setOpen] = useState(false)
  const anchor = useRef<HTMLButtonElement>(null)
  const close = useCallback(() => setOpen(false), [])
  const choose = (action: () => void) => { close(); anchor.current?.focus(); action() }
  return <>
    <button ref={anchor} type="button" title="Topic 操作" aria-label="Topic 操作" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(value => !value)}>
      <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h.1M10 10h.1M16 10h.1" /></svg>
    </button>
    {open && <ChoicePopover anchor={anchor} label="Topic 操作" onClose={close}>
      <button type="button" role="menuitem" onClick={() => choose(onReader)}>文档阅读</button>
      <button type="button" role="menuitem" disabled={!hasTopic} onClick={() => choose(onSettings)}>Topic 设置</button>
    </ChoicePopover>}
  </>
}

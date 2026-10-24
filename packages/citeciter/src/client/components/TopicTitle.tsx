import { t, useLocale } from '../i18n.ts'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import css from './TopicNavigation.module.css'

/**
 * Inline rename committed by Enter or blur, cancelled by Escape. Double-click, F2 or a
 * changed `renameRequest` (the Topic menu) start editing.
 */
export function TopicTitle({ id, title, onRename, renameRequest = 0 }: { readonly id: string, readonly title: string, readonly onRename: (title: string) => Promise<boolean>, readonly renameRequest?: number }) {
  useLocale()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(title)
  const [error, setError] = useState(false)
  const saving = useRef(false)
  const cancelled = useRef(false)
  const restoreFocus = useRef(false)
  const titleRef = useRef<HTMLElement>(null)
  const handledRequest = useRef(renameRequest)
  useEffect(() => { restoreFocus.current = false; setEditing(false); setValue(title); setError(false) }, [id])
  useLayoutEffect(() => {
    if (editing || !restoreFocus.current) return
    restoreFocus.current = false
    titleRef.current?.focus()
  }, [editing])
  const start = () => { cancelled.current = false; setValue(title); setError(false); setEditing(true) }
  useEffect(() => {
    if (renameRequest === handledRequest.current) return
    handledRequest.current = renameRequest
    start()
  }, [renameRequest])
  const save = async () => {
    if (saving.current || cancelled.current) return
    if (!value.trim() || value.trim() === title) { setEditing(false); return }
    saving.current = true
    try { if (await onRename(value.trim())) setEditing(false); else setError(true) }
    finally { saving.current = false }
  }
  return editing ? <input className={css.rename} aria-label={t('panel.title.name')} aria-invalid={error} title={error ? t('panel.title.saveFailed') : undefined} autoFocus value={value} maxLength={120} onFocus={event => event.currentTarget.select()} onChange={event => setValue(event.currentTarget.value)} onBlur={() => { void save() }} onKeyDown={event => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); cancelled.current = true; restoreFocus.current = true; setEditing(false) }
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) { event.preventDefault(); void save() }
  }} /> : <strong ref={titleRef} data-topic-title className={css.title} tabIndex={0} title={t('panel.title.renameHint')} onDoubleClick={start} onKeyDown={event => { if (event.key === 'F2') { event.preventDefault(); start() } }}>{title}</strong>
}

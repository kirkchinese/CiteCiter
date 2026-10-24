import { useEffect, useMemo, useRef, useState } from 'react'
import type { DocumentPreviewProps } from '@deepseek-ai/dsh-client-ui-sidebar-documentpreview/client'
import type { ActionSource } from '../action-controller.ts'
import type { SelectionSurfaces } from '../wheel-gesture.ts'
import { decodeNativeText, nativeDocumentSource } from '../native-document.ts'
import { readTextareaSelection } from '../reader-selection.ts'
import { t, useLocale } from '../i18n.ts'
import css from './NativeLearningDocument.module.css'
import { documentPages } from '../../document-pages.ts'

export interface LearningDocumentActions {
  readonly registerSurface: SelectionSurfaces['register']
  readonly openActions: (source: ActionSource, x: number, y: number) => void
}

/** Alternate native document renderer. DSH owns loading, reload and file navigation. */
export function NativeLearningDocument({ content, resourceAddress, wrap, scrollportRef, registerSurface, openActions }: DocumentPreviewProps & LearningDocumentActions) {
  const localeRevision = useLocale()
  const field = useRef<HTMLTextAreaElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const decoded = useMemo(() => { try { return { text: decodeNativeText(content), error: null } } catch (error) { return { text: '', error: error instanceof Error ? error.message : String(error) } } }, [content, localeRevision])
  const pages = useMemo(() => documentPages(decoded.text), [decoded.text])
  const currentPage = Math.min(page, pages.length - 1)
  const read = () => {
    const selected = field.current === null ? null : readTextareaSelection(field.current)
    if (selected === null || decoded.error !== null) return null
    try { return nativeDocumentSource(resourceAddress, decoded.text, selected) }
    catch (error) { setError(error instanceof Error ? error.message : String(error)); return null }
  }
  useEffect(() => { const element = field.current; if (element === null) return; return registerSurface(element, read) }, [registerSurface, resourceAddress, decoded.text, currentPage])
  useEffect(() => { setError(null); setPage(0) }, [content, resourceAddress])
  useEffect(() => { field.current?.setSelectionRange(0,0); if (field.current !== null) field.current.scrollTop = 0 }, [currentPage, decoded.text])
  return <section className={css.document}>
    <header><div><strong>{t('settings.native.title')}</strong><small>{t('settings.native.hint')}</small></div><button type="button" onClick={event => { try { const source = read(); if (source === null) { setError(t('settings.native.select')); return }; setError(null); const rect = event.currentTarget.getBoundingClientRect(); openActions(source, rect.left, rect.bottom) } catch (error) { setError(String(error)) } }}>{t('settings.native.actions')}</button></header>
    <p>{t('settings.native.snapshot')}</p>
    {(decoded.error ?? error) !== null && <p role="alert">{decoded.error ?? error}</p>}
    {pages.length > 1 && <nav aria-label={t('settings.native.pagination')}><button type="button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>{t('settings.reader.previous')}</button><span>{currentPage + 1} / {pages.length}</span><button type="button" disabled={currentPage === pages.length - 1} onClick={() => setPage(currentPage + 1)}>{t('settings.reader.next')}</button></nav>}
    <textarea ref={element => { field.current = element; scrollportRef(element) }} readOnly aria-label={t('settings.native.body')} value={pages[currentPage] ?? ''} wrap={wrap ? 'soft' : 'off'} spellCheck={false} />
  </section>
}

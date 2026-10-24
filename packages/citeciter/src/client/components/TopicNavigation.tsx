import { isChinese, t, useLocale } from '../i18n.ts'
import { useEffect, useRef, useState } from 'react'
import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store'
import { IconPlusOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import type { DocumentSummary, TopicSummary } from '../../topic.ts'
import type { DocumentLibrarySnapshot } from '../document-library.ts'
import type { DocumentActions } from '../view-actions.ts'
import css from './TopicNavigation.module.css'
import { TopicActions, type TopicMenu } from './TopicActions.tsx'

/** Which page of the list popover is showing. */
export type ListPage = 'topics' | 'documents'

/** Ask the list to open on a page; `revision` changes on every request. */
export interface ListRequest {
  readonly page: ListPage
  readonly revision: number
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const dateFormat = (time: number) => new Date(time).toLocaleString(isChinese() ? 'zh-CN' : 'en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

/** One library document: open on click; deleting asks for a second click. */
function DocumentRow({ document, onOpen, onRemove }: { readonly document: DocumentSummary, readonly onOpen: () => void, readonly onRemove: () => void }) {
  const [confirming, setConfirming] = useState(false)
  useEffect(() => {
    if (!confirming) return
    const timer = setTimeout(() => setConfirming(false), 3000)
    return () => clearTimeout(timer)
  }, [confirming])
  return <div className={css.documentRow}>
    <button className={css.row} type="button" onClick={onOpen}>
      <span className={css.rowText}><strong>{document.title}</strong><small>{document.format === 'markdown' ? 'Markdown' : t('settings.reader.text')} · {formatSize(document.size)} · {dateFormat(document.importedAt)}</small></span>
    </button>
    <button type="button" className={css.remove} data-confirming={confirming || undefined} aria-label={t('settings.reader.deleteAria', { title: document.title })}
      onClick={() => { if (confirming) { setConfirming(false); onRemove() } else setConfirming(true) }}>
      {confirming ? t('settings.reader.confirmDelete') : t('settings.reader.delete')}
    </button>
  </div>
}

/** Topic list and Citer's documents, with the new-Topic button and the Topic menu. Receives rows and callbacks, without service discovery. */
export function TopicNavigation({ topics, activeId, archived, onOpen, onNew, onArchiveView, menu, useLibrary, documents, listRequest }: {
  readonly topics: readonly TopicSummary[]
  readonly activeId: string | undefined
  readonly archived: boolean
  readonly onOpen: (id: string) => void
  readonly onNew: () => void
  readonly onArchiveView: (archived: boolean) => void
  readonly menu: TopicMenu
  readonly useLibrary: SnapshotSelectorHook<DocumentLibrarySnapshot>
  readonly documents: DocumentActions
  readonly listRequest?: ListRequest | undefined
}) {
  useLocale()
  const library = useLibrary(value => value)
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState<ListPage>('topics')
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (!open) return
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !ref.current?.contains(event.target)) setOpen(false) }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])
  useEffect(() => {
    if (listRequest === undefined) return
    setPage(listRequest.page)
    setOpen(true)
  }, [listRequest?.revision])
  useEffect(() => { if (open && page === 'documents') void documents.refresh() }, [open, page, documents])
  const needle = query.toLocaleLowerCase()
  const rows = topics.filter(topic => topic.title.toLocaleLowerCase().includes(needle))
  const documentRows = library.documents.filter(document => document.title.toLocaleLowerCase().includes(needle))
  return <div ref={ref} className={css.navigation}>
    <div className={css.actions}>
      <button type="button" title={t('panel.nav.list')} aria-label={t('panel.nav.list')} aria-expanded={open} onClick={() => setOpen(!open)}><svg className={css.drawn} viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5.5h10M7 10h10M7 14.5h10M3 5.5h.01M3 10h.01M3 14.5h.01" /></svg></button>
      <button type="button" title={t('panel.newTopic')} aria-label={t('panel.newTopic')} onClick={() => { setOpen(false); onNew() }}><IconPlusOutlineRegular /></button>
      <TopicActions menu={menu} />
    </div>
    {open && <section className={css.list} aria-label={t('panel.nav.list')} onKeyDown={event => { if (event.key === 'Escape') setOpen(false) }}>
      <div className={css.pages} role="tablist">
        <button type="button" role="tab" aria-selected={page === 'topics'} onClick={() => setPage('topics')}>{t('settings.reader.topics')}</button>
        <button type="button" role="tab" aria-selected={page === 'documents'} onClick={() => setPage('documents')}>{t('settings.reader.title')}</button>
      </div>
      <div className={css.search}>
        <input autoFocus placeholder={page === 'topics' ? t('panel.nav.search') : t('settings.reader.search')} aria-label={page === 'topics' ? t('panel.nav.search') : t('settings.reader.search')} value={query} onChange={event => setQuery(event.currentTarget.value)} />
        {page === 'topics'
          ? <button type="button" className={css.archiveToggle} aria-pressed={archived} onClick={() => onArchiveView(!archived)}>{archived ? t('panel.nav.showActive') : t('panel.nav.showArchived')}</button>
          : <button type="button" className={css.archiveToggle} disabled={library.importing} onClick={() => fileInput.current?.click()}>{library.importing ? t('settings.reader.importing') : t('settings.reader.import')}</button>}
        <input ref={fileInput} type="file" hidden accept=".md,.markdown,.txt,text/plain,text/markdown" onChange={(event) => {
          const input = event.currentTarget
          const file = input.files?.[0]
          input.value = ''
          if (file !== undefined) void documents.importFile(file).then(() => setOpen(false))
        }} />
      </div>
      {page === 'topics'
        ? <div className={css.rows}>{rows.length === 0 && <p>{query ? t('panel.nav.noMatches') : archived ? t('panel.nav.noArchived') : t('panel.nav.empty')}</p>}{rows.map(topic => <button className={css.row} type="button" key={topic.sessionId} aria-current={activeId === topic.sessionId ? 'page' : undefined} onClick={() => { onOpen(topic.sessionId); setOpen(false) }}>
            <span className={css.rowText}><strong>{topic.title}</strong><small>{dateFormat(topic.updatedAt)}</small></span>
            {topic.running && <span className={css.running} aria-label={t('panel.phase.running')} />}
          </button>)}</div>
        : <div className={css.rows}>
            {library.error !== null && <p role="alert">{library.error}</p>}
            {documentRows.length === 0 && <p>{query ? t('panel.nav.noMatches') : t('settings.reader.importHint')}</p>}
            {documentRows.map(document => <DocumentRow key={document.documentId} document={document}
              onOpen={() => { documents.open(document.documentId); setOpen(false) }}
              onRemove={() => { void documents.remove(document.documentId) }} />)}
          </div>}
    </section>}
  </div>
}

import { t, useLocale } from '../i18n.ts'
import { useEffect, useRef, useState } from 'react'
import { IconPlusOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import type { TopicSummary } from '../../topic.ts'
import css from './TopicNavigation.module.css'
import { TopicActions, type TopicMenu } from './TopicActions.tsx'

/** Topic list with search, new Topic and the Topic menu. Receives domain rows and callbacks, without service discovery. */
export function TopicNavigation({ topics, activeId, archived, onOpen, onNew, onArchiveView, menu }: {
  readonly topics: readonly TopicSummary[]
  readonly activeId: string | undefined
  readonly archived: boolean
  readonly onOpen: (id: string) => void
  readonly onNew: () => void
  readonly onArchiveView: (archived: boolean) => void
  readonly menu: TopicMenu
}) {
  useLocale()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !ref.current?.contains(event.target)) setOpen(false) }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])
  const rows = topics.filter(topic => topic.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
  return <div ref={ref} className={css.navigation}>
    <div className={css.actions}>
      <button type="button" title={t('panel.nav.list')} aria-label={t('panel.nav.list')} aria-expanded={open} onClick={() => setOpen(!open)}><svg className={css.drawn} viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5.5h10M7 10h10M7 14.5h10M3 5.5h.01M3 10h.01M3 14.5h.01" /></svg></button>
      <button type="button" title={t('panel.newTopic')} aria-label={t('panel.newTopic')} onClick={() => { setOpen(false); onNew() }}><IconPlusOutlineRegular /></button>
      <TopicActions menu={menu} />
    </div>
    {open && <section className={css.list} aria-label={t('panel.nav.list')} onKeyDown={event => { if (event.key === 'Escape') setOpen(false) }}>
      <div className={css.search}>
        <input autoFocus placeholder={t('panel.nav.search')} aria-label={t('panel.nav.search')} value={query} onChange={event => setQuery(event.currentTarget.value)} />
        <button type="button" className={css.archiveToggle} aria-pressed={archived} onClick={() => onArchiveView(!archived)}>{archived ? t('panel.nav.showActive') : t('panel.nav.showArchived')}</button>
      </div>
      <div className={css.rows}>{rows.length === 0 && <p>{query ? t('panel.nav.noMatches') : archived ? t('panel.nav.noArchived') : t('panel.nav.empty')}</p>}{rows.map(topic => <button className={css.row} type="button" key={topic.sessionId} aria-current={activeId === topic.sessionId ? 'page' : undefined} onClick={() => { onOpen(topic.sessionId); setOpen(false) }}>
        <span className={css.rowText}><strong>{topic.title}</strong><small>{new Date(topic.updatedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</small></span>
        {topic.running && <span className={css.running} aria-label={t('panel.phase.running')} />}
      </button>)}</div>
    </section>}
  </div>
}

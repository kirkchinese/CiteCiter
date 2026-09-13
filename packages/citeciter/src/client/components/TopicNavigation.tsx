import { useEffect, useRef, useState } from 'react'
import type { TopicSummary } from '../../topic.ts'
import css from './TopicNavigation.module.css'
import { TopicActions } from './TopicActions.tsx'

/** Session-list navigation with search. Receives domain rows and callbacks, without service discovery. */
export function TopicNavigation({ topics, activeId, archived, onOpen, onNew, onArchiveView, onSettings, onReader }: {
  readonly topics: readonly TopicSummary[]
  readonly activeId: string | undefined
  readonly archived: boolean
  readonly onOpen: (id: string) => void
  readonly onNew: () => void
  readonly onArchiveView: (archived: boolean) => void
  readonly onSettings: () => void
  readonly onReader: () => void
}) {
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
      <button type="button" title="Topic 列表" aria-label="Topic 列表" aria-expanded={open} onClick={() => setOpen(!open)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 5h11M6 10h11M6 15h11M2 5h.1M2 10h.1M2 15h.1" /></svg></button>
      <button type="button" title="新建 Topic" aria-label="新建 Topic" onClick={() => { setOpen(false); onNew() }}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v14M3 10h14" /></svg></button>
      <TopicActions hasTopic={activeId !== undefined} onSettings={onSettings} onReader={onReader} />
    </div>
    {open && <section className={css.list} aria-label="Topic 会话列表" onKeyDown={event => { if (event.key === 'Escape') setOpen(false) }}>
      <div className={css.search}><input autoFocus placeholder="搜索 Topic" aria-label="搜索 Topic" value={query} onChange={event => setQuery(event.currentTarget.value)} /><button type="button" title={archived ? '活动 Topic' : '归档 Topic'} aria-label={archived ? '活动 Topic' : '归档 Topic'} aria-pressed={archived} onClick={() => onArchiveView(!archived)}>▣</button></div>
      <div className={css.rows}>{rows.length === 0 && <p>{query ? '没有匹配的 Topic' : '暂无 Topic'}</p>}{rows.map(topic => <button className={css.row} type="button" key={topic.sessionId} aria-current={activeId === topic.sessionId ? 'page' : undefined} onClick={() => { onOpen(topic.sessionId); setOpen(false) }}>
        <span className={css.dot} data-running={topic.running || undefined} /><span className={css.rowText}><strong>{topic.title}</strong><small>{new Date(topic.updatedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</small></span>
      </button>)}</div>
    </section>}
  </div>
}

import { IconChevronLeftOutlineRegular, IconChevronRightOutlineRegular, IconCloseOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store'
import type { ReaderSnapshot } from '../reader-controller.ts'
import type { ReaderActions } from '../view-actions.ts'
import { type ChangeEvent, type FormEvent, useRef, useEffect } from 'react'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { SelectionSurfaces } from '../wheel-gesture.ts'
import { readTextareaSelection } from '../reader-selection.ts'
import { OverlayPortal } from './OverlayPortal.tsx'
import css from './DocumentReader.module.css'

/** Human-readable size for the document list. */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** The document library panel, opened from the Topic menu. */
export function DocumentReader({ reader, useReader, registerSurface, sourceSessionId }: { readonly reader: ReaderActions
  readonly useReader: SnapshotSelectorHook<ReaderSnapshot>
  readonly registerSurface: SelectionSurfaces['register']
  readonly sourceSessionId: () => SessionId | null
}) {
  const snapshot = useReader(value => value)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const importRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    const element = textareaRef.current
    const active = snapshot.active
    if (element === null || active === null || snapshot.loading) return
    return registerSurface(element, () => {
      const selected = readTextareaSelection(element)
      const source = sourceSessionId()
      return selected === null || source === null ? null : { kind: 'document', sourceSessionId: source, title: active.title, documentId: active.documentId, ...selected }
    })
  }, [registerSurface, sourceSessionId, snapshot.active, snapshot.open, snapshot.loading])

  const syncSelection = () => {
    const textarea = textareaRef.current
    reader.setSelection(textarea === null ? null : readTextareaSelection(textarea))
  }
  const onImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (file === undefined) return
    await reader.importLocalFile(file)
    input.value = ''
  }
  const onCreate = (event: FormEvent) => {
    event.preventDefault()
    void reader.createTopic()
  }

  return (
    <OverlayPortal>
    <div className={css.root}>
      {snapshot.open && (
        <section className={css.panel} data-citeciter-reader>
          <header className={css.header}>
            <h2>文档阅读</h2>
            <button type="button" onClick={() => reader.setOpen(false)} aria-label="关闭文档阅读"><IconCloseOutlineRegular /></button>
          </header>
          {snapshot.error !== null ? <p className={css.error}>{snapshot.error}</p> : null}
          <div className={css.import}>
            <button type="button" disabled={snapshot.importing} onClick={() => importRef.current?.click()} aria-label="导入文本 / Markdown">{snapshot.importing ? '导入中…' : '+ 导入文档'}</button>
            <input ref={importRef} type="file" hidden disabled={snapshot.importing} accept=".txt,.md,.markdown,text/plain,text/markdown" onChange={(event) => void onImport(event)} />
          </div>
          <ul className={css.documents}>
            {snapshot.documents.map((document) => (
              <li key={document.documentId}>
                <button
                  type="button"
                  onClick={() => void reader.openDocument(document.documentId)}
                  className={snapshot.active?.documentId === document.documentId ? css.activeDocument : undefined}
                >
                  {document.title}
                  <span>{document.format === 'markdown' ? 'Markdown' : '文本'} · {formatSize(document.size)}</span>
                </button>
              </li>
            ))}
            {snapshot.documentsStatus === 'ready' && snapshot.documents.length === 0 ? <li className={css.empty}>还没有文档</li> : null}
          </ul>
          <textarea
            aria-label="文档正文"
            aria-busy={snapshot.loading}
            ref={textareaRef}
            className={css.content}
            readOnly
            value={snapshot.active?.content ?? ''}
            placeholder="选择文档开始阅读"
            onSelect={snapshot.loading ? undefined : syncSelection}
            onMouseUp={snapshot.loading ? undefined : syncSelection}
            onKeyUp={snapshot.loading ? undefined : syncSelection}
          />
          {snapshot.active !== null ? (
            <nav className={css.pagination} aria-label="文档分页">
              <button type="button" aria-label="上一页" disabled={snapshot.loading || snapshot.active.page === 0} onClick={() => void reader.openPage(snapshot.active!.page - 1)}><IconChevronLeftOutlineRegular /></button>
              <span role="status">{snapshot.loading ? '加载中…' : `第 ${snapshot.active.page + 1} / ${snapshot.active.pageCount} 页`}</span>
              <button type="button" aria-label="下一页" disabled={snapshot.loading || snapshot.active.page + 1 >= snapshot.active.pageCount} onClick={() => void reader.openPage(snapshot.active!.page + 1)}><IconChevronRightOutlineRegular /></button>
            </nav>
          ) : null}
          <form className={css.ask} onSubmit={onCreate}>
            <input
              value={snapshot.question}
              maxLength={12_000}
              onChange={(event) => reader.setQuestion(event.target.value)}
              placeholder="选中正文后，写下你的问题"
              aria-label="关于选中内容的问题"
            />
            <button type="submit" disabled={snapshot.creating || snapshot.loading || snapshot.selection === null || snapshot.question.trim() === ''}>
              {snapshot.creating ? '正在打开…' : '在 Citer 中提问'}
            </button>
          </form>
        </section>
      )}
    </div>
    </OverlayPortal>
  )
}

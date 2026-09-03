import { type ChangeEvent, type FormEvent, useRef, useSyncExternalStore } from 'react'
import type { ReaderFace } from '../reader-controller.ts'
import { readTextareaSelection } from '../reader-selection.ts'
import css from './DocumentReader.module.css'

/** Reader shell-overlay entry: compact trigger plus the document library panel. */
export function DocumentReader({ reader }: { readonly reader: ReaderFace }) {
  const snapshot = useSyncExternalStore(reader.subscribe, reader.getSnapshot)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const syncSelection = () => {
    const textarea = textareaRef.current
    reader.setSelection(textarea === null ? null : readTextareaSelection(textarea))
  }
  const onImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file === undefined) return
    const content = await file.text()
    await reader.importFile(file.name, content)
    event.target.value = ''
  }
  const onCreate = (event: FormEvent) => {
    event.preventDefault()
    void reader.createTopic()
  }

  return (
    <div className={css.root}>
      {!snapshot.open ? (
        <button
          type="button"
          className={css.trigger}
          onClick={() => reader.setOpen(true)}
          title="打开 CiteCiter 读书"
        >
          📖
        </button>
      ) : (
        <section className={css.panel} data-citeciter-reader>
          <header className={css.header}>
            <h2>读书 · 论文</h2>
            <button type="button" onClick={() => reader.setOpen(false)} aria-label="关闭读书面板">×</button>
          </header>
          {snapshot.error !== null ? <p className={css.error}>{snapshot.error}</p> : null}
          <label className={css.import}>
            导入文本 / Markdown
            <input type="file" accept=".txt,.md,.markdown,text/plain,text/markdown" onChange={(event) => void onImport(event)} />
          </label>
          <ul className={css.documents}>
            {snapshot.documents.map((document) => (
              <li key={document.documentId}>
                <button
                  type="button"
                  onClick={() => void reader.openDocument(document.documentId)}
                  className={snapshot.active?.documentId === document.documentId ? css.activeDocument : undefined}
                >
                  {document.title}
                  <span>{document.format} · {document.size} B</span>
                </button>
              </li>
            ))}
            {snapshot.documentsStatus === 'ready' && snapshot.documents.length === 0 ? <li className={css.empty}>还没有文档</li> : null}
          </ul>
          <textarea
            ref={textareaRef}
            className={css.content}
            readOnly
            value={snapshot.active?.content ?? ''}
            placeholder="选择文档开始阅读"
            onSelect={syncSelection}
            onMouseUp={syncSelection}
            onKeyUp={syncSelection}
          />
          <form className={css.ask} onSubmit={onCreate}>
            <input
              value={snapshot.question}
              maxLength={12_000}
              onChange={(event) => reader.setQuestion(event.target.value)}
              placeholder="就选中内容问 CiteCiter…"
              aria-label="读书面板的问题"
            />
            <button type="submit" disabled={snapshot.creating || snapshot.selection === null || snapshot.question.trim() === ''}>
              {snapshot.creating ? '创建中…' : 'Citer!'}
            </button>
          </form>
        </section>
      )}
    </div>
  )
}

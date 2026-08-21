import { type FormEvent, useEffect, useState, useSyncExternalStore } from 'react'
import type { CompanionFace, CreateMode } from '../companion-controller.ts'
import type { CiteBus } from '../types.ts'
import css from './CiteCiter.module.css'

const PREVIEW_LIMIT = 96

export interface SelectionMenuProps {
  readonly bus: CiteBus
  readonly companion: CompanionFace
  readonly openPanel: () => void
}

/** Ask the first question beside the selected source text. */
export function SelectionMenu({ bus, companion, openPanel }: SelectionMenuProps) {
  const overlay = useSyncExternalStore(bus.subscribe, bus.getSnapshot)
  const snapshot = useSyncExternalStore(companion.subscribe, companion.getSnapshot)
  const [question, setQuestion] = useState('')
  const [mode, setMode] = useState<CreateMode>(snapshot.settings.defaultMode)
  const selection = overlay.menuSelection

  useEffect(() => {
    if (selection === null) return
    setQuestion('')
    setMode(snapshot.settings.defaultMode)
  }, [selection, snapshot.settings.defaultMode])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (selection === null || question.trim() === '') return
    const prompt = question.trim()
    openPanel()
    bus.setMenuSelection(null)
    void companion.create(selection, prompt, mode)
  }

  const preview = selection === null
    ? ''
    : selection.displayText.length > PREVIEW_LIMIT
      ? selection.displayText.slice(0, PREVIEW_LIMIT) + '…'
      : selection.displayText
  const left = selection === null ? 0 : Math.max(12, Math.min(selection.x, window.innerWidth - 390))
  const top = selection === null ? 0 : Math.max(12, Math.min(selection.y, window.innerHeight - 260))

  return (
    <>
      {selection !== null && (
        <form
          className={css.selectionPopover}
          data-citeciter-menu
          style={{ left, top }}
          role="dialog"
          aria-label="向 CiteCiter 提问"
          onSubmit={submit}
        >
          <div className={css.popoverQuote} title={selection.displayText}>“{preview}”</div>
          <div className={css.popoverComposer}>
            <input
              autoFocus
              value={question}
              maxLength={12_000}
              onChange={(event) => setQuestion(event.currentTarget.value)}
              placeholder="哪里没看懂？"
              aria-label="CiteCiter 的第一个问题"
            />
            <button type="submit" disabled={question.trim() === ''}>Citer!</button>
          </div>
          <details className={css.popoverMode}>
            <summary>上下文方式：{mode === 'observer' ? '旁观（推荐）' : mode === 'exact-fork' ? '精确分叉' : '可用时精确分叉'}</summary>
            <select value={mode} onChange={(event) => setMode(event.currentTarget.value as CreateMode)}>
              <option value="observer">旁观：来源继续更新</option>
              <option value="exact-when-available">轮次结束时精确，否则旁观</option>
              <option value="exact-fork">精确分叉：要求轮次已结束</option>
            </select>
          </details>
        </form>
      )}
      {snapshot.sourceSessionId !== null && !overlay.panelOpen && (
        <button
          className={css.topicLauncher}
          type="button"
          onClick={openPanel}
          aria-label={snapshot.topics.length === 0
            ? '打开 CiteCiter'
            : '打开 CiteCiter，共 ' + snapshot.topics.length + ' 个讨论'}
          title="打开 CiteCiter"
        >
          <span aria-hidden="true">🐋</span>
          {snapshot.topics.length > 0 && <span>{snapshot.topics.length}</span>}
        </button>
      )}
    </>
  )
}

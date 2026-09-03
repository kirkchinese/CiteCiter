import { type FormEvent, useEffect, useState, useSyncExternalStore } from 'react'
import type { CompanionFace, CreateMode } from '../companion-controller.ts'
import type { TopicScenario } from '../../topic.ts'
import type { CiteBus } from '../types.ts'
import mascotUrl from '../assets/citeciter-mascot.png'
import css from './CiteCiter.module.css'

const PREVIEW_LIMIT = 96

export interface SelectionMenuProps {
  readonly bus: CiteBus
  readonly companion: CompanionFace
  readonly openPanel: () => void
}

/**
 * Ask the first question beside the selected source text.
 * @param props - shared selection state and Topic actions.
 * @returns the contextual creation popover and companion launcher.
 */
export function SelectionMenu({ bus, companion, openPanel }: SelectionMenuProps) {
  const overlay = useSyncExternalStore(bus.subscribe, bus.getSnapshot)
  const snapshot = useSyncExternalStore(companion.subscribe, companion.getSnapshot)
  const [question, setQuestion] = useState('')
  const [mode, setMode] = useState<CreateMode>(snapshot.settings.defaultMode)
  const [scenario, setScenario] = useState<TopicScenario>('qa')
  const selection = overlay.menuSelection

  useEffect(() => {
    if (selection === null) return
    setQuestion('')
    setMode(snapshot.settings.defaultMode)
    setScenario('qa')
  }, [selection, snapshot.settings.defaultMode])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (selection === null || question.trim() === '') return
    const prompt = question.trim()
    openPanel()
    bus.setMenuSelection(null)
    void companion.create(selection, prompt, mode, scenario)
  }

  const preview = selection === null
    ? ''
    : selection.displayText.length > PREVIEW_LIMIT
      ? selection.displayText.slice(0, PREVIEW_LIMIT) + '…'
      : selection.displayText
  const left = selection === null ? 0 : Math.max(12, Math.min(selection.x, window.innerWidth - 390))
  const top = selection === null ? 0 : Math.max(12, Math.min(selection.y, window.innerHeight - 350))

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
          {(snapshot.settings.promptTemplates ?? []).length > 0 && (
            <div className={css.popoverTemplates}>
              {(snapshot.settings.promptTemplates ?? []).map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setQuestion(template.text)}
                  title={template.text}
                >
                  {template.label}
                </button>
              ))}
            </div>
          )}
          <div className={css.popoverComposer}>
            <input
              autoFocus
              value={question}
              maxLength={12_000}
              onChange={(event) => setQuestion(event.currentTarget.value)}
              placeholder={scenario === 'present' ? '希望 CiteCiter 怎样讲解？' : '哪里没看懂？'}
              aria-label="CiteCiter 的第一个问题"
            />
            <button type="submit" disabled={question.trim() === ''}>
              {scenario === 'present' ? '开始讲解' : '开始提问'}
            </button>
          </div>
          <details className={css.popoverMode}>
            <summary>上下文方式：{mode === 'observer' ? '旁观（推荐）' : mode === 'exact-fork' ? '精确分叉' : '可用时精确分叉'}</summary>
            <select value={mode} onChange={(event) => setMode(event.currentTarget.value as CreateMode)}>
              <option value="observer">旁观：来源继续更新</option>
              <option value="exact-when-available">轮次结束时精确，否则旁观</option>
              <option value="exact-fork">精确分叉：要求轮次已结束</option>
            </select>
          </details>
          {selection.kind === 'assistant-step' && (
            <fieldset className={css.scenarioPicker}>
              <legend>Topic 形态</legend>
              <button
                type="button"
                data-active={scenario === 'qa' || undefined}
                aria-pressed={scenario === 'qa'}
                onClick={() => setScenario('qa')}
              >
                <strong>问答</strong>
                <span>直接讨论选中内容</span>
              </button>
              <button
                type="button"
                data-active={scenario === 'present' || undefined}
                aria-pressed={scenario === 'present'}
                onClick={() => setScenario('present')}
              >
                <strong>讲解</strong>
                <span>同步整理到小黑板</span>
              </button>
            </fieldset>
          )}
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
          <img src={mascotUrl} alt="" aria-hidden="true" />
          {snapshot.topics.length > 0 && <span className={css.launcherCount}>{snapshot.topics.length}</span>}
        </button>
      )}
    </>
  )
}

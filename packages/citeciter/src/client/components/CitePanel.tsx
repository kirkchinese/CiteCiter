import { type FormEvent, useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import type { ExplainFace, ExplainPhase, ThreadSummary } from '../explainer.ts'
import { RichAnswer } from './RichAnswer.tsx'
import css from './CiteCiter.module.css'

/** Dependencies injected into the session-scoped details entry. */
export interface CitePanelProps {
  readonly close: () => void
  readonly explainer: ExplainFace
}

const PHASE_LABEL: Record<ExplainPhase, string> = {
  idle: '选择一条 Citation Thread',
  draft: '提出你的问题',
  creating: '正在创建只读 Thread…',
  ready: '可以继续追问',
  running: '正在回答…',
  error: '需要处理',
}

const INITIAL_QUESTIONS = [
  '请结合它在原对话中的上下文，深入解释这段话。',
  '请给一个具体例子，帮助我理解这段话。',
  '这段话为什么成立？请从原理讲起。',
] as const

const FOLLOW_UPS = [
  '换一种更直观的方式解释。',
  '再给一个不同的例子。',
  '它和前文的推理有什么关系？',
] as const

function threadLabel(thread: ThreadSummary): string {
  const title = thread.title?.trim()
  if (title !== undefined && title !== '') return title
  const quote = thread.citation.selectedText.replaceAll(/\s+/g, ' ').trim()
  return quote.length > 34 ? `${quote.slice(0, 34)}…` : quote
}

/** Render one parent-grouped Thread selector. */
function ThreadPicker({ threads, activeId, onChange }: {
  readonly threads: readonly ThreadSummary[]
  readonly activeId: string | null
  readonly onChange: (sessionId: string) => void
}) {
  const groups = useMemo(() => {
    const grouped = new Map<string, { title: string, threads: ThreadSummary[] }>()
    for (const thread of threads) {
      const group = grouped.get(thread.parentSessionId) ?? {
        title: thread.parentTitle,
        threads: [],
      }
      group.threads.push(thread)
      grouped.set(thread.parentSessionId, group)
    }
    return [...grouped.entries()]
  }, [threads])

  if (threads.length === 0) return null
  return (
    <label className={css.threadPicker}>
      <span>历史 Threads</span>
      <select
        value={activeId ?? ''}
        onChange={(event) => {
          if (event.currentTarget.value !== '') onChange(event.currentTarget.value)
        }}
      >
        <option value="" disabled>选择一条 Citation Thread</option>
        {groups.map(([parentId, group]) => (
          <optgroup key={parentId} label={group.title}>
            {group.threads.map((thread) => (
              <option key={thread.sessionId} value={thread.sessionId}>
                {threadLabel(thread)}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  )
}

/**
 * Render the durable Citation Thread panel.
 * @param props - close action and plugin-owned controller.
 * @returns question composer, transcript, recovery controls, and lifecycle actions.
 */
export function CitePanel({ close, explainer }: CitePanelProps) {
  const subscribe = useCallback((listener: () => void) => explainer.subscribe(listener), [explainer])
  const snapshot = useSyncExternalStore(subscribe, explainer.getSnapshot)
  const [question, setQuestion] = useState('')
  const [rename, setRename] = useState('')
  const activeId = snapshot.activeThread?.sessionId ?? null
  const quote = snapshot.activeThread?.citation.selectedText ?? snapshot.selection?.text ?? null
  const quickQuestions = snapshot.activeThread === null ? INITIAL_QUESTIONS : FOLLOW_UPS

  useEffect(() => {
    setQuestion('')
    setRename(snapshot.activeThread?.title ?? '')
  }, [activeId, snapshot.selection?.anchorKey, snapshot.activeThread?.title])

  const submitQuestion = (event: FormEvent) => {
    event.preventDefault()
    const value = question.trim()
    if (value === '') return
    setQuestion('')
    void explainer.ask(value)
  }

  return (
    <div className={css.panel} data-citeciter-panel>
      <header className={css.panelHeader}>
        <div>
          <div className={css.panelTitle}>CiteCiter</div>
          <div className={css.panelSubtitle}>精确历史上下文中的学习伴侣</div>
        </div>
        <button className={css.closeButton} type="button" aria-label="关闭 CiteCiter" onClick={close}>×</button>
      </header>

      <ThreadPicker
        threads={snapshot.threads}
        activeId={activeId}
        onChange={(sessionId) => { void explainer.switchThread(sessionId) }}
      />

      {quote === null ? (
        <div className={css.emptyState}>
          <p>{snapshot.threads.length === 0
            ? '选中一段已完成的助手回复，右键选择 Citer!，创建第一条 Citation Thread。'
            : '选择一条历史 Thread，或从助手回复中创建新的 Citation。'}</p>
          <span>Thread 独立运行，不会把提问写入原会话。</span>
          {snapshot.error !== null && (
            <p className={css.panelError} data-citeciter-error>{snapshot.error}</p>
          )}
        </div>
      ) : (
        <div className={css.panelBody}>
          <blockquote className={css.quote}>{quote}</blockquote>
          <div className={css.statusRow}>
            <span className={css.statusDot} data-phase={snapshot.phase} />
            <span>{PHASE_LABEL[snapshot.phase]}</span>
            {snapshot.activeThread !== null && (
              <code title={snapshot.activeThread.sessionId}>{snapshot.activeThread.sessionId.slice(0, 8)}</code>
            )}
          </div>

          {snapshot.activeThread !== null && (
            <div className={css.threadActions}>
              <input
                value={rename}
                onChange={(event) => setRename(event.currentTarget.value)}
                placeholder="Thread 名称"
                aria-label="Thread 名称"
              />
              <button
                type="button"
                onClick={() => { void explainer.renameActive(rename) }}
                disabled={rename.trim() === ''}
              >保存</button>
              <button className={css.dangerButton} type="button" onClick={() => { void explainer.archiveActive() }}>
                归档
              </button>
            </div>
          )}

          {snapshot.error !== null && (
            <p className={css.panelError} data-citeciter-error>{snapshot.error}</p>
          )}

          {snapshot.transcript.length > 0 && (
            <div className={css.transcript} aria-live="polite">
              {snapshot.transcript.map((entry) => (
                <article
                  key={entry.id}
                  className={entry.role === 'user' ? css.userTurn : entry.role === 'assistant' ? css.assistantTurn : css.errorTurn}
                >
                  <div className={css.turnRole}>{entry.role === 'user' ? '你' : entry.role === 'assistant' ? 'CiteCiter' : '错误'}</div>
                  {entry.role === 'assistant'
                    ? <RichAnswer text={entry.text} streaming={entry.streaming} />
                    : <p>{entry.text}</p>}
                </article>
              ))}
            </div>
          )}

          <div className={css.quickQuestions}>
            {quickQuestions.map((item) => (
              <button key={item} type="button" onClick={() => { void explainer.ask(item) }}>
                {item}
              </button>
            ))}
          </div>

          <form className={css.composer} onSubmit={submitQuestion}>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.currentTarget.value)}
              placeholder={snapshot.activeThread === null ? '你想从哪一点开始？' : '继续追问…'}
              rows={3}
              maxLength={12_000}
            />
            <div className={css.composerActions}>
              <span>这是一个真实的用户问题，可继续多轮对话。</span>
              {snapshot.phase === 'running' && (
                <button className={css.stopButton} type="button" onClick={() => { void explainer.stop() }}>停止</button>
              )}
              <button className={css.sendButton} type="submit" disabled={question.trim() === '' || snapshot.phase === 'creating'}>
                {snapshot.phase === 'running' ? '排队' : '发送'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

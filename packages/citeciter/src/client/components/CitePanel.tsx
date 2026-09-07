import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store'
import type { CiteOverlaySnapshot } from '../types.ts'
import type { CompanionSnapshot } from '../companion-controller.ts'
import type { CompanionActions, OverlayActions } from '../view-actions.ts'
import {
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Button,
  DisclosureRow,
  IconArchiveOutline20,
  IconQuestionOutline14,
  IconSendOutline16,
  IconSparkle16,
  IconStopFill16,
  JsonTree,
  Modal,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { CompanionPhase } from '../companion-controller.ts'
import type { TopicMessage } from '../../topic.ts'
import { parseNextQuestions } from '../prompt.ts'
import { appendBoardCitation, isTopicMessageVisible } from '../topic-presentation.ts'
import collapseArrowUrl from '../assets/collapse-arrow.svg'
import mascotUrl from '../assets/citeciter-mascot.png'
import { QuestionCard } from './QuestionCard.tsx'
import { RichAnswer } from './RichAnswer.tsx'
import css from './CiteCiter.module.css'
import { jsonTreeLabels } from '../copy.ts'
import { findContainingFrame, useHostDock } from '../host-dock.ts'
import { LEARNING_STAGES, latestLearningStage, learningQuestion, projectLearningCards, type LearningStageId } from '../../learning.ts'
import { LearningCards } from './LearningCards.tsx'
import { BoardView } from './BoardView.tsx'
import learningCss from './LearningWorkspace.module.css'

const PHASE_LABEL: Record<CompanionPhase, string> = {
  idle: '新建或选择 Topic',
  creating: '正在确认上下文方式…',
  ready: '可以继续追问',
  running: 'CiteCiter 正在回答…',
  stopping: '正在停止…',
  stopped: '已停止，可继续',
  error: '需要处理',
}

function modelValue(provider: string, model: string): string {
  return encodeURIComponent(provider) + '|' + encodeURIComponent(model)
}

function parseModelValue(value: string): [string, string] {
  const divider = value.indexOf('|')
  return [decodeURIComponent(value.slice(0, divider)), decodeURIComponent(value.slice(divider + 1))]
}

function compactPreview(text: string, limit = 120): string {
  const compact = text.replaceAll(/\s+/g, ' ').trim()
  return compact.length > limit ? compact.slice(0, limit) + '…' : compact
}

function jsonObject(text: string): object | unknown[] | null {
  try {
    const value: unknown = JSON.parse(text)
    return typeof value === 'object' && value !== null ? value as object | unknown[] : null
  } catch {
    return null
  }
}

function friendlyFailure(text: string): string {
  if (text.includes('Citation source has no model route')) {
    return '当前主会话还没有可复用的模型。请先在主对话发送一条消息，再创建 Topic。'
  }
  return text.replaceAll(/https?:\/\/[^\s)]+/gu, '模型服务地址')
}

function FlowDisclosure({
  icon,
  title,
  summary,
  running = false,
  children,
}: {
  readonly icon: ReactNode
  readonly title: string
  readonly summary: string
  readonly running?: boolean
  readonly children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <DisclosureRow
      className={css.flowDisclosure}
      rowClassName={running ? css.flowRowRunning : css.flowRow}
      icon={icon}
      title={title}
      open={open}
      expandable
      expandOnRowClick
      onToggle={() => setOpen(!open)}
      collapsedContent={<><span className={css.flowDot}>·</span><span className={css.flowSummary}>{summary}</span></>}
    >
      {children}
    </DisclosureRow>
  )
}

function ToolRow({ message }: { readonly message: Extract<TopicMessage, { role: 'tool' }> }) {
  const args = jsonObject(message.arguments)
  const result = message.result === null ? null : jsonObject(message.result)
  const summary = message.running
    ? compactPreview(message.arguments)
    : message.isError
      ? '调用失败'
      : compactPreview(message.result ?? '完成')
  return (
    <FlowDisclosure
      icon={message.name === 'ask_user_question' ? <IconQuestionOutline14 /> : <IconSparkle16 />}
      title={message.name}
      summary={summary}
      running={message.running}
    >
      <div className={css.toolPreview}>
        <strong>参数</strong>
        {args === null ? <pre>{message.arguments}</pre> : <JsonTree data={args} label="工具参数" copyable={false} labels={jsonTreeLabels} />}
        {message.result !== null && (
          <>
            <strong>{message.isError ? '错误' : '结果'}</strong>
            {result === null
              ? <pre>{message.result}</pre>
            : <JsonTree data={result} label="工具结果" copyable={false} labels={jsonTreeLabels} />}
          </>
        )}
      </div>
    </FlowDisclosure>
  )
}

function ErrorTurn({ message }: { readonly message: Extract<TopicMessage, { role: 'error' }> }) {
  const summary = friendlyFailure(message.text)
  return (
    <article
      className={css.errorTurn}
      data-status={message.status}
      role={message.status === 'failed' ? 'alert' : undefined}
    >
      <div className={css.turnRole}>{message.status === 'stopped' ? '已停止' : '请求失败'}</div>
      <p>{summary}</p>
      <div className={css.errorMeta}>
        <span>第 {message.attempt} 次请求</span>
        <span>{message.bodyRetained ? '已保留已生成正文' : '未产生可保留正文'}</span>
        <span>{message.status === 'stopped' ? '可继续追问' : '可修改问题后重试'}</span>
      </div>
      {summary !== message.text && <details><summary>技术详情</summary><pre>{message.text}</pre></details>}
    </article>
  )
}

function AssistantTurn({
  message,
  disabled,
  onQuestion,
  reportParseError,
}: {
  readonly message: Extract<TopicMessage, { role: 'assistant' }>
  readonly disabled: boolean
  readonly onQuestion: (question: string) => void
  readonly reportParseError: (messageId: string) => void
}) {
  const parsed = useMemo(
    () => parseNextQuestions(message.text, message.streaming),
    [message.streaming, message.text],
  )
  useEffect(() => {
    if (!message.streaming && parsed.invalid) reportParseError(message.id)
  }, [message.id, message.streaming, parsed.invalid, reportParseError])
  return (
    <article className={css.assistantTurn}>
      <div className={css.turnRole}>CiteCiter</div>
      {parsed.text !== '' && <RichAnswer text={parsed.text} streaming={message.streaming} />}
      {!message.streaming && parsed.questions.length === 3 && (
        <fieldset className={css.nextQuestions}>
          <legend>接下来可能想问</legend>
          {parsed.questions.map((question) => (
            <button
              type="button"
              key={question}
              disabled={disabled}
              onClick={() => onQuestion(question)}
            >
              {question}
            </button>
          ))}
        </fieldset>
      )}
    </article>
  )
}

export interface CitePanelProps {
  readonly useCompanion: SnapshotSelectorHook<CompanionSnapshot>
  readonly useOverlay: SnapshotSelectorHook<CiteOverlaySnapshot>
  readonly bus: OverlayActions
  readonly companion: CompanionActions
  readonly closePanel: () => void
  readonly reportParseError: (messageId: string) => void
}

/**
 * Render the independent Topic workspace on the right edge of the shell.
 * @param props - shared panel bus, Topic controller, and host callbacks.
 * @returns the responsive Topic dock and its dialogs, or null while closed.
 */
export function CitePanel({ useCompanion, useOverlay, bus, companion, closePanel, reportParseError }: CitePanelProps) {
  const overlay = useOverlay(value => value)
  const snapshot = useCompanion(value => value)
  const draftKey = snapshot.active?.topic.sessionId ?? snapshot.sourceSessionId ?? 'new'
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const question = drafts[draftKey] ?? ''
  const setQuestion = useCallback((value: string | ((current: string) => string)) => {
    setDrafts(current => ({ ...current, [draftKey]: typeof value === 'string' ? value : value(current[draftKey] ?? '') }))
  }, [draftKey])
  const [stages, setStages] = useState<Record<string, LearningStageId | null>>({})
  const stageId = Object.hasOwn(stages, draftKey) ? stages[draftKey] ?? null : latestLearningStage(snapshot.active?.messages ?? [])
  const stage = LEARNING_STAGES.find(candidate => candidate.id === stageId)
  const [views, setViews] = useState<Record<string, 'explain' | 'board' | 'cards'>>({})
  const [routeExpanded, setRouteExpanded] = useState<Record<string, boolean>>({})
  const [composerExpanded, setComposerExpanded] = useState<Record<string, boolean>>({})
  const view = views[draftKey] ?? 'explain'
  const setView = (next: 'explain' | 'board' | 'cards') => setViews(current => ({ ...current, [draftKey]: next }))
  const selectStage = (next: LearningStageId | null) => {
    setStages(current => ({ ...current, [draftKey]: next }))
    setView(next === 'quantitative' ? 'board' : next === 'summary' ? 'cards' : 'explain')
    if (dock?.mode === 'rows') setRouteExpanded(current => ({ ...current, [draftKey]: false }))
    requestAnimationFrame(() => composerRef.current?.focus())
  }
  const cards = useMemo(() => projectLearningCards(snapshot.active?.messages ?? []), [snapshot.active?.messages])
  const [title, setTitle] = useState('')
  const [titleDirty, setTitleDirty] = useState(false)
  const [newTopicOpen, setNewTopicOpen] = useState(false)
  const [newTopicQuestion, setNewTopicQuestion] = useState('')
  const [newTopicScenario, setNewTopicScenario] = useState<'qa' | 'present'>('present')
  const [newTopicSubmitting, setNewTopicSubmitting] = useState(false)
  const [newTopicError, setNewTopicError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ readonly sessionId: string, readonly title: string } | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [widthPercent, setWidthPercent] = useState(snapshot.settings.panelWidthPercent)
  const dockWidthPercent = widthPercent
  const resizeOrigin = useRef<{ x: number, width: number, frameWidth: number } | null>(null)
  const panelRef = useRef<HTMLElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const followTail = useRef(true)
  const modalReturnFocusRef = useRef<HTMLElement | null>(null)
  const open = overlay.panelOpen
  const active = snapshot.active
  const canAsk = snapshot.phase === 'ready' || snapshot.phase === 'stopped' || snapshot.phase === 'error'
  const dock = useHostDock(panelRef, open, widthPercent)
  const docked = dock?.mode === 'columns'
  const showRoute = routeExpanded[draftKey] ?? docked
  const composerFolded = dock?.mode === 'rows' && view !== 'explain' && !composerExpanded[draftKey]

  useEffect(() => open ? companion.retainVisible() : undefined, [companion, open])
  useEffect(() => { followTail.current = true }, [active?.topic.sessionId, view, open])
  useEffect(() => {
    if (followTail.current && transcriptRef.current !== null) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [active?.messages, view, open])
  useEffect(() => setWidthPercent(snapshot.settings.panelWidthPercent), [snapshot.settings.panelWidthPercent])
  useEffect(() => {
    setTitle(active?.topic.title ?? '')
    setTitleDirty(false)
  }, [active?.topic.sessionId])
  useEffect(() => {
    setNewTopicOpen(false)
    setNewTopicQuestion('')
    setNewTopicSubmitting(false)
    setNewTopicError(null)
    setDeleteTarget(null)
    setDeleteConfirmation('')
    setDeleteError(null)
  }, [snapshot.sourceSessionId])
  useEffect(() => {
    if (deleteTarget !== null && deleteTarget.sessionId !== active?.topic.sessionId) {
      setDeleteTarget(null)
      setDeleteConfirmation('')
    }
  }, [active?.topic.sessionId, deleteTarget])
  useEffect(() => {
    if (!titleDirty) setTitle(active?.topic.title ?? '')
  }, [active?.topic.title, titleDirty])
  useEffect(() => {
    const citation = overlay.boardCitation
    if (citation === null || active?.topic.sessionId !== citation.topicSessionId) return
    setQuestion((current) => appendBoardCitation(current, citation.prompt))
    bus.clearBoardCitation(citation.id)
    requestAnimationFrame(() => composerRef.current?.focus())
  }, [active?.topic.sessionId, bus, overlay.boardCitation, setQuestion])
  const modalTitle = newTopicOpen ? '新建自由 Topic' : deleteTarget === null ? null : '永久删除 Topic'
  useEffect(() => {
    if (modalTitle === null) return
    const dialog = [...document.querySelectorAll<HTMLElement>('[role="dialog"]')]
      .find((element) => element.getAttribute('aria-label') === modalTitle)
    if (dialog === undefined) return
    const appRoot = document.getElementById('root')
    const rootWasInert = appRoot?.hasAttribute('inert') ?? false
    const rootAriaHidden = appRoot?.getAttribute('aria-hidden') ?? null
    appRoot?.setAttribute('inert', '')
    appRoot?.setAttribute('aria-hidden', 'true')
    const focusable = () => [...dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )].filter((element) => element.offsetParent !== null)
    const frame = requestAnimationFrame(() => {
      if (!dialog.contains(document.activeElement)) focusable()[0]?.focus()
    })
    const trapFocus = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const candidates = focusable()
      const first = candidates[0]
      const last = candidates.at(-1)
      if (first === undefined || last === undefined) return
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }
    dialog.addEventListener('keydown', trapFocus)
    const returnFocus = modalReturnFocusRef.current
    return () => {
      cancelAnimationFrame(frame)
      dialog.removeEventListener('keydown', trapFocus)
      if (appRoot !== null) {
        appRoot.toggleAttribute('inert', rootWasInert)
        if (rootAriaHidden === null) appRoot.removeAttribute('aria-hidden')
        else appRoot.setAttribute('aria-hidden', rootAriaHidden)
      }
      requestAnimationFrame(() => {
        if (returnFocus?.isConnected === true) returnFocus.focus()
        else panelRef.current?.querySelector<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])')?.focus()
      })
    }
  }, [modalTitle])

  const selectedProvider = snapshot.providers.find((provider) => provider.id === active?.topic.modelConfig.provider)
  const selectedModel = selectedProvider?.models.find((model) => model.id === active?.topic.modelConfig.model)
  const visibleMessages = active?.messages.filter((message) => isTopicMessageVisible(message, active.messages)) ?? []

  if (!open) return null

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!canAsk) return
    const value = question.trim()
    if (value === '' && stageId === null) return
    const submitted = question
    void companion.ask(stageId === null ? value : learningQuestion(stageId, value)).then((sent) => {
      if (sent) setQuestion((current) => current === submitted ? '' : current)
    })
  }
  const openNewTopic = () => {
    modalReturnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setNewTopicQuestion('')
    setNewTopicScenario('present')
    setNewTopicError(null)
    setNewTopicOpen(true)
  }
  const submitNewTopic = async () => {
    const value = newTopicQuestion.trim()
    if (value === '' || newTopicSubmitting || snapshot.sourceSessionId === null) return
    setNewTopicSubmitting(true)
    setNewTopicError(null)
    try {
      if (await companion.createFree(newTopicScenario === 'present' ? learningQuestion('logic', value) : value, newTopicScenario)) {
        setNewTopicOpen(false)
        setNewTopicQuestion('')
      } else {
        setNewTopicError('Topic 未创建，请重试。')
      }
    } finally {
      setNewTopicSubmitting(false)
    }
  }
  const confirmDelete = async () => {
    if (
      deleteTarget === null
      || deleteConfirmation !== deleteTarget.sessionId
      || snapshot.deleting
    ) return
    setDeleteError(null)
    if (await companion.deleteTopic(deleteConfirmation) === false) {
      setDeleteError('Topic 未删除，请重试。')
    }
  }
  const updateWidth = (next: number) => {
    const value = Math.max(28, Math.min(55, Math.round(next)))
    setWidthPercent(value)
    void companion.setSetting('panelWidthPercent', value)
  }
  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    resizeOrigin.current = {
      x: event.clientX,
      width: widthPercent,
      frameWidth: findContainingFrame(panelRef.current)?.getBoundingClientRect().width ?? window.innerWidth,
    }
  }
  const moveResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const origin = resizeOrigin.current
    if (origin === null || !event.currentTarget.hasPointerCapture(event.pointerId)) return
    setWidthPercent(Math.max(28, Math.min(55, Math.round(
      origin.width + (origin.x - event.clientX) / origin.frameWidth * 100,
    ))))
  }
  const endResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const origin = resizeOrigin.current
    if (origin === null || !event.currentTarget.hasPointerCapture(event.pointerId)) return
    resizeOrigin.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)
    updateWidth(origin.width + (origin.x - event.clientX) / origin.frameWidth * 100)
  }
  const resizeKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    updateWidth(widthPercent + (event.key === 'ArrowLeft' ? 1 : -1))
  }

  return (
    <>
      <aside
      ref={panelRef}
      className={css.dock}
      style={{
        width: dock?.width,
        height: dock?.height,
        top: dock?.top,
        '--citeciter-panel-width': `${dockWidthPercent}vw`,
      } as CSSProperties}
      data-citeciter-panel
      data-arrangement={dock?.mode ?? 'unsupported'}
      aria-label="CiteCiter 学习伴侣"
    >
      {docked && (
        <div
          className={css.resizeHandle}
          role="separator"
          aria-label="调整 CiteCiter 宽度"
          aria-orientation="vertical"
          aria-valuemin={28}
          aria-valuemax={55}
          aria-valuenow={widthPercent}
          tabIndex={0}
          onPointerDown={startResize}
          onPointerMove={moveResize}
          onPointerUp={endResize}
          onPointerCancel={() => { resizeOrigin.current = null }}
          onKeyDown={resizeKey}
        />
      )}
      <button className={css.closeButton} type="button" onClick={closePanel} aria-label="关闭 CiteCiter">
        <img src={collapseArrowUrl} alt="" />
      </button>

      {dock === null && <p className={css.layoutNotice} role="status">当前宿主布局暂不支持学习栏。请切换到标准 Web 布局或 Desktop 兼容模式。</p>}

      <div className={css.dockBody}>
        <section className={css.learningWorkspace}>
          <header className={css.dockHeader}>
            <div className={css.dockHeading}>
              <span className={css.modeBadge}>{active === null
                ? snapshot.phase === 'creating' ? '待确认' : '学习栏'
                : active.topic.mode === 'exact-fork' ? 'Exact Fork' : 'Observer'}</span>
              <strong>{active?.topic.title ?? '新的学习讨论'}</strong>
              <span>{dock?.mode === 'rows' ? '窗口较窄，学习栏已移至下方' : PHASE_LABEL[snapshot.phase]}</span>
            </div>
            <select
              className={css.compactTopicSelect}
              aria-label="选择 Topic"
              value={active?.topic.sessionId ?? ''}
              disabled={snapshot.topics.length === 0}
              onChange={(event) => {
                if (event.currentTarget.value !== '') void companion.openTopic(event.currentTarget.value)
              }}
            >
              <option value="">{snapshot.topicsStatus === 'loading' ? '正在读取…' : snapshot.includeArchived ? '归档 Topic' : '选择 Topic'}</option>
              {snapshot.topics.map((topic) => (
                <option value={topic.sessionId} key={topic.sessionId}>{topic.title}</option>
              ))}
            </select>
            <div className={css.compactHeaderActions}>
              <button className={css.compactNewTopic} type="button" onClick={openNewTopic}>+ 新 Topic</button>
              <button type="button" onClick={() => companion.setIncludeArchived(!snapshot.includeArchived)}>
                {snapshot.includeArchived ? '返回活动' : '查看归档'}
              </button>
            </div>
          </header>

          {snapshot.topicsStatus === 'error' && <p className={css.panelError} role="alert">Topic 读取失败：{snapshot.topicsError}</p>}
          {snapshot.notice !== null && <div className={css.panelNotice} role="status">{snapshot.notice}</div>}

          {active === null && snapshot.draftQuote === null ? (
            <div className={css.emptyState}>
              <div className={css.emptyWhale} aria-hidden="true"><img src={mascotUrl} alt="" /></div>
              <h2>把没懂的地方，慢慢讲明白</h2>
              <p>新建一个学习 Topic，或选中主对话中的文字，从问题本身开始。</p>
              <button className={learningCss.action} type="button" onClick={openNewTopic}>开始学习</button>
              {snapshot.phase === 'creating' && <div className={css.loadingCard}>正在创建 Topic…</div>}
              {snapshot.error !== null && <p className={css.panelError} role="alert">{friendlyFailure(snapshot.error)}</p>}
            </div>
          ) : (
            <>
              <details className={`${css.contextBar} ${learningCss.source}`}>
                <summary>{active?.topic.citation == null ? '自由讨论 · 查看上下文' : `引用来源 · ${compactPreview(active.topic.citation.displayText, 70)}`}</summary>
                <blockquote>{active?.topic.citation === null
                  ? '无引用 · 自由讨论'
                  : '“' + (active?.topic.citation?.displayText ?? snapshot.draftQuote) + '”'}</blockquote>
                {active !== null && (
                  <div className={css.contextMeta}>
                    <span data-ok={active.topic.sourceAvailable || undefined}>
                      {active.topic.sourceAvailable ? '来源在线' : '来源不可用'}
                    </span>
                    <span>{active.topic.observedThroughSeq === null
                      ? '等待按需读取来源'
                      : '来源已同步'}</span>
                  </div>
                )}
              </details>

              <div className={learningCss.route}>
                <div className={learningCss.routeTop}>
                  <button className={learningCss.action} type="button" aria-expanded={showRoute} onClick={() => setRouteExpanded(current => ({ ...current, [draftKey]: !showRoute }))}>
                    {showRoute ? '收起学习路线' : `学习路线 · ${stage?.label ?? '选择阶段'}`} {showRoute ? '⌃' : '⌄'}
                  </button>
                  <button className={learningCss.action} type="button" aria-pressed={stageId === null} onClick={() => selectStage(null)}>自由追问</button>
                </div>
                {showRoute && <><div className={learningCss.stages} aria-label="选择学习阶段">
                  {LEARNING_STAGES.map((item, index) => <button key={item.id} type="button" aria-label={item.label} aria-pressed={stageId === item.id} title={item.label} onClick={() => selectStage(item.id)}>
                    <span>{String(index + 1).padStart(2, '0')}</span>{item.shortLabel}
                  </button>)}
                </div>
                <p className={learningCss.hint}>{stage === undefined ? '围绕当前问题继续聊，或选择一个阶段。选择后点击发送才会开始。' : `${stage.label} · ${stage.hint} 点击发送开始。`}</p></>}
              </div>

              <div className={learningCss.views} aria-label="学习内容视图">
                <button type="button" aria-pressed={view === 'explain'} onClick={() => setView('explain')}>讲解</button>
                <button type="button" aria-pressed={view === 'board'} onClick={() => setView('board')}>板书<span className={learningCss.count}>{active?.board?.elements.length ?? 0}</span></button>
                <button type="button" aria-pressed={view === 'cards'} onClick={() => setView('cards')}>学习卡<span className={learningCss.count}>{cards.cards.length}</span></button>
              </div>

              {view === 'explain' && <div ref={transcriptRef} className={css.transcript} aria-live="polite" onScroll={event => {
                const element = event.currentTarget
                followTail.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80
              }}>
                {visibleMessages.map((message) => {
                  if (message.role === 'tool') return <ToolRow key={message.id} message={message} />
                  if (message.role === 'user') return (
                    <article key={message.id} className={css.userTurn}>
                      <div className={css.turnRole}>你</div>{message.text.startsWith('【学习阶段：') ? <details className={learningCss.questionDetails}>
                        <summary>{message.text.split('\n')[0]}{message.text.includes('\n\n我的问题：') ? ` · ${message.text.split('\n\n我的问题：').slice(1).join('\n\n我的问题：')}` : ''}</summary><p>{message.text}</p>
                      </details> : <p>{message.text}</p>}
                    </article>
                  )
                  if (message.role === 'error') return <ErrorTurn key={message.id} message={message} />
                  if (message.role === 'context') return null
                  return (
                    <AssistantTurn
                      key={message.id}
                      message={message}
                      disabled={!canAsk}
                      onQuestion={(value) => {
                        setQuestion(current => current.trim() === '' ? value : `${current}\n${value}`)
                        requestAnimationFrame(() => composerRef.current?.focus())
                      }}
                      reportParseError={reportParseError}
                    />
                  )
                })}
                {snapshot.phase === 'creating' && <div className={css.loadingCard}>正在验证引用并建立 Topic…</div>}
                {snapshot.error !== null && !visibleMessages.some((message) =>
                  message.role === 'error' || message.role === 'tool' && message.isError) && (
                  <p className={css.panelError} data-citeciter-error role="alert">{friendlyFailure(snapshot.error)}</p>
                )}
              </div>}
              {view === 'board' && <div className={learningCss.content}><BoardView snapshot={active?.board} animations={snapshot.settings.boardAnimations ?? true} compact onQuoteElement={element => {
                setQuestion(current => appendBoardCitation(current, `请解释板书“${element.id}”：\n${element.content.slice(0, 2000)}`))
                setView('explain')
                requestAnimationFrame(() => composerRef.current?.focus())
              }} /></div>}
              {view === 'cards' && active !== null && <div className={learningCss.content}><LearningCards key={active.topic.sessionId}
                projection={cards} recall={snapshot.settings.activeRecall ?? false}
                setRecall={value => { void companion.setSetting('activeRecall', value) }} disabled={snapshot.settingsSaveStatus === 'saving'}
                topicTitle={active.topic.title} topicId={active.topic.sessionId}
                source={active.topic.citation?.displayText ?? '无引用 · 自由讨论'} onRevise={() => {
                  selectStage('summary')
                  setComposerExpanded(current => ({ ...current, [draftKey]: true }))
                }}
              /></div>}
              {view !== 'explain' && snapshot.error !== null && <p className={css.panelError} role="alert">{friendlyFailure(snapshot.error)}</p>}

              {active !== null && (
                <details className={learningCss.settings}>
                  <summary>Topic 设置 · {selectedModel?.name ?? active.topic.modelConfig.model}</summary>
                <div className={css.topicToolbar} aria-label="Topic 设置">
                  <form onSubmit={(event) => {
                    event.preventDefault()
                    void companion.rename(title).then((saved) => {
                      if (saved) setTitleDirty(false)
                    })
                  }}>
                    <input
                      value={title}
                      aria-label="Topic 标题"
                      onChange={(event) => {
                        setTitle(event.currentTarget.value)
                        setTitleDirty(true)
                      }}
                    />
                    <button type="submit" disabled={title.trim() === '' || !titleDirty || snapshot.renaming}>
                      {snapshot.renaming ? '保存中…' : titleDirty ? '保存' : '已保存'}
                    </button>
                  </form>
                  <select
                    aria-label="CiteCiter 模型"
                    value={modelValue(active.topic.modelConfig.provider, active.topic.modelConfig.model)}
                    disabled={snapshot.modelRouteSaving}
                    onChange={(event) => {
                      const [provider, model] = parseModelValue(event.currentTarget.value)
                      void companion.setModelRoute(provider, model)
                    }}
                  >
                    {!snapshot.providers.some((provider) =>
                      provider.id === active.topic.modelConfig.provider
                      && provider.models.some((model) => model.id === active.topic.modelConfig.model)) && (
                      <option value={modelValue(active.topic.modelConfig.provider, active.topic.modelConfig.model)}>
                        {active.topic.modelConfig.provider} / {active.topic.modelConfig.model}
                      </option>
                    )}
                    {snapshot.providers.map((provider) => (
                      <optgroup label={provider.name} key={provider.id}>
                        {provider.models.map((model) => (
                          <option value={modelValue(provider.id, model.id)} key={model.id}>{model.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {selectedModel !== undefined && selectedModel.reasoningEfforts.length > 0 && (
                    <select
                      aria-label="思考强度"
                      value={active.topic.modelConfig.reasoningEffort ?? ''}
                      disabled={snapshot.reasoningEffortSaving || snapshot.modelRouteSaving}
                      onChange={(event) => {
                        void companion.setReasoningEffort(event.currentTarget.value === '' ? null : event.currentTarget.value)
                      }}
                    >
                      <option value="">模型默认思考</option>
                      {selectedModel.reasoningEfforts.map((effort) => (
                        <option value={effort.id} key={effort.id}>{effort.name}</option>
                      ))}
                    </select>
                  )}
                  <button
                    type="button"
                    className={css.archiveButton}
                    aria-label={active.topic.archived ? '恢复当前 Topic' : '归档当前 Topic'}
                    disabled={snapshot.archiving}
                    onClick={() => { void companion.archive(!active.topic.archived) }}
                  >
                    <IconArchiveOutline20 size={14} />
                    {snapshot.archiving ? '处理中…' : active.topic.archived ? '恢复' : '归档'}
                  </button>
                  <button
                    type="button"
                    className={css.deleteButton}
                    disabled={snapshot.deleting}
                    onClick={() => {
                      modalReturnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
                      setDeleteTarget({ sessionId: active.topic.sessionId, title: active.topic.title })
                      setDeleteConfirmation('')
                      setDeleteError(null)
                    }}
                  >
                    永久删除
                  </button>
                </div>
                </details>
              )}

              {active?.pendingQuestion !== null && active?.pendingQuestion !== undefined
                ? <QuestionCard key={active.pendingQuestion.key} pending={active.pendingQuestion} companion={companion} />
                : (
                  <form className={css.composer} data-folded={composerFolded || undefined} onSubmit={submit}>
                    {composerFolded && <button type="button" className={learningCss.action} onClick={() => {
                      setComposerExpanded(current => ({ ...current, [draftKey]: true }))
                      requestAnimationFrame(() => composerRef.current?.focus())
                    }}>{question.trim() === '' ? '补充问题' : '编辑草稿'}</button>}
                    <textarea
                      hidden={composerFolded}
                      ref={composerRef}
                      rows={2}
                      maxLength={11_000}
                      aria-label="继续向 CiteCiter 提问"
                      value={question}
                      disabled={active === null}
                      onChange={(event) => setQuestion(event.currentTarget.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.nativeEvent.isComposing) {
                          event.preventDefault()
                          event.currentTarget.form?.requestSubmit()
                        }
                      }}
                      placeholder={active === null ? 'Topic 创建后可继续追问' : stage === undefined ? '继续问，或写下你卡住的地方…' : `补充你的问题，或直接发送“${stage.label}”`}
                    />
                    <div className={css.composerActions}>
                      <span>{stage === undefined ? '自由追问' : stage.label} · Ctrl/⌘ + Enter 发送</span>
                      <button
                        className={css.sendButton}
                        type={snapshot.phase === 'running' ? 'button' : 'submit'}
                        disabled={snapshot.phase === 'stopping'
                          || snapshot.phase !== 'running' && (!canAsk || active === null || question.trim() === '' && stageId === null)}
                        aria-label={snapshot.phase === 'running' ? '停止回答' : snapshot.phase === 'stopping' ? '正在停止' : '发送'}
                        onClick={snapshot.phase === 'running' ? () => { void companion.stop() } : undefined}
                      >
                        {snapshot.phase === 'running' || snapshot.phase === 'stopping'
                          ? <IconStopFill16 size={16} />
                          : <IconSendOutline16 size={16} />}
                      </button>
                    </div>
                  </form>
                )}
            </>
          )}
        </section>

      </div>
      </aside>

      <Modal
        open={newTopicOpen}
        onClose={() => {
          if (!newTopicSubmitting) {
            setNewTopicOpen(false)
            setNewTopicError(null)
            companion.dismissError()
          }
        }}
        closeLabel="关闭"
        title="新建自由 Topic"
        description="首条问题发出后才会创建 Topic；新主会话请先发送一条主对话消息，让模型路由就绪。"
        footer={(
          <>
            <Button variant="outline" disabled={newTopicSubmitting} onClick={() => {
              setNewTopicOpen(false)
              setNewTopicError(null)
              companion.dismissError()
            }}>取消</Button>
            <Button
              variant="primary"
              disabled={newTopicQuestion.trim() === '' || newTopicSubmitting || snapshot.sourceSessionId === null}
              onClick={() => { void submitNewTopic() }}
            >
              {newTopicSubmitting ? '创建中…' : newTopicScenario === 'present' ? '开始讲解' : '开始问答'}
            </Button>
          </>
        )}
      >
        <div className={css.newTopicForm}>
          <fieldset className={css.scenarioPicker}>
            <legend>Topic 形态</legend>
            <button
              type="button"
              data-active={newTopicScenario === 'qa' || undefined}
              aria-pressed={newTopicScenario === 'qa'}
              onClick={() => {
                setNewTopicScenario('qa')
                setNewTopicError(null)
              }}
            >
              <strong>问答</strong><span>围绕问题直接分析</span>
            </button>
            <button
              type="button"
              data-active={newTopicScenario === 'present' || undefined}
              aria-pressed={newTopicScenario === 'present'}
              onClick={() => {
                setNewTopicScenario('present')
                setNewTopicError(null)
              }}
            >
              <strong>学习讲解</strong><span>从底层逻辑开始，按需展开五个阶段</span>
            </button>
          </fieldset>
          <textarea
            autoFocus
            rows={5}
            maxLength={11_000}
            value={newTopicQuestion}
            disabled={newTopicSubmitting}
            aria-label="自由 Topic 的首个问题"
            placeholder={newTopicScenario === 'present' ? '想让 CiteCiter 讲解什么？' : '想和 CiteCiter 讨论什么？'}
            onChange={(event) => {
              setNewTopicQuestion(event.currentTarget.value)
              setNewTopicError(null)
            }}
          />
          {newTopicError !== null && (
            <div className={css.modalError} role="alert">{friendlyFailure(snapshot.error ?? newTopicError)}</div>
          )}
        </div>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => {
          if (!snapshot.deleting) setDeleteTarget(null)
        }}
        closeLabel="关闭"
        title="永久删除 Topic"
        {...deleteTarget === null ? {} : {
          description: `这会永久删除“${deleteTarget.title}”。请输入完整 Topic Session ID 确认。`,
        }}
        footer={(
          <>
            <Button variant="outline" disabled={snapshot.deleting} onClick={() => setDeleteTarget(null)}>取消</Button>
            <Button
              variant="outline"
              className={css.deleteAction}
              disabled={deleteTarget === null || deleteConfirmation !== deleteTarget.sessionId || snapshot.deleting}
              onClick={() => { void confirmDelete() }}
            >
              {snapshot.deleting ? '删除中…' : '永久删除'}
            </Button>
          </>
        )}
      >
        {deleteTarget !== null && (
          <div className={css.deleteForm}>
            <code>{deleteTarget.sessionId}</code>
            <input
              autoFocus
              value={deleteConfirmation}
              disabled={snapshot.deleting}
              aria-label="输入 Topic Session ID 以确认永久删除"
              placeholder="粘贴上方 Session ID"
              onChange={(event) => setDeleteConfirmation(event.currentTarget.value)}
            />
            {deleteError !== null && <div className={css.modalError} role="alert">{friendlyFailure(snapshot.error ?? deleteError)}</div>}
          </div>
        )}
      </Modal>
    </>
  )
}

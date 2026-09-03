import {
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
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
import type { CompanionFace, CompanionPhase } from '../companion-controller.ts'
import type { TopicMessage } from '../../topic.ts'
import type { CiteBus } from '../types.ts'
import { parseNextQuestions } from '../prompt.ts'
import { appendBoardCitation, isTopicMessageVisible } from '../topic-presentation.ts'
import collapseArrowUrl from '../assets/collapse-arrow.svg'
import mascotUrl from '../assets/citeciter-mascot.png'
import { QuestionCard } from './QuestionCard.tsx'
import { RichAnswer } from './RichAnswer.tsx'
import css from './CiteCiter.module.css'

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

function findContainingFrame(panel: HTMLElement | null): HTMLElement | null {
  const frame = panel?.closest<HTMLElement>('[data-shell-overlay]')?.parentElement
  return frame instanceof HTMLElement ? frame : null
}

function useDockColumn(panel: RefObject<HTMLElement | null>,
  open: boolean,
  widthPercent: number,
): readonly [number, boolean] {
  const [width, setWidth] = useState(0)
  const [docked, setDocked] = useState(false)
  useEffect(() => {
    if (!open) return
    const frame = findContainingFrame(panel.current)
    if (frame === null) {
      setWidth(Math.min(window.innerWidth, 720))
      setDocked(false)
      return
    }
    const owner = crypto.randomUUID()
    const setTrack = (name: string, value: string) => {
      if (frame.style.getPropertyValue(name) !== value) frame.style.setProperty(name, value)
    }
    const clearDock = () => {
      if (frame.dataset.citeciterDocked !== owner) return
      delete frame.dataset.citeciterDocked
      frame.style.removeProperty('--citeciter-sidebar-width')
      frame.style.removeProperty('--citeciter-dock-width')
    }
    const apply = () => {
      const activeOwner = frame.dataset.citeciterDocked
      if (activeOwner !== undefined && activeOwner !== owner) return
      const frameWidth = frame.getBoundingClientRect().width
      const nativeTrack = /^([\d.]+)px(?:\s|$)/u.exec(frame.style.gridTemplateColumns)
      const sidebarWidth = nativeTrack === null
        ? frame.firstElementChild?.getBoundingClientRect().width ?? 0
        : Number(nativeTrack[1])
      const available = frameWidth - sidebarWidth - 480
      if (available < 360) {
        clearDock()
        setWidth(Math.min(frameWidth, 720))
        setDocked(false)
        return
      }
      const requested = frameWidth * widthPercent / 100
      const panelWidth = Math.max(360, Math.min(requested, available))
      setTrack('--citeciter-sidebar-width', sidebarWidth + 'px')
      setTrack('--citeciter-dock-width', panelWidth + 'px')
      frame.dataset.citeciterDocked = owner
      setWidth(panelWidth)
      setDocked(true)
    }
    apply()
    const resizeObserver = new ResizeObserver(apply)
    const styleObserver = new MutationObserver(apply)
    resizeObserver.observe(frame)
    styleObserver.observe(frame, { attributes: true, attributeFilter: ['style'] })
    return () => {
      resizeObserver.disconnect()
      styleObserver.disconnect()
      clearDock()
    }
  }, [open, panel, widthPercent])
  return [width, docked]
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
        {args === null ? <pre>{message.arguments}</pre> : <JsonTree data={args} label="工具参数" copyable={false} />}
        {message.result !== null && (
          <>
            <strong>{message.isError ? '错误' : '结果'}</strong>
            {result === null
              ? <pre>{message.result}</pre>
              : <JsonTree data={result} label="工具结果" copyable={false} />}
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
  companion,
  reportParseError,
}: {
  readonly message: Extract<TopicMessage, { role: 'assistant' }>
  readonly disabled: boolean
  readonly companion: CompanionFace
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
              onClick={() => { void companion.ask(question) }}
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
  readonly bus: CiteBus
  readonly companion: CompanionFace
  readonly closePanel: () => void
  readonly reportParseError: (messageId: string) => void
}

/**
 * Render the independent Topic workspace on the right edge of the shell.
 * @param props - shared panel bus, Topic controller, and host callbacks.
 * @returns the responsive Topic dock and its dialogs, or null while closed.
 */
export function CitePanel({ bus, companion, closePanel, reportParseError }: CitePanelProps) {
  const overlay = useSyncExternalStore(bus.subscribe, bus.getSnapshot)
  const snapshot = useSyncExternalStore(companion.subscribe, companion.getSnapshot)
  const [question, setQuestion] = useState('')
  const [title, setTitle] = useState('')
  const [titleDirty, setTitleDirty] = useState(false)
  const [newTopicOpen, setNewTopicOpen] = useState(false)
  const [newTopicQuestion, setNewTopicQuestion] = useState('')
  const [newTopicScenario, setNewTopicScenario] = useState<'qa' | 'present'>('qa')
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
  const modalReturnFocusRef = useRef<HTMLElement | null>(null)
  const open = overlay.panelOpen
  const active = snapshot.active
  const canAsk = snapshot.phase === 'ready' || snapshot.phase === 'stopped' || snapshot.phase === 'error'
  const [panelWidth, docked] = useDockColumn(panelRef, open, widthPercent)

  useEffect(() => open ? companion.retainVisible() : undefined, [companion, open])
  useEffect(() => setWidthPercent(snapshot.settings.panelWidthPercent), [snapshot.settings.panelWidthPercent])
  useEffect(() => {
    setQuestion('')
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
  }, [active?.topic.sessionId, bus, overlay.boardCitation])
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
    if (value === '') return
    const submitted = question
    void companion.ask(value).then((sent) => {
      if (sent) setQuestion((current) => current === submitted ? '' : current)
    })
  }
  const openNewTopic = () => {
    modalReturnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setNewTopicQuestion('')
    setNewTopicScenario('qa')
    setNewTopicError(null)
    setNewTopicOpen(true)
  }
  const submitNewTopic = async () => {
    const value = newTopicQuestion.trim()
    if (value === '' || newTopicSubmitting || snapshot.sourceSessionId === null) return
    setNewTopicSubmitting(true)
    setNewTopicError(null)
    try {
      if (await companion.createFree(value, newTopicScenario)) {
        setNewTopicOpen(false)
        setNewTopicQuestion('')
      } else {
        setNewTopicError(companion.getSnapshot().error ?? 'Topic 未创建，请重试。')
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
      setDeleteError(companion.getSnapshot().error ?? 'Topic 未删除，请重试。')
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
        width: panelWidth > 0 ? panelWidth : undefined,
        '--citeciter-panel-width': `${dockWidthPercent}vw`,
      } as CSSProperties}
      data-citeciter-panel
      data-overlay={docked ? undefined : true}
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

      <div className={css.dockBody}>
        <section className={css.learningWorkspace}>
          <header className={css.dockHeader}>
            <div className={css.dockHeading}>
              <span className={css.modeBadge}>{active === null
                ? snapshot.phase === 'creating' ? '待确认' : '学习栏'
                : active.topic.mode === 'exact-fork' ? 'Exact Fork' : 'Observer'}</span>
              <strong>{active?.topic.title ?? '新的学习讨论'}</strong>
              <span>{PHASE_LABEL[snapshot.phase]}</span>
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
              <option value="">选择 Topic</option>
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

          {snapshot.notice !== null && <div className={css.panelNotice} role="status">{snapshot.notice}</div>}

          {active === null && snapshot.draftQuote === null ? (
            <div className={css.emptyState}>
              <div className={css.emptyWhale} aria-hidden="true"><img src={mascotUrl} alt="" /></div>
              <h2>编程别停，问题放到旁边问</h2>
              <p>直接新建自由 Topic，或选中主对话里一次已完成模型调用的文字后右键提问。</p>
              {snapshot.phase === 'creating' && <div className={css.loadingCard}>正在创建 Topic…</div>}
              {snapshot.error !== null && <p className={css.panelError} role="alert">{friendlyFailure(snapshot.error)}</p>}
            </div>
          ) : (
            <>
              <div className={css.contextBar}>
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
              </div>

              <div className={css.transcript} aria-live="polite">
                {visibleMessages.map((message) => {
                  if (message.role === 'tool') return <ToolRow key={message.id} message={message} />
                  if (message.role === 'user') return (
                    <article key={message.id} className={css.userTurn}>
                      <div className={css.turnRole}>你</div><p>{message.text}</p>
                    </article>
                  )
                  if (message.role === 'error') return <ErrorTurn key={message.id} message={message} />
                  if (message.role === 'context') return null
                  return (
                    <AssistantTurn
                      key={message.id}
                      message={message}
                      disabled={!canAsk}
                      companion={companion}
                      reportParseError={reportParseError}
                    />
                  )
                })}
                {snapshot.phase === 'creating' && <div className={css.loadingCard}>正在验证引用并建立 Topic…</div>}
                {snapshot.error !== null && !visibleMessages.some((message) =>
                  message.role === 'error' || message.role === 'tool' && message.isError) && (
                  <p className={css.panelError} data-citeciter-error role="alert">{friendlyFailure(snapshot.error)}</p>
                )}
              </div>

              {active !== null && (
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
              )}

              {active?.pendingQuestion !== null && active?.pendingQuestion !== undefined
                ? <QuestionCard key={active.pendingQuestion.key} pending={active.pendingQuestion} companion={companion} />
                : (
                  <form className={css.composer} onSubmit={submit}>
                    <textarea
                      ref={composerRef}
                      rows={3}
                      maxLength={12_000}
                      aria-label="继续向 CiteCiter 提问"
                      value={question}
                      disabled={active === null}
                      onChange={(event) => setQuestion(event.currentTarget.value)}
                      placeholder={active === null ? 'Topic 创建后可继续追问' : '继续追问，或聊点题外话…'}
                    />
                    <div className={css.composerActions}>
                      <span>只读 · 不干预主 Agent</span>
                      <button
                        className={css.sendButton}
                        type={snapshot.phase === 'running' ? 'button' : 'submit'}
                        disabled={snapshot.phase === 'stopping'
                          || snapshot.phase !== 'running' && (!canAsk || active === null || question.trim() === '')}
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

        <nav className={css.topicRail} aria-label="CiteCiter Topics">
          <div className={css.brand}>
            <span className={css.mascotStatus}>
              <img src={mascotUrl} alt="" />
            </span>
            <div><strong>CiteCiter</strong><span>学习伴侣</span></div>
          </div>
          <div className={css.railCaption}>
            <span>{snapshot.includeArchived ? '归档讨论' : '当前来源的讨论'}</span>
            <div className={css.railActions}>
              <button type="button" onClick={openNewTopic}>+ 新 Topic</button>
              <button type="button" onClick={() => companion.setIncludeArchived(!snapshot.includeArchived)}>
                {snapshot.includeArchived ? '返回活动' : '查看归档'}
              </button>
            </div>
          </div>
          <div className={css.topicList}>
            {snapshot.topics.map((topic) => (
              <button
                className={css.topicItem}
                data-active={active?.topic.sessionId === topic.sessionId || undefined}
                aria-current={active?.topic.sessionId === topic.sessionId ? 'page' : undefined}
                data-archived={topic.archived || undefined}
                data-citeciter-topic={topic.sessionId}
                type="button"
                key={topic.sessionId}
                onClick={() => { void companion.openTopic(topic.sessionId) }}
              >
                <span className={css.topicStatus} data-running={topic.running || undefined} />
                <span className={css.topicCopy}>
                  <strong data-pending={topic.titlePending || undefined}>{topic.title}</strong>
                  <small>{topic.citation === null ? '无引用 · 自由讨论' : '“' + compactPreview(topic.citation.displayText, 54) + '”'}</small>
                </span>
              </button>
            ))}
            {snapshot.topicsStatus === 'loading' && <p className={css.railEmpty} role="status">正在读取 Topic…</p>}
            {snapshot.topicsStatus === 'error' && (
              <p className={css.railError} role="alert">Topic 读取失败<br />{snapshot.topicsError}</p>
            )}
            {snapshot.topicsStatus === 'ready' && snapshot.topics.length === 0 && (
              <p className={css.railEmpty}>{snapshot.includeArchived
                ? '当前来源还没有归档 Topic。'
                : '点击“+ 新 Topic”可直接问答或讲解，也可从中央对话选中文字后开始。'}</p>
            )}
          </div>
          <div className={css.railFoot}>
            <span>{snapshot.topicsStatus === 'ready' ? snapshot.topics.length + ' 个 Topic' : 'Topic 状态未知'}</span>
            <span>{widthPercent}%</span>
          </div>
        </nav>
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
              <strong>讲解</strong><span>配合小黑板逐步说明</span>
            </button>
          </fieldset>
          <textarea
            autoFocus
            rows={5}
            maxLength={12_000}
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
            <div className={css.modalError} role="alert">{friendlyFailure(newTopicError)}</div>
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
            {deleteError !== null && <div className={css.modalError} role="alert">{friendlyFailure(deleteError)}</div>}
          </div>
        )}
      </Modal>
    </>
  )
}

import {
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
  DisclosureRow,
  IconArchiveOutline20,
  IconQuestionOutline14,
  IconSendOutline16,
  IconSparkle16,
  IconStopFill16,
  IconThinkOutline14,
  JsonTree,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { CompanionFace, CompanionPhase } from '../companion-controller.ts'
import type { TopicMessage } from '../../topic.ts'
import type { CiteBus } from '../types.ts'
import { parseNextQuestions } from '../prompt.ts'
import collapseArrowUrl from '../assets/collapse-arrow.svg'
import mascotUrl from '../assets/citeciter-mascot.png'
import { QuestionCard } from './QuestionCard.tsx'
import { RichAnswer } from './RichAnswer.tsx'
import css from './CiteCiter.module.css'

const PHASE_LABEL: Record<CompanionPhase, string> = {
  idle: '等待一个选区',
  creating: '正在确认上下文方式…',
  ready: '可以继续追问',
  running: 'CiteCiter 正在回答…',
  stopping: '正在停止…',
  stopped: '已停止，可继续',
  error: '需要处理',
}

type MascotState = 'diving' | 'reading' | 'answering' | 'surfaced'

function mascotState(phase: CompanionPhase, messages: readonly TopicMessage[]): MascotState {
  const runningTool = messages.findLast((message) => message.role === 'tool' && message.running)
  if (runningTool?.role === 'tool' && runningTool.name.toLowerCase().includes('bash')) return 'diving'
  if (runningTool?.role === 'tool' && ['read', 'read_source_session', 'glob', 'grep'].includes(runningTool.name)) return 'reading'
  return phase === 'running' || phase === 'creating' || phase === 'stopping' ? 'answering' : 'surfaced'
}

function MascotStatus({ state }: { readonly state: MascotState }) {
  const labels: Record<MascotState, string> = {
    diving: '鲸鱼娘正在潜水执行 Bash',
    reading: '鲸鱼娘正举着放大镜读取文件',
    answering: '鲸鱼娘抱住引用气泡开始回答',
    surfaced: '鲸鱼娘已浮出水面，回答完成',
  }
  return (
    <span className={css.mascotStatus} data-state={state} role="img" aria-label={labels[state]}>
      <img src={mascotUrl} alt="" />
      <span aria-hidden="true" />
    </span>
  )
}

function CitationWaterline({ anchorKey, target }: {
  readonly anchorKey: string | undefined
  readonly target: RefObject<HTMLElement>
}) {
  const [path, setPath] = useState('')
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (anchorKey === undefined) return
    const source = document.querySelector<HTMLElement>(`[data-chat-anchor-key="${CSS.escape(anchorKey)}"]`)
    const destination = target.current
    if (source === null || destination === null) return
    const update = () => {
      const from = source.getBoundingClientRect()
      const to = destination.getBoundingClientRect()
      const x1 = Math.min(from.right, window.innerWidth - 8)
      const y1 = from.top + from.height / 2
      const x2 = to.left
      const y2 = to.top + to.height / 2
      const bend = Math.max(36, Math.abs(x2 - x1) * 0.42)
      setPath(`M ${x1} ${y1} C ${x1 + bend} ${y1 - 8}, ${x2 - bend} ${y2 + 8}, ${x2} ${y2}`)
    }
    const show = () => { update(); setVisible(true) }
    const hide = () => setVisible(false)
    update()
    setVisible(true)
    const initialFade = setTimeout(hide, 1800)
    for (const element of [source, destination]) {
      element.addEventListener('pointerenter', show)
      element.addEventListener('pointerleave', hide)
    }
    window.addEventListener('resize', update)
    document.addEventListener('scroll', update, true)
    return () => {
      clearTimeout(initialFade)
      for (const element of [source, destination]) {
        element.removeEventListener('pointerenter', show)
        element.removeEventListener('pointerleave', hide)
      }
      window.removeEventListener('resize', update)
      document.removeEventListener('scroll', update, true)
    }
  }, [anchorKey, target])
  return <svg className={css.citationWaterline} data-visible={visible || undefined} aria-hidden="true"><path d={path} /></svg>
}

function clampWidth(value: number): number {
  return Math.max(28, Math.min(55, Math.round(value)))
}

function modelValue(provider: string, model: string): string {
  return encodeURIComponent(provider) + '|' + encodeURIComponent(model)
}

function parseModelValue(value: string): [string, string] {
  const divider = value.indexOf('|')
  return [decodeURIComponent(value.slice(0, divider)), decodeURIComponent(value.slice(divider + 1))]
}

function quotePreview(text: string): string {
  const compact = text.replaceAll(/\s+/g, ' ').trim()
  return compact.length > 54 ? compact.slice(0, 54) + '…' : compact
}

function firstLine(text: string): string {
  return text.trim().split(/\r?\n/u, 1)[0] ?? ''
}

function latestLine(text: string): string {
  return text.trimEnd().split(/\r?\n/u).at(-1) ?? ''
}

function compactPreview(text: string): string {
  const compact = text.replaceAll(/\s+/g, ' ').trim()
  return compact.length > 120 ? compact.slice(0, 120) + '…' : compact
}

function jsonObject(text: string): object | unknown[] | null {
  try {
    const value: unknown = JSON.parse(text)
    return typeof value === 'object' && value !== null ? value as object | unknown[] : null
  } catch {
    return null
  }
}

const TOOL_TITLES: Readonly<Record<string, string>> = {
  read_source_session: '读取来源会话',
  read: '读取文件',
  glob: '枚举文件',
  grep: '搜索内容',
  ask_user_question: '提问',
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
  const summaryRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!running) return
    const element = summaryRef.current
    if (element !== null) element.scrollLeft = element.scrollWidth - element.clientWidth
  }, [running, summary])
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
      collapsedContent={(
        <><span className={css.flowDot}>·</span><span className={css.flowSummary} ref={summaryRef}>{summary}</span></>
      )}
    >
      {children}
    </DisclosureRow>
  )
}

function ReasoningRow({ text, running }: { readonly text: string, readonly running: boolean }) {
  return (
    <FlowDisclosure
      icon={<IconThinkOutline14 />}
      title="Think"
      summary={running ? latestLine(text) : firstLine(text)}
      running={running}
    >
      <pre className={css.flowBody}>{text}</pre>
    </FlowDisclosure>
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
      title={TOOL_TITLES[message.name] ?? message.name}
      summary={summary}
      running={message.running}
    >
      <div className={css.toolPreview}>
        <strong>参数</strong>
        {args === null ? <pre>{message.arguments}</pre> : <JsonTree data={args} label="工具参数" copyable={false} />}
        {message.result !== null && (
          <><strong>{message.isError ? '错误' : '结果'}</strong>{result === null
            ? <pre>{message.result}</pre>
            : <JsonTree data={result} label="工具结果" copyable={false} />}</>
        )}
      </div>
    </FlowDisclosure>
  )
}

function ContextRow({ message }: { readonly message: Extract<TopicMessage, { role: 'context' }> }) {
  return (
    <FlowDisclosure icon={<IconSparkle16 />} title={message.label} summary={firstLine(message.text)}>
      <pre className={css.flowBody}>{message.text}</pre>
    </FlowDisclosure>
  )
}

function friendlyFailure(text: string): string {
  return text.replaceAll(/https?:\/\/[^\s)]+/gu, '模型服务地址')
}

function ErrorTurn({ message }: { readonly message: Extract<TopicMessage, { role: 'error' }> }) {
  const summary = friendlyFailure(message.text)
  return (
    <article className={css.errorTurn} data-status={message.status}>
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
  first,
  disabled,
  companion,
  reportParseError,
}: {
  readonly message: Extract<TopicMessage, { role: 'assistant' }>
  readonly first: boolean
  readonly disabled: boolean
  readonly companion: CompanionFace
  readonly reportParseError: (messageId: string) => void
}) {
  const parsed = useMemo(
    () => first
      ? parseNextQuestions(message.text)
      : { text: message.text, questions: [], invalid: false },
    [first, message.text],
  )
  useEffect(() => {
    if (parsed.invalid && !message.streaming) reportParseError(message.id)
  }, [message.id, message.streaming, parsed.invalid, reportParseError])
  return (
    <article className={css.assistantTurn}>
      <div className={css.turnRole}>CiteCiter</div>
      {message.reasoning !== null && <ReasoningRow text={message.reasoning} running={message.streaming} />}
      {parsed.text !== '' && <RichAnswer text={parsed.text} streaming={message.streaming} />}
      {!message.streaming && parsed.questions.length === 3 && (
        <div className={css.nextQuestions} aria-label="接下来可能想问">
          {parsed.questions.map((question) => (
            <button type="button" key={question} disabled={disabled} onClick={() => { void companion.ask(question) }}>{question}</button>
          ))}
        </div>
      )}
    </article>
  )
}

/** Reserve a real third DSH column while keeping the official shell and coding surface intact. */
function useDockColumn(open: boolean, widthPercent: number): readonly [number, boolean] {
  const [width, setWidth] = useState(0)
  const [docked, setDocked] = useState(true)
  useEffect(() => {
    if (!open) return
    const overlay = document.querySelector<HTMLElement>('[data-shell-overlay]')
    const frame = overlay?.parentElement
    if (!(frame instanceof HTMLElement)) return
    const setTrack = (name: string, value: string) => {
      if (frame.style.getPropertyValue(name) !== value) frame.style.setProperty(name, value)
    }
    const apply = () => {
      const frameWidth = frame.getBoundingClientRect().width
      const nativeTrack = /^([\d.]+)px(?:\s|$)/u.exec(frame.style.gridTemplateColumns)
      const sidebarWidth = nativeTrack === null
        ? frame.firstElementChild?.getBoundingClientRect().width ?? 0
        : Number(nativeTrack[1])
      const available = frameWidth - sidebarWidth - 480
      setTrack('--citeciter-sidebar-width', sidebarWidth + 'px')
      if (available < 360) {
        setTrack('--citeciter-dock-width', '0px')
        setWidth(Math.min(frameWidth, 720))
        setDocked(false)
        return
      }
      const requested = frameWidth * widthPercent / 100
      const panelWidth = Math.max(360, Math.min(requested, available))
      setTrack('--citeciter-dock-width', panelWidth + 'px')
      setWidth(panelWidth)
      setDocked(true)
    }
    apply()
    frame.dataset.citeciterDocked = 'true'
    const resizeObserver = new ResizeObserver(apply)
    const styleObserver = new MutationObserver(apply)
    resizeObserver.observe(frame)
    styleObserver.observe(frame, { attributes: true, attributeFilter: ['style'] })
    return () => {
      resizeObserver.disconnect()
      styleObserver.disconnect()
      delete frame.dataset.citeciterDocked
      frame.style.removeProperty('--citeciter-sidebar-width')
      frame.style.removeProperty('--citeciter-dock-width')
    }
  }, [open, widthPercent])
  return [width, docked]
}

export interface CitePanelProps {
  readonly bus: CiteBus
  readonly companion: CompanionFace
  readonly closePanel: () => void
  readonly reportParseError: (messageId: string) => void
}

/** Independent, resizable learning workspace docked beside the active coding conversation. */
export function CitePanel({ bus, companion, closePanel, reportParseError }: CitePanelProps) {
  const overlay = useSyncExternalStore(bus.subscribe, bus.getSnapshot)
  const snapshot = useSyncExternalStore(companion.subscribe, companion.getSnapshot)
  const [question, setQuestion] = useState('')
  const [title, setTitle] = useState('')
  const [titleDirty, setTitleDirty] = useState(false)
  const [widthPercent, setWidthPercent] = useState(snapshot.settings.panelWidthPercent)
  const resizeOrigin = useRef<{ x: number, width: number, frameWidth: number } | null>(null)
  const titleRef = useRef<HTMLElement>(null)
  const open = overlay.panelOpen
  const [panelWidth, docked] = useDockColumn(open, widthPercent)
  const active = snapshot.active

  useEffect(() => companion.setVisible(open), [companion, open])
  useEffect(() => setWidthPercent(snapshot.settings.panelWidthPercent), [snapshot.settings.panelWidthPercent])
  useEffect(() => {
    setTitle(active?.topic.title ?? '')
    setTitleDirty(false)
  }, [active?.topic.sessionId])
  useEffect(() => {
    if (!titleDirty) setTitle(active?.topic.title ?? '')
  }, [active?.topic.title, titleDirty])

  const selectedProvider = snapshot.providers.find((provider) => provider.id === active?.topic.modelConfig.provider)
  const selectedModel = selectedProvider?.models.find((model) => model.id === active?.topic.modelConfig.model)
  const models = useMemo(() => snapshot.providers.flatMap((provider) => provider.models.map((model) => ({
    provider: provider.id,
    providerName: provider.name,
    model,
  }))), [snapshot.providers])
  const firstAssistantId = active?.messages.find((message) => message.role === 'assistant' && message.text !== '')?.id
  const whaleState = mascotState(snapshot.phase, active?.messages ?? [])

  if (!open) return null

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (snapshot.phase === 'running' || snapshot.phase === 'stopping') return
    const value = question.trim()
    if (value === '') return
    const submitted = question
    void companion.ask(value).then((sent) => {
      if (sent) setQuestion((current) => current === submitted ? '' : current)
    })
  }
  const updateWidth = (next: number) => {
    const value = clampWidth(next)
    setWidthPercent(value)
    void companion.setSetting('panelWidthPercent', value)
  }
  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    resizeOrigin.current = {
      x: event.clientX,
      width: widthPercent,
      frameWidth: document.querySelector<HTMLElement>('[data-shell-overlay]')?.parentElement?.getBoundingClientRect().width
        ?? window.innerWidth,
    }
  }
  const moveResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const origin = resizeOrigin.current
    if (origin === null || !event.currentTarget.hasPointerCapture(event.pointerId)) return
    setWidthPercent(clampWidth(origin.width + (origin.x - event.clientX) / origin.frameWidth * 100))
  }
  const endResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const origin = resizeOrigin.current
    if (origin === null || !event.currentTarget.hasPointerCapture(event.pointerId)) return
    resizeOrigin.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)
    updateWidth(origin.width + (origin.x - event.clientX) / origin.frameWidth * 100)
  }
  const cancelResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    resizeOrigin.current = null
    setWidthPercent(snapshot.settings.panelWidthPercent)
  }
  const resizeKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    updateWidth(widthPercent + (event.key === 'ArrowLeft' ? 1 : -1))
  }

  return (
    <aside
      className={css.dock}
      style={{ width: panelWidth > 0 ? panelWidth : undefined }}
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
          onPointerCancel={cancelResize}
          onKeyDown={resizeKey}
        />
      )}
      <button className={css.closeButton} type="button" onClick={closePanel} aria-label="关闭 CiteCiter">
        <img src={collapseArrowUrl} alt="" />
      </button>
      <CitationWaterline anchorKey={snapshot.sourceAnchorKey ?? undefined} target={titleRef} />

      <nav className={css.topicRail} aria-label="CiteCiter Topics">
        <div className={css.brand}>
          <MascotStatus state={whaleState} />
          <div><strong>CiteCiter</strong><span>学习伴侣</span></div>
        </div>
        <div className={css.railCaption}>
          <span>{snapshot.includeArchived ? '归档讨论' : '当前来源的讨论'}</span>
          <button type="button" onClick={() => companion.setIncludeArchived(!snapshot.includeArchived)}>
            {snapshot.includeArchived ? '返回活动' : '查看归档'}
          </button>
        </div>
        <div className={css.topicList}>
          {snapshot.topics.map((topic) => (
            <button
              className={css.topicItem}
              data-active={active?.topic.sessionId === topic.sessionId || undefined}
              data-archived={topic.archived || undefined}
              data-citeciter-topic={topic.sessionId}
              type="button"
              key={topic.sessionId}
              onClick={() => { void companion.openTopic(topic.sessionId) }}
            >
              <span className={css.topicStatus} data-running={topic.running || undefined} />
              <span className={css.topicCopy}>
                <strong data-pending={topic.titlePending || undefined}>{topic.title}</strong>
                <small>“{quotePreview(topic.citation.displayText)}”</small>
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
              : '在中央编程对话中选中文字，右键即可开始。'}</p>
          )}
        </div>
        <div className={css.railFoot}>
          <span>{snapshot.topicsStatus === 'ready' ? `${snapshot.topics.length} 个 Topic` : 'Topic 状态未知'}</span>
          <span>{widthPercent}%</span>
        </div>
      </nav>

      <section className={css.learningWorkspace}>
        <header className={css.dockHeader}>
          <div className={css.dockHeading}>
            <span className={css.modeBadge}>{active === null
              ? snapshot.phase === 'creating' ? '待确认' : '学习栏'
              : active.topic.mode === 'exact-fork' ? 'Exact Fork' : 'Observer'}</span>
            <strong ref={titleRef}>{active?.topic.title ?? '新的学习讨论'}</strong>
            <span>{PHASE_LABEL[snapshot.phase]}</span>
          </div>
        </header>

        {active === null && snapshot.draftQuote === null ? (
          <div className={css.emptyState}>
            <div className={css.emptyWhale} aria-hidden="true"><img src={mascotUrl} alt="" /></div>
            <h2>编程别停，问题放到旁边问</h2>
            <p>选中主对话里一次已完成模型调用的任意文字，右键输入问题。Topic 会在这里独立多轮继续，不进入左侧主会话列表。</p>
            {snapshot.error !== null && <p className={css.panelError}>{friendlyFailure(snapshot.error)}</p>}
          </div>
        ) : (
          <>
            <div className={css.contextBar}>
              <blockquote>“{active?.topic.citation.displayText ?? snapshot.draftQuote}”</blockquote>
              {active !== null && (
                <div className={css.contextMeta}>
                  <span data-ok={active.topic.sourceAvailable || undefined}>
                    {active.topic.sourceAvailable ? '来源在线' : '来源不可用'}
                  </span>
                  <span>{active.topic.observedThroughSeq === null ? '尚未读取来源' : '已读至 seq ' + active.topic.observedThroughSeq}</span>
                </div>
              )}
            </div>

            {active !== null && (
              <div className={css.topicToolbar}>
                <form onSubmit={(event) => {
                  event.preventDefault()
                  void companion.rename(title).then((saved) => {
                    if (saved) setTitleDirty(false)
                  })
                }}>
                  <input value={title} onChange={(event) => {
                    setTitle(event.currentTarget.value)
                    setTitleDirty(true)
                  }} aria-label="Topic 标题" />
                  <button type="submit" disabled={title.trim() === '' || !titleDirty || snapshot.renaming}>
                    {snapshot.renaming ? '保存中…' : titleDirty ? '保存标题' : '已保存'}
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
                  {!models.some((item) => item.provider === active.topic.modelConfig.provider && item.model.id === active.topic.modelConfig.model) && (
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
                  <IconArchiveOutline20 size={14} />{snapshot.archiving ? '处理中…' : active.topic.archived ? '恢复' : '归档'}
                </button>
              </div>
            )}

            <div className={css.transcript} aria-live="polite">
              {active?.messages.map((message) => {
                if (message.role === 'tool') return <ToolRow key={message.id} message={message} />
                if (message.role === 'context') return <ContextRow key={message.id} message={message} />
                if (message.role === 'user') return (
                  <article key={message.id} className={css.userTurn}>
                    <div className={css.turnRole}>你</div><p>{message.text}</p>
                  </article>
                )
                if (message.role === 'error') return (
                  <ErrorTurn key={message.id} message={message} />
                )
                return <AssistantTurn
                  key={message.id}
                  message={message}
                  first={message.id === firstAssistantId}
                  disabled={snapshot.phase === 'running' || snapshot.phase === 'stopping'}
                  companion={companion}
                  reportParseError={reportParseError}
                />
              })}
              {snapshot.phase === 'creating' && <div className={css.loadingCard}>正在验证引用并确认 Observer / Exact Fork…</div>}
              {snapshot.error !== null && !active?.messages.some((message) => message.role === 'error') && (
                <p className={css.panelError} data-citeciter-error>{friendlyFailure(snapshot.error)}</p>
              )}
            </div>

            {active?.pendingQuestion !== null && active?.pendingQuestion !== undefined
              ? <QuestionCard key={active.pendingQuestion.key} pending={active.pendingQuestion} companion={companion} />
              : <form className={css.composer} onSubmit={submit}>
              <textarea
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
                  disabled={snapshot.phase === 'stopping' || snapshot.phase !== 'running' && (active === null || question.trim() === '')}
                  aria-label={snapshot.phase === 'running' ? '停止回答' : snapshot.phase === 'stopping' ? '正在停止' : '发送'}
                  onClick={snapshot.phase === 'running' ? () => { void companion.stop() } : undefined}
                >
                  {snapshot.phase === 'running' || snapshot.phase === 'stopping'
                    ? <IconStopFill16 size={16} />
                    : <IconSendOutline16 size={16} />}
                </button>
              </div>
            </form>}
          </>
        )}
      </section>
    </aside>
  )
}

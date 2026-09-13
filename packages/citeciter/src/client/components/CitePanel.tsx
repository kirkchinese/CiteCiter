import { useCompactNavigation } from '../compact-navigation.ts'
import { useTranscriptPosition } from '../transcript-position.ts'
import { TopicHeader } from './TopicHeader.tsx'
import { UserMessageBody } from './UserMessageBody.tsx'
import type { NativeComposer, DeliveryMode } from '../native-composer.ts'
import type { ComposerAttachment } from '@deepseek-ai/dsh-client-ui-conversation/client'
import { MessageAttachments } from './MessageAttachments.tsx'
import { BoardCaptureSurface } from './BoardCaptureSurface.tsx'
import { FileAttachments } from './FileAttachments.tsx'
import { NativeQueue } from './NativeQueue.tsx'
import { NativeInteraction } from './NativeInteraction.tsx'
import type { UseSessionPendingInteraction } from '@deepseek-ai/dsh-client-ui-session/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
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
  IconQuestionOutline14,
  IconSparkle16,
  JsonTree,
  Modal,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { CompanionPhase } from '../companion-controller.ts'
import type { TopicMessage } from '../../topic.ts'
import { parseNextQuestions } from '../prompt.ts'
import { isTopicMessageVisible } from '../topic-presentation.ts'
import collapseArrowUrl from '../assets/collapse-arrow.svg'
import mascotUrl from '../assets/citeciter-mascot.png'
import { QuestionCard } from './QuestionCard.tsx'
import { OverlayPortal } from './OverlayPortal.tsx'
import { RichAnswer } from './RichAnswer.tsx'
import { ReasoningDisclosure } from './ReasoningDisclosure.tsx'
import css from './CiteCiter.module.css'
import { jsonTreeLabels } from '../copy.ts'
import { usePanelDrag } from '../panel-drag.ts'
import { findContainingFrame, useHostDock } from '../host-dock.ts'
import { projectLearningCards } from '../../learning.ts'
import { topicDraftReferences, serializeDraftReferences, type DraftReference } from '../draft-references.ts'
import { withLearningRoute } from '../learning-route.ts'
import { ReferenceAttachments } from './ReferenceAttachments.tsx'
import { LearningRoute } from './LearningRoute.tsx'
import { LearningCards } from './LearningCards.tsx'
import { TopicComposer } from './TopicComposer.tsx'
import { TopicSettingsDialog } from './TopicSettingsDialog.tsx'
import { TopicNavigation } from './TopicNavigation.tsx'
import { TopicTitle } from './TopicTitle.tsx'
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

function ToolRow({ message, sessionId, load }: { readonly message: Extract<TopicMessage, { role: 'tool' }>, readonly sessionId: string, readonly load: NativeComposer['image'] }) {
  const args = jsonObject(message.arguments)
  const result = message.result === null ? null : jsonObject(message.result)
  const summary = message.running
    ? compactPreview(message.arguments)
    : message.isError
      ? '调用失败'
      : compactPreview(message.result || ((message.attachments?.length ?? 0) > 0 ? '图片已返回' : '完成'))
  return (
    <div data-citeciter-message={message.id}><FlowDisclosure
      icon={message.name === 'ask_user_question' ? <IconQuestionOutline14 /> : <IconSparkle16 />}
      title={message.name}
      summary={summary}
      running={message.running}
    >
      <div className={css.toolPreview}>
        <MessageAttachments sessionId={sessionId} attachments={message.attachments ?? []} load={load} />
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
    </FlowDisclosure></div>
  )
}

function ErrorTurn({ message }: { readonly message: Extract<TopicMessage, { role: 'error' }> }) {
  const summary = friendlyFailure(message.text)
  return (
    <article
      className={css.errorTurn}
      data-citeciter-message={message.id}
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
    <article className={css.assistantTurn} data-citeciter-message={message.renderKey ?? message.id}>
      <div className={css.turnRole}>CiteCiter</div>
      {message.reasoning !== null && message.reasoning.trim() !== '' && (
        <ReasoningDisclosure text={message.reasoning} active={message.streaming && message.text === ''} />
      )}
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
  readonly nativeComposer: NativeComposer
  readonly useCompanion: SnapshotSelectorHook<CompanionSnapshot>
  readonly useOverlay: SnapshotSelectorHook<CiteOverlaySnapshot>
  readonly useInteractions: UseSessionPendingInteraction
  readonly useSubmission: SnapshotSelectorHook<DeliveryMode>
  readonly bus: OverlayActions
  readonly companion: CompanionActions
  readonly closePanel: () => void
  readonly openReader: () => void
  readonly reportParseError: (messageId: string) => void
}

/**
 * Render the independent Topic workspace on the right edge of the shell.
 * @param props - shared panel bus, Topic controller, and host callbacks.
 * @returns the responsive Topic dock and its dialogs, or null while closed.
 */
export function CitePanel({ nativeComposer, useCompanion, useOverlay, useInteractions, useSubmission, bus, companion, closePanel, openReader, reportParseError }: CitePanelProps) {
  const overlay = useOverlay(value => value)
  const snapshot = useCompanion(value => value)
  const pendingInteraction = useInteractions(value => snapshot.active?.topic.hosted === true ? value.get(snapshot.active.topic.sessionId as SessionId) : undefined)
  const draftKey = snapshot.active?.topic.sessionId ?? snapshot.sourceSessionId ?? 'new'
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const question = drafts[draftKey] ?? ''
  const setQuestion = useCallback((value: string | ((current: string) => string)) => {
    setDrafts(current => ({ ...current, [draftKey]: typeof value === 'string' ? value : value(current[draftKey] ?? '') }))
  }, [draftKey])
  const [files, setFiles] = useState<Record<string, readonly ComposerAttachment[]>>({})
  const defaultDelivery = useSubmission(value => value)
  const [deliveryOverride, setDeliveryOverride] = useState<{ key: string, base: DeliveryMode, mode: DeliveryMode } | null>(null)
  const delivery = deliveryOverride?.key === draftKey && deliveryOverride.base === defaultDelivery ? deliveryOverride.mode : defaultDelivery
  const setDelivery = (mode: DeliveryMode) => setDeliveryOverride({ key: draftKey, base: defaultDelivery, mode })
  const [attachmentError, setAttachmentError] = useState<string | null>(null)
  const [references, setReferences] = useState<Record<string, readonly DraftReference[]>>({})
  const consumedSeeds = useRef(new Set<string>())
  const [views, setViews] = useState<Record<string, 'explain' | 'cards'>>({})
  const view = views[draftKey] ?? 'explain'
  const setView = (next: 'explain' | 'cards') => setViews(current => ({ ...current, [draftKey]: next }))
  const cards = useMemo(() => projectLearningCards(snapshot.active?.messages ?? []), [snapshot.active?.messages])
  const [topicSettingsOpen, setTopicSettingsOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ readonly sessionId: string, readonly title: string } | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [widthPercent, setWidthPercent] = useState(snapshot.settings.panelWidthPercent)
  const dockWidthPercent = widthPercent
  const resizeOrigin = useRef<{ x: number, width: number, frameWidth: number } | null>(null)
  const panelRef = useRef<HTMLElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const transcript = useTranscriptPosition(draftKey, snapshot.active?.messages)
  const modalReturnFocusRef = useRef<HTMLElement | null>(null)
  const open = overlay.panelOpen
  const active = snapshot.active
  const canAsk = snapshot.phase === 'ready' || snapshot.phase === 'stopped' || snapshot.phase === 'error' || snapshot.phase === 'running'
  const dock = useHostDock(panelRef, open, widthPercent, overlay.presentation === 'floating')
  const compact = dock?.mode === 'page'
  const floating = overlay.presentation === 'floating' && !compact
  useCompactNavigation(panelRef, open && compact)
  const drag = usePanelDrag(panelRef, floating, bus.setPresentation)
  const floatPosition = drag.position
  const docked = !floating && dock?.mode === 'columns'
  const composerFolded = false

  useEffect(() => open ? companion.retainVisible() : undefined, [companion, open])

  useEffect(() => setWidthPercent(snapshot.settings.panelWidthPercent), [snapshot.settings.panelWidthPercent])
  useEffect(() => {
    setTopicSettingsOpen(false)
  }, [active?.topic.sessionId])
  useEffect(() => {
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
    const citation = overlay.boardCitation
    if (citation === null || active?.topic.sessionId !== citation.topicSessionId) return
    setReferences(current => ({ ...current, [citation.topicSessionId]: [...(current[citation.topicSessionId] ?? []), { id: `board-${citation.id}`, kind: 'board', label: '板书引用', content: citation.prompt }] }))
    setViews(current => ({ ...current, [citation.topicSessionId]: 'explain' }))
    bus.clearBoardCitation(citation.id)
    requestAnimationFrame(() => composerRef.current?.focus())
  }, [active?.topic.sessionId, bus, overlay.boardCitation, setQuestion])
  useEffect(() => {
    const seed = snapshot.composeSeed
    if (seed === null || active?.topic.sessionId !== seed.sessionId || consumedSeeds.current.has(seed.id)) return
    consumedSeeds.current.add(seed.id)
    setDrafts(current => ({ ...current, [seed.sessionId]: seed.question }))
    setReferences(current => ({ ...current, [seed.sessionId]: topicDraftReferences(active.topic, active.documentTitle) }))
    requestAnimationFrame(() => composerRef.current?.focus())
  }, [snapshot.composeSeed, active])
  const modalTitle = deleteTarget !== null ? '永久删除 Topic' : topicSettingsOpen ? 'Topic 设置' : null
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

  const visibleMessages = active?.messages.filter((message) => isTopicMessageVisible(message, active.messages)) ?? []

  if (!open) return null

  const submit = (event: FormEvent, mode: DeliveryMode = delivery) => {
    event.preventDefault()
    if (!canAsk || snapshot.modelRouteSaving || snapshot.reasoningEffortSaving) return
    const value = question.trim()
    if (value === '' && (references[draftKey]?.length ?? 0) === 0 && (files[draftKey]?.length ?? 0) === 0) return
    const submitted = question
    const selectedReferences = references[draftKey] ?? []
    const payload = withLearningRoute(serializeDraftReferences(value, selectedReferences), snapshot.settings.learningRoute ?? false)
    const sentFiles = files[draftKey] ?? []
    void companion.ask(payload, sentFiles.map(file => file.id), mode).then((sent) => {
      if (sent) {
        setQuestion((current) => current === submitted ? '' : current)
        setFiles(current => ({ ...current, [draftKey]: (current[draftKey] ?? []).filter(file => !sentFiles.some(sent => sent.id === file.id)) }))
        const sentIds = new Set(selectedReferences.map(item => item.id))
        setReferences(current => ({ ...current, [draftKey]: (current[draftKey] ?? []).filter(item => !sentIds.has(item.id)) }))
      }
    })
  }
  const openNewTopic = () => { void companion.createFree('', 'qa') }
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
      {active?.captureId && <BoardCaptureSurface key={active.captureId} id={active.captureId} sessionId={active.topic.sessionId} board={active.board} reply={companion.boardCaptureReply} />}
      {drag.dockTarget && <OverlayPortal><div className={css.dockTarget} aria-label="松开以停靠" /></OverlayPortal>}
      <OverlayPortal inline={!floating}>
      <aside
      ref={panelRef}
      className={`${css.dock} ${floating ? css.floating : ''}`}
      style={{
        width: floating ? undefined : dock?.width,
        height: floating ? undefined : dock?.height,
        top: floating ? undefined : dock?.top,
        ...(floating && floatPosition !== null ? { left: floatPosition.left, top: floatPosition.top, right: 'auto' } : {}),
        '--citeciter-panel-width': `${dockWidthPercent}vw`,
      } as CSSProperties}
      data-citeciter-panel
      data-arrangement={floating ? 'floating' : dock?.mode ?? 'unsupported'}
      aria-label="CiteCiter 学习伴侣"
    >
      {docked && !floating && (
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
      {!compact && <button className={css.closeButton} type="button" onClick={closePanel} aria-label="关闭 CiteCiter">
        <img src={collapseArrowUrl} alt="" />
      </button>}

      {!floating && dock === null && <p className={css.layoutNotice} role="status">当前宿主布局暂不支持学习栏。请切换到标准 Web 布局或 Desktop 兼容模式。</p>}

      <div className={css.dockBody}>
        <section className={css.learningWorkspace}>
          <TopicHeader compact={compact} onBack={closePanel} onDrag={drag.start} status={PHASE_LABEL[snapshot.phase]}
            title={active === null ? <strong>Citer</strong> : <TopicTitle id={active.topic.sessionId} title={active.topic.title} onRename={companion.rename} />}>
            <TopicNavigation topics={snapshot.topics} activeId={active?.topic.sessionId} archived={snapshot.includeArchived}
              onOpen={id => { void companion.openTopic(id) }} onNew={openNewTopic} onArchiveView={companion.setIncludeArchived}
              onReader={openReader}
              onSettings={() => { modalReturnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setTopicSettingsOpen(true) }}
            />
          </TopicHeader>

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

              <LearningRoute enabled={snapshot.settings.learningRoute ?? false} messages={active?.messages ?? []} onChange={value => { void companion.setSetting('learningRoute', value) }} />

              <div className={learningCss.views} aria-label="学习内容视图">
                <button type="button" aria-pressed={view === 'explain'} onClick={() => setView('explain')}>讲解</button>
                <button type="button" aria-pressed={view === 'cards'} onClick={() => setView('cards')}>学习卡<span className={learningCss.count}>{cards.cards.length}</span></button>
              </div>

              {view === 'explain' && <div ref={transcript.ref} className={css.transcript} aria-live="polite" onScroll={transcript.onScroll}>
                {visibleMessages.map((message) => {
                  if (message.role === 'tool') return <ToolRow key={message.id} message={message} sessionId={active!.topic.sessionId} load={nativeComposer.image} />
                  if (message.role === 'user') return (
                    <article key={message.id} className={css.userTurn} data-citeciter-message={message.id}>
                        <MessageAttachments sessionId={active!.topic.sessionId} attachments={message.attachments ?? []} load={nativeComposer.image} />
                      <div className={css.turnRole}>你</div>{message.text.startsWith('【学习阶段：') ? <details className={learningCss.questionDetails}>
                        <summary>{message.text.split('\n')[0]}{message.text.includes('\n\n我的问题：') ? ` · ${message.text.split('\n\n我的问题：').slice(1).join('\n\n我的问题：')}` : ''}</summary><p>{message.text}</p>
                      </details> : <UserMessageBody text={message.text} />}
                    </article>
                  )
                  if (message.role === 'error') return <ErrorTurn key={message.id} message={message} />
                  if (message.role === 'context') return null
                  return (
                    <AssistantTurn
                      key={message.renderKey ?? message.id}
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
                {snapshot.error !== null && (
                  <p className={css.panelError} data-citeciter-error role="alert">{friendlyFailure(snapshot.error)}</p>
                )}
              </div>}
              {view === 'cards' && active !== null && <div className={learningCss.content}><LearningCards key={active.topic.sessionId}
                projection={cards} recall={snapshot.settings.activeRecall ?? false}
                setRecall={value => { void companion.setSetting('activeRecall', value) }} disabled={snapshot.settingsSaveStatus === 'saving'}
                topicTitle={active.topic.title} topicId={active.topic.sessionId}
                source={active.topic.citation?.displayText ?? '无引用 · 自由讨论'} onRevise={() => {
                  setQuestion('请先核对本 Topic 的结论，纠正错误并标明未核实内容，再生成总结学习卡片。')
                  setView('explain')
                  requestAnimationFrame(() => composerRef.current?.focus())
                }}
              /></div>}
              {view !== 'explain' && snapshot.error !== null && <p className={css.panelError} role="alert">{friendlyFailure(snapshot.error)}</p>}


              {active?.topic.hosted === true && <NativeQueue sessionId={active.topic.sessionId} native={nativeComposer} />}
              {pendingInteraction !== undefined && <NativeInteraction key={pendingInteraction.key} pending={pendingInteraction} messages={active?.messages ?? []} />}
              {active?.pendingQuestion !== null && active?.pendingQuestion !== undefined
                ? <QuestionCard key={active.pendingQuestion.key} pending={active.pendingQuestion} onAnswer={answer => companion.answerQuestion(active.pendingQuestion!.key, answer)} onCancel={() => companion.cancelQuestion(active.pendingQuestion!.key)} />
                : (
                  <TopicComposer sources={active === null ? [] : topicDraftReferences(active.topic, active.documentTitle).filter(reference => !(references[draftKey] ?? []).some(current => current.label === reference.label))}
                    onReference={reference => setReferences(current => ({ ...current, [draftKey]: [...(current[draftKey] ?? []), reference] }))} permission={active?.topic.permission ?? 'read-only'} onPermission={mode => { void companion.setPermission(mode) }} delivery={delivery} onDelivery={setDelivery}
                    onFiles={batch => { if (active !== null) { const key = active.topic.sessionId; void nativeComposer.add(key, batch).then(added => { setFiles(current => ({ ...current, [key]: [...(current[key] ?? []), ...added] })); setAttachmentError(null) }).catch(error => setAttachmentError(String(error))) } }} question={question} route={active?.topic.modelConfig} providers={snapshot.providers}
                    phase={snapshot.phase} canSend={canAsk && active !== null && (question.trim() !== '' || (references[draftKey]?.length ?? 0) > 0 || (files[draftKey]?.length ?? 0) > 0)}
                    routeSaving={snapshot.modelRouteSaving || snapshot.reasoningEffortSaving}
                    folded={composerFolded} inputRef={composerRef} onQuestion={setQuestion} onSubmit={submit}
                    placeholder="输入问题 · Enter 发送，Shift + Enter 换行"
                    attachments={<>{attachmentError && <p role="alert">{attachmentError}</p>}<FileAttachments native={nativeComposer} sessionId={draftKey} files={files[draftKey] ?? []} remove={id => { nativeComposer.remove(id); setFiles(current => ({ ...current, [draftKey]: (current[draftKey] ?? []).filter(file => file.id !== id) })) }} /><ReferenceAttachments references={references[draftKey] ?? []} onRemove={id => setReferences(current => ({ ...current, [draftKey]: (current[draftKey] ?? []).filter(item => item.id !== id) }))} /></>}
                    onExpand={() => {
                      requestAnimationFrame(() => composerRef.current?.focus())
                    }}
                    onStop={() => { void companion.stop() }}
                    onModel={(provider, model) => { void companion.setModelRoute(provider, model) }}
                    onReasoning={effort => { void companion.setReasoningEffort(effort) }}
                  />
                )}
            </>
          )}
        </section>

      </div>
      </aside>
      </OverlayPortal>

      {!floating && <OverlayPortal><div className={css.fullscreenNotice} role="status">学习栏已打开。退出文件全屏查看，或 <button type="button" onClick={() => bus.setPresentation('floating')}>悬浮查看</button></div></OverlayPortal>}

      <TopicSettingsDialog open={topicSettingsOpen} topic={active?.topic}
        archiving={snapshot.archiving} deleting={snapshot.deleting}
        error={snapshot.error === null ? null : friendlyFailure(snapshot.error)}
        onClose={() => setTopicSettingsOpen(false)} onArchive={companion.archive}
        onDelete={() => {
          if (active === null) return
          setTopicSettingsOpen(false)
          setDeleteTarget({ sessionId: active.topic.sessionId, title: active.topic.title })
          setDeleteConfirmation('')
          setDeleteError(null)
        }}
      />

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

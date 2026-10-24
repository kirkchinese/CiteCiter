import { ToolRow } from './ToolMessage.tsx'
import { ContextRow } from './ContextRow.tsx'
import { TopicUsage } from './TopicUsage.tsx'
import { useCompactNavigation } from '../compact-navigation.ts'
import { useTranscriptPosition } from '../transcript-position.ts'
import { TopicHeader } from './TopicHeader.tsx'
import { UserMessageBody } from './UserMessageBody.tsx'
import type { NativeComposer, DeliveryMode } from '../native-composer.ts'
import { EMPTY_DRAFT_VIEW, type DraftController, type DraftSnapshot } from '../draft-controller.ts'
import { MessageAttachments } from './MessageAttachments.tsx'
import { FileAttachments } from './FileAttachments.tsx'
import { FileDropHint } from './FileDropHint.tsx'
import { useFileDrop } from '../file-drop.ts'
import { NativeQueue } from './NativeQueue.tsx'
import { NativeInteraction } from './NativeInteraction.tsx'
import type { InteractionSnapshot } from '../host-ui-adapter.ts'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store'
import type { UseSessions } from '@deepseek-ai/dsh-client-ui-session/client'
import type { CiteOverlaySnapshot } from '../types.ts'
import type { SelectionSurfaces } from '../wheel-gesture.ts'
import type { FileOpener } from '../native-file-link.ts'
import { MODEL_SELECTION_REQUIRED } from '../../model-admission.ts'
import type { CompanionSnapshot } from '../companion-controller.ts'
import type { CompanionActions, OverlayActions } from '../view-actions.ts'
import {
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Button,
  Modal,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { CompanionPhase } from '../companion-controller.ts'
import type { PendingQuestion, TopicMessage } from '../../topic.ts'
import { parseNextQuestions } from '../prompt.ts'
import { isTopicMessageVisible } from '../topic-presentation.ts'
import mascotUrl from '../assets/citeciter-mascot.png'
import { CiterPet } from './CiterPet.tsx'
import { TopicQuestions } from './TopicQuestions.tsx'
import { OverlayPortal } from './OverlayPortal.tsx'
import { RichAnswer } from './RichAnswer.tsx'
import { ReasoningDisclosure } from './ReasoningDisclosure.tsx'
import css from './CiteCiter.module.css'
import { usePanelDrag } from '../panel-drag.ts'
import { findContainingFrame, useHostDock } from '../host-dock.ts'
import { projectLearningCards } from '../../learning.ts'
import { serializeDraftReferences } from '../draft-references.ts'
import { withLearningRoute } from '../learning-route.ts'
import { ReferenceAttachments } from './ReferenceAttachments.tsx'
import { LearningRoute } from './LearningRoute.tsx'
import { LearningCards } from './LearningCards.tsx'
import { TopicComposer } from './TopicComposer.tsx'
import { TopicNavigation } from './TopicNavigation.tsx'
import { TopicTitle } from './TopicTitle.tsx'
import learningCss from './LearningWorkspace.module.css'

const EMPTY_QUESTIONS: readonly PendingQuestion[] = []
const NO_CHILD_CALLS: ReadonlyArray<Extract<TopicMessage, { role: 'tool' }>> = []

/** Header status appears only while something is happening or needs attention. */
const PHASE_LABEL: Record<CompanionPhase, string | null> = {
  idle: null,
  creating: '正在准备…',
  ready: null,
  running: '正在回答…',
  stopping: '正在停止…',
  stopped: '已停止',
  error: '出错了',
}

function compactPreview(text: string, limit = 120): string {
  const compact = text.replaceAll(/\s+/g, ' ').trim()
  return compact.length > limit ? compact.slice(0, limit) + '…' : compact
}

function friendlyFailure(text: string): string {
  if (text.includes('Citation source has no model route')) {
    return '当前主会话还没有可复用的模型。请先在主对话发送一条消息，再创建 Topic。'
  }
  return text.replaceAll(/https?:\/\/[^\s)]+/gu, '模型服务地址')
}

function ErrorTurn({ message }: { readonly message: Extract<TopicMessage, { role: 'error' }> }) {
  const summary = friendlyFailure(message.text)
  const stopped = message.status === 'stopped'
  return (
    <article
      className={css.errorTurn}
      data-citeciter-message={message.id}
      data-status={message.status}
      role={stopped ? undefined : 'alert'}
    >
      <p><strong>{stopped ? '已停止' : '请求失败'}</strong>{stopped ? '' : `：${summary}`}</p>
      {message.bodyRetained && <p className={css.errorNote}>已生成的内容保留在上方。</p>}
      {!stopped && summary !== message.text && <details><summary>技术详情</summary><pre>{message.text}</pre></details>}
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
  readonly drafts: Omit<DraftController, 'getSnapshot' | 'subscribe' | 'dispose'>
  readonly useDrafts: SnapshotSelectorHook<DraftSnapshot>
  readonly nativeComposer: NativeComposer
  readonly useCompanion: SnapshotSelectorHook<CompanionSnapshot>
  readonly useOverlay: SnapshotSelectorHook<CiteOverlaySnapshot>
  readonly useInteractions: SnapshotSelectorHook<InteractionSnapshot>
  readonly useSubmission: SnapshotSelectorHook<DeliveryMode>
  readonly bus: OverlayActions
  readonly companion: CompanionActions
  readonly closePanel: () => void
  readonly openReader: () => void
  readonly reportParseError: (messageId: string) => void
  /** Host standard prop: the session list, used to show source titles on reference chips. */
  readonly useSessions?: UseSessions
  /** Makes text selected in the transcript a Citer action source that continues this Topic. */
  readonly registerSurface?: SelectionSurfaces['register']
  /** Opens a source-workspace file in DSH's right sidebar. */
  readonly openFile?: FileOpener
  /**
   * `tab` renders inside a DSH right-sidebar tab, which owns placement, size, splitting,
   * floating and closing; `overlay` is Citer's own dock for hosts without that sidebar.
   */
  readonly host?: 'overlay' | 'tab'
  /** In a sidebar tab: whether the tab is on screen. */
  readonly tabVisible?: boolean
}

/** Text selected inside the transcript element, or null. */
function transcriptSelection(transcript: HTMLElement): string | null {
  const selection = window.getSelection()
  if (selection === null || selection.isCollapsed || selection.rangeCount === 0) return null
  if (!transcript.contains(selection.getRangeAt(0).commonAncestorContainer)) return null
  const text = selection.toString().trim()
  return text === '' ? null : text.slice(0, 32_000)
}

/**
 * Render the independent Topic workspace on the right edge of the shell.
 * @param props - shared panel bus, Topic controller, and host callbacks.
 * @returns the responsive Topic dock and its dialogs, or null while closed.
 */
export function CitePanel({ nativeComposer, drafts, useDrafts, useCompanion, useOverlay, useInteractions, useSubmission, useSessions, bus, companion, closePanel, openReader, reportParseError, registerSurface, openFile, host = 'overlay', tabVisible = true }: CitePanelProps) {
  const overlay = useOverlay(value => value)
  const snapshot = useCompanion(value => value)
  const sessionRows = useSessions?.(value => value.byId)
  const sourceTitle = (sessionId: string): string | undefined => sessionRows?.[sessionId as SessionId]?.displayTitle
  const pendingInteraction = useInteractions(value => snapshot.active === null ? undefined : value.get(snapshot.active.topic.sessionId as SessionId))
  const draftKey = snapshot.active?.topic.sessionId ?? snapshot.sourceSessionId ?? 'new'
  const draft = useDrafts(value => value[draftKey] ?? EMPTY_DRAFT_VIEW)
  const question = draft.content.text
  const runDraft = (operation: Promise<unknown>) => { void operation.catch(error => setAttachmentError(String(error))) }
  const setQuestion = (value: string | ((current: string) => string)) => runDraft(drafts.setText(draftKey, typeof value === 'string' ? value : value(question)))
  const defaultDelivery = useSubmission(value => value)
  const [deliveryOverride, setDeliveryOverride] = useState<{ key: string, base: DeliveryMode, mode: DeliveryMode } | null>(null)
  const delivery = deliveryOverride !== null && deliveryOverride.key === draftKey && deliveryOverride.base === defaultDelivery ? deliveryOverride.mode : defaultDelivery
  const setDelivery = (mode: DeliveryMode) => setDeliveryOverride({ key: draftKey, base: defaultDelivery, mode })
  const [attachmentError, setAttachmentError] = useState<string | null>(null)
  const consumedSeeds = useRef(new Set<string>())
  const [views, setViews] = useState<Record<string, 'explain' | 'cards'>>({})
  const cards = useMemo(() => projectLearningCards(snapshot.active?.messages ?? []), [snapshot.active?.messages])
  // The card tab exists only once a Topic has cards.
  const view = cards.cards.length === 0 ? 'explain' : views[draftKey] ?? 'explain'
  const setView = (next: 'explain' | 'cards') => setViews(current => ({ ...current, [draftKey]: next }))
  const [renameRequest, setRenameRequest] = useState(0)
  // Like DSH's chat, ordinary context stays out of the transcript unless the reader asks for it.
  const [allContext, setAllContext] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ readonly sessionId: string, readonly title: string } | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [widthPercent, setWidthPercent] = useState(snapshot.settings.panelWidthPercent)
  const dockWidthPercent = widthPercent
  const resizeOrigin = useRef<{ x: number, width: number, frameWidth: number } | null>(null)
  const panelRef = useRef<HTMLElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const transcript = useTranscriptPosition(draftKey, snapshot.active?.messages)
  const [transcriptNode, setTranscriptNode] = useState<HTMLDivElement | null>(null)
  const transcriptRef = useCallback((node: HTMLDivElement | null) => { transcript.ref(node); setTranscriptNode(node) }, [transcript.ref])
  const modalReturnFocusRef = useRef<HTMLElement | null>(null)
  const inTab = host === 'tab'
  // The overlay steps aside while the sidebar tab hosts the workspace; a tab body is open while mounted.
  const open = inTab ? true : overlay.panelOpen && overlay.host === 'overlay'
  const active = snapshot.active
  const activeTopicId = active?.topic.sessionId
  const activeSourceId = active?.topic.sourceSessionId
  // Topic tools run in the source Session's workspace, so its root resolves their paths.
  const openTopicFile = openFile === undefined || activeSourceId === undefined ? undefined
    : (path: string, line?: number) => openFile(activeSourceId, path, line)
  useEffect(() => {
    if (transcriptNode === null || registerSurface === undefined || activeTopicId === undefined || activeSourceId === undefined) return
    return registerSurface(transcriptNode, () => {
      const text = transcriptSelection(transcriptNode)
      return text === null ? null : { kind: 'topic', sourceSessionId: activeSourceId as SessionId, topicSessionId: activeTopicId, displayText: text }
    })
  }, [transcriptNode, registerSurface, activeTopicId, activeSourceId])
  const addFiles = (batch: readonly File[]) => {
    if (active === null) return
    const key = active.topic.sessionId
    void drafts.addFiles(key, batch).then(() => {
      setAttachmentError(null)
    }).catch(error => setAttachmentError(String(error)))
  }
  const canDropFiles = active !== null && active.topic.modelConfig !== undefined
  const fileDrop = useFileDrop(open, canDropFiles, addFiles)
  const canAsk = active?.topic.modelSelectionRequired !== true && (snapshot.phase === 'ready' || snapshot.phase === 'stopped' || snapshot.phase === 'error' || snapshot.phase === 'running')
  const dock = useHostDock(panelRef, open && !inTab, widthPercent, overlay.presentation === 'floating', overlay.activation)
  const compact = !inTab && dock?.mode === 'page'
  const suspended = !inTab && dock?.mode === 'suspended'
  const floating = !inTab && overlay.presentation === 'floating' && !compact && !suspended
  useCompactNavigation(panelRef, open && compact)
  const drag = usePanelDrag(panelRef, floating, bus.setPresentation)
  const floatPosition = drag.position
  const docked = !floating && dock?.mode === 'columns'
  const composerVisible = inTab ? tabVisible : open && (floating || docked || compact)
  const composerFolded = false

  useEffect(() => open && (!inTab || tabVisible) ? companion.retainVisible() : undefined, [companion, open, inTab, tabVisible])
  useEffect(() => { if (active !== null) void drafts.ensure(active.topic.sessionId).catch(() => { /* Draft controller exposes the load error. */ }) }, [drafts, active?.topic.sessionId])

  useEffect(() => setWidthPercent(snapshot.settings.panelWidthPercent), [snapshot.settings.panelWidthPercent])
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
    if (!composerVisible || !draft.ready || citation === null || active?.topic.sessionId !== citation.topicSessionId) return
    let cancelled = false
    const focusOrigin = document.activeElement
    void drafts.append(citation.topicSessionId, '', [{ id: `board-${citation.id}`, kind: 'board', label: '板书引用', content: citation.prompt }]).then(() => {
      setViews(current => ({ ...current, [citation.topicSessionId]: 'explain' }))
      bus.clearBoardCitation(citation.id)
      if (!cancelled && document.activeElement === focusOrigin) composerRef.current?.focus()
    }).catch(error => setAttachmentError(String(error)))
    return () => { cancelled = true }
  }, [active?.topic.sessionId, bus, overlay.boardCitation, drafts, composerVisible, draft.ready])
  useEffect(() => {
    // A reopened dock first measures its host while its body is hidden. Focus
    // only after that layout is committed, never from an earlier animation frame.
    if (!composerVisible || !draft.ready) return
    let cancelled = false
    const focusOrigin = document.activeElement
    for (const seed of snapshot.composeSeeds) {
      if (active?.topic.sessionId !== seed.sessionId || consumedSeeds.current.has(seed.id)) continue
      consumedSeeds.current.add(seed.id)
      void drafts.append(seed.sessionId, seed.question, seed.references).then(() => {
        companion.consumeComposeSeed(seed.id)
        if (!cancelled && document.activeElement === focusOrigin) composerRef.current?.focus()
      }).catch(error => { consumedSeeds.current.delete(seed.id); setAttachmentError(String(error)) })
    }
    return () => { cancelled = true }
  }, [snapshot.composeSeeds, active?.topic.sessionId, companion, drafts, composerVisible, draft.ready])
  const modalTitle = deleteTarget !== null ? '永久删除 Topic' : null
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

  const visibleMessages = active?.messages.filter(message => isTopicMessageVisible(message, { allContext })) ?? []
  // run_code's programmatic child calls render inside their parent, as in DSH's tool tree.
  const childCalls = new Map<string, Array<Extract<TopicMessage, { role: 'tool' }>>>()
  const toolIds = new Set(visibleMessages.flatMap(message => message.role === 'tool' ? [message.id] : []))
  for (const message of visibleMessages) {
    if (message.role !== 'tool' || message.parentCallId === undefined || !toolIds.has(message.parentCallId)) continue
    childCalls.set(message.parentCallId, [...childCalls.get(message.parentCallId) ?? [], message])
  }
  // The projected turn already retains the failure details and retry context.
  // Keep standalone action errors visible, but announce an identical failure only once.
  const transcriptError = snapshot.error !== null && !visibleMessages.some(message =>
    message.role === 'error' && message.text === snapshot.error) ? snapshot.error : null

  if (!open) return null

  const submit = (event: FormEvent, mode: DeliveryMode = delivery, retry = false) => {
    event.preventDefault()
    if (!canAsk || !draft.ready || draft.sending || snapshot.modelRouteSaving || snapshot.reasoningEffortSaving) return
    const value = question.trim()
    if (!retry && value === '' && draft.content.references.length === 0 && draft.content.files.length === 0) return
    runDraft(drafts.submit(draftKey, (content, files, requestId) => companion.ask(
      withLearningRoute(serializeDraftReferences(content.text, content.references), snapshot.settings.learningRoute ?? false),
      files.map(file => file.id), mode, requestId, draftKey,
    ), retry).then(sent => { if (sent) transcript.followLatest() }))
  }
  const openNewTopic = () => { void companion.createFree('') }
  const requestDelete = () => {
    if (active === null) return
    modalReturnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setDeleteTarget({ sessionId: active.topic.sessionId, title: active.topic.title })
    setDeleteConfirmation('')
    setDeleteError(null)
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
    } else drafts.forget(deleteConfirmation)
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

  const body = (
    <>
    {snapshot.topicsStatus === 'error' && <p className={css.panelError} role="alert">Topic 读取失败：{snapshot.topicsError}</p>}
    {snapshot.notice !== null && <div className={css.panelNotice} role="status">{snapshot.notice}</div>}

    {active === null && snapshot.draftQuote === null ? (
      <div className={css.emptyState}>
        <img className={css.emptyMascot} src={mascotUrl} alt="" aria-hidden="true" />
        <h2>把没懂的地方，慢慢讲明白</h2>
        <p>在主对话里选中文字，用工具条提问；或者新建一个 Topic。</p>
        <Button variant="outline" size="sm" onClick={openNewTopic}>新建 Topic</Button>
        {snapshot.phase === 'creating' && <div className={css.loadingCard}>{PHASE_LABEL.creating}</div>}
        {snapshot.error !== null && <p className={css.panelError} role="alert">{friendlyFailure(snapshot.error)}</p>}
      </div>
    ) : (
      <>
        {(active?.topic.citation != null || snapshot.draftQuote !== null) && <details className={css.contextBar}>
          <summary>引用 · {compactPreview(active?.topic.citation?.displayText ?? snapshot.draftQuote ?? '', 70)}</summary>
          <blockquote>{active?.topic.citation?.displayText ?? snapshot.draftQuote}</blockquote>
        </details>}
        {active !== null && !active.topic.sourceAvailable && <p className={css.panelNotice} role="status">来源对话暂时不可用，Citer 读不到它的内容。</p>}

        <LearningRoute enabled={snapshot.settings.learningRoute ?? false} messages={active?.messages ?? []} />

        {cards.cards.length > 0 && <div className={css.views} role="tablist" aria-label="Topic 内容">
          <button type="button" role="tab" aria-selected={view === 'explain'} onClick={() => setView('explain')}>对话</button>
          <button type="button" role="tab" aria-selected={view === 'cards'} onClick={() => setView('cards')}>学习卡 {cards.cards.length}</button>
        </div>}

        {view === 'explain' && <div ref={transcriptRef} className={css.transcript} aria-live="polite" onScroll={transcript.onScroll}>
          {visibleMessages.map((message) => {
            if (message.role === 'tool') {
              if (message.parentCallId !== undefined && toolIds.has(message.parentCallId)) return null
              return <ToolRow key={message.id} message={message} childCalls={childCalls.get(message.id) ?? NO_CHILD_CALLS} sessionId={active!.topic.sessionId} load={nativeComposer.attachment} openFile={openTopicFile} />
            }
            if (message.role === 'user') return (
              <article key={message.id} className={css.userTurn} data-citeciter-message={message.id} aria-label="用户消息">
                <MessageAttachments sessionId={active!.topic.sessionId} attachments={message.attachments ?? []} load={nativeComposer.attachment} />
                <UserMessageBody text={message.text} questionReply={message.questionReply} sourceTitle={sourceTitle} stageClassName={learningCss.questionDetails} />
              </article>
            )
            if (message.role === 'error') return <ErrorTurn key={message.id} message={message} />
            if (message.role === 'context') return <ContextRow key={message.id} message={message} />
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
          {snapshot.phase === 'creating' && <div className={css.loadingCard}>{PHASE_LABEL.creating}</div>}
          {transcriptError !== null && (
            <p className={css.panelError} data-citeciter-error role="alert">{friendlyFailure(transcriptError)}</p>
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


        {active !== null && <NativeQueue sessionId={active.topic.sessionId} native={nativeComposer} />}
        {pendingInteraction !== undefined && <NativeInteraction key={pendingInteraction.key} pending={pendingInteraction} messages={active?.messages ?? []} />}
        <TopicQuestions sessionId={active?.topic.sessionId ?? ''} native={nativeComposer}
          pending={active?.pendingQuestions ?? (active?.pendingQuestion == null ? EMPTY_QUESTIONS : [active.pendingQuestion])}>
            <TopicComposer permission={active?.topic.permission ?? 'read-only'} onPermission={mode => { void companion.setPermission(mode) }} delivery={delivery} onDelivery={setDelivery}
              onFiles={addFiles} question={question} route={draft.ready ? active?.topic.modelConfig : undefined} providers={snapshot.providers}
              phase={snapshot.phase} canSend={canAsk && draft.ready && !draft.sending && !draft.pending && active !== null && (question.trim() !== '' || draft.content.references.length > 0 || draft.content.files.length > 0)}
              routeSaving={snapshot.modelRouteSaving || snapshot.reasoningEffortSaving}
              folded={composerFolded} inputRef={composerRef} onQuestion={setQuestion} onSubmit={submit}
              onComposition={value => drafts.setComposing(draftKey, value)}
              placeholder="继续提问"
              attachments={<>
                {active?.topic.modelSelectionRequired === true && <p role="status">{MODEL_SELECTION_REQUIRED}</p>}
                {(attachmentError || draft.error) && <p role="alert">{attachmentError || draft.error}</p>}
                {draft.pending && !draft.sending && <p role="status">上次发送状态待核对。<button type="button" onClick={() => runDraft(drafts.reconcile(draftKey))}>核对发送状态</button><button type="button" onClick={event => submit(event, delivery, true)}>重试上次发送</button></p>}
                {!draft.ready && draft.error && <button type="button" onClick={() => runDraft(drafts.ensure(draftKey))}>重新读取草稿</button>}
                {draft.missing.map(file => <button type="button" key={file.id} onClick={() => runDraft(drafts.removeFile(draftKey, file.id))}>移除失效附件：{file.name}</button>)}
                <FileAttachments native={nativeComposer} sessionId={draftKey} files={draft.files} remove={id => runDraft(drafts.removeFile(draftKey, id))} />
                <ReferenceAttachments references={draft.content.references} sourceTitle={sourceTitle} onRemove={id => runDraft(drafts.removeReference(draftKey, id))} />
              </>}
              onExpand={() => {
                requestAnimationFrame(() => composerRef.current?.focus())
              }}
              onStop={() => { void companion.stop() }}
              onModel={(provider, model) => { void companion.setModelRoute(provider, model) }}
              onReasoning={effort => { void companion.setReasoningEffort(effort) }}
            />
        </TopicQuestions>
        {/* Like DSH's footer under its composer: this Topic's own token usage. */}
        {active?.usage !== undefined && <div className={css.usageBar}><TopicUsage usage={active.usage} /></div>}
      </>
    )}
    </>
  )
  const deleteModal = (
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
  )

  const workspace = (
    <section className={css.learningWorkspace}>
      <TopicHeader compact={compact} onBack={closePanel} onClose={inTab ? undefined : closePanel} onDrag={inTab ? undefined : drag.start} status={PHASE_LABEL[snapshot.phase]}
        title={active === null ? <strong>Citer</strong> : <TopicTitle id={active.topic.sessionId} title={active.topic.title} onRename={companion.rename} renameRequest={renameRequest} />}>
        <TopicNavigation topics={snapshot.topics} activeId={active?.topic.sessionId} archived={snapshot.includeArchived}
          onOpen={id => { void companion.openTopic(id) }} onNew={openNewTopic} onArchiveView={companion.setIncludeArchived}
          menu={{
            topic: active === null ? undefined : { archived: active.topic.archived },
            busy: snapshot.archiving || snapshot.deleting,
            learningRoute: snapshot.settings.learningRoute ?? false,
            allContext,
            onAllContext: setAllContext,
            onRename: () => setRenameRequest(value => value + 1),
            onLearningRoute: value => { void companion.setSetting('learningRoute', value) },
            onReader: openReader,
            onArchive: archived => { void companion.archive(archived) },
            onDelete: requestDelete,
          }}
        />
      </TopicHeader>
      {body}
    </section>
  )

  if (inTab) return (
    <>
      <section ref={panelRef} className={css.tabPanel} data-citeciter-panel data-arrangement="tab" aria-label="Citer" {...fileDrop.handlers}>
        {fileDrop.active && <FileDropHint enabled={canDropFiles} title={active?.topic.title} />}
        {workspace}
      </section>
      {deleteModal}
    </>
  )

  return (
    <>
      {suspended && <CiterPet attention={false} onOpen={() => bus.setPanelOpen(true)} />}
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
      {...fileDrop.handlers}
      data-arrangement={floating ? 'floating' : dock?.mode ?? 'unsupported'}
      aria-hidden={suspended || undefined}
      aria-label="Citer"
    >
      {fileDrop.active && <FileDropHint enabled={canDropFiles} title={active?.topic.title} />}
      {docked && !floating && (
        <div
          className={css.resizeHandle}
          role="separator"
          aria-label="调整 Citer 宽度"
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
      {!floating && dock === null && <p className={css.layoutNotice} role="status">当前布局暂不支持 Citer 面板。请使用受支持的官方 DSH 版本，关闭全屏详情后重试。</p>}

      <div className={css.dockBody}>
        {workspace}
      </div>
      </aside>
      </OverlayPortal>

      {!floating && <OverlayPortal><div className={css.fullscreenNotice} role="status">Citer 已打开。退出文件全屏查看，或 <button type="button" onClick={() => bus.setPresentation('floating')}>悬浮查看</button></div></OverlayPortal>}

      {deleteModal}
    </>
  )
}

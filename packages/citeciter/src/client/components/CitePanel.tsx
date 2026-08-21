import {
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import type { CompanionFace, CompanionPhase } from '../companion-controller.ts'
import type { CiteBus } from '../types.ts'
import { RichAnswer } from './RichAnswer.tsx'
import css from './CiteCiter.module.css'

const PHASE_LABEL: Record<CompanionPhase, string> = {
  idle: '等待一个选区',
  creating: '正在创建独立 Topic…',
  ready: '可以继续追问',
  running: 'CiteCiter 正在回答…',
  error: '需要处理',
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
}

/** Independent, resizable learning workspace docked beside the active coding conversation. */
export function CitePanel({ bus, companion, closePanel }: CitePanelProps) {
  const overlay = useSyncExternalStore(bus.subscribe, bus.getSnapshot)
  const snapshot = useSyncExternalStore(companion.subscribe, companion.getSnapshot)
  const [question, setQuestion] = useState('')
  const [title, setTitle] = useState('')
  const [widthPercent, setWidthPercent] = useState(snapshot.settings.panelWidthPercent)
  const resizeOrigin = useRef<{ x: number, width: number, frameWidth: number } | null>(null)
  const open = overlay.panelOpen
  const [panelWidth, docked] = useDockColumn(open, widthPercent)
  const active = snapshot.active

  useEffect(() => companion.setVisible(open), [companion, open])
  useEffect(() => setWidthPercent(snapshot.settings.panelWidthPercent), [snapshot.settings.panelWidthPercent])
  useEffect(() => setTitle(active?.topic.title ?? ''), [active?.topic.sessionId, active?.topic.title])

  const selectedProvider = snapshot.providers.find((provider) => provider.id === active?.topic.modelConfig.provider)
  const selectedModel = selectedProvider?.models.find((model) => model.id === active?.topic.modelConfig.model)
  const models = useMemo(() => snapshot.providers.flatMap((provider) => provider.models.map((model) => ({
    provider: provider.id,
    providerName: provider.name,
    model,
  }))), [snapshot.providers])

  if (!open) return null

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const value = question.trim()
    if (value === '') return
    setQuestion('')
    void companion.ask(value)
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

      <nav className={css.topicRail} aria-label="CiteCiter Topics">
        <div className={css.brand}>
          <span className={css.brandMark} aria-hidden="true">🐋</span>
          <div><strong>CiteCiter</strong><span>学习伴侣</span></div>
        </div>
        <div className={css.railCaption}>
          <span>当前来源的讨论</span>
          <button type="button" onClick={() => companion.setIncludeArchived(!snapshot.includeArchived)}>
            {snapshot.includeArchived ? '仅活动' : '查看归档'}
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
          {snapshot.topics.length === 0 && (
            <p className={css.railEmpty}>在中央编程对话中选中文字，右键即可开始。</p>
          )}
        </div>
        <div className={css.railFoot}>
          <span>{snapshot.topics.length} 个 Topic</span>
          <span>{widthPercent}%</span>
        </div>
      </nav>

      <section className={css.learningWorkspace}>
        <header className={css.dockHeader}>
          <div className={css.dockHeading}>
            <span className={css.modeBadge}>{active?.topic.mode === 'exact-fork' ? 'Exact Fork' : 'Observer'}</span>
            <strong>{active?.topic.title ?? '新的学习讨论'}</strong>
            <span>{PHASE_LABEL[snapshot.phase]}</span>
          </div>
          <button className={css.closeButton} type="button" onClick={closePanel} aria-label="关闭 CiteCiter">×</button>
        </header>

        {active === null && snapshot.draftQuote === null ? (
          <div className={css.emptyState}>
            <div className={css.emptyWhale} aria-hidden="true">🐋</div>
            <h2>编程别停，问题放到旁边问</h2>
            <p>选中主对话里一次已完成模型调用的任意文字，右键输入问题。Topic 会在这里独立多轮继续，不进入左侧主会话列表。</p>
            {snapshot.error !== null && <p className={css.panelError}>{snapshot.error}</p>}
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
                  void companion.rename(title)
                }}>
                  <input value={title} onChange={(event) => setTitle(event.currentTarget.value)} aria-label="Topic 标题" />
                  <button type="submit" disabled={title.trim() === '' || title === active.topic.title}>保存标题</button>
                </form>
                <select
                  aria-label="CiteCiter 模型"
                  value={modelValue(active.topic.modelConfig.provider, active.topic.modelConfig.model)}
                  onChange={(event) => {
                    const [provider, model] = parseModelValue(event.currentTarget.value)
                    void companion.selectModel(provider, model, null)
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
                    onChange={(event) => {
                      void companion.selectModel(
                        active.topic.modelConfig.provider,
                        active.topic.modelConfig.model,
                        event.currentTarget.value === '' ? null : event.currentTarget.value,
                      )
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
                  aria-label={active.topic.archived ? '恢复当前 Topic' : '归档当前 Topic'}
                  onClick={() => { void companion.archive(!active.topic.archived) }}
                >
                  {active.topic.archived ? '恢复' : '归档'}
                </button>
              </div>
            )}

            <div className={css.transcript} aria-live="polite">
              {active?.messages.map((message) => (
                <article
                  key={message.id}
                  className={message.role === 'user' ? css.userTurn : message.role === 'assistant' ? css.assistantTurn : css.errorTurn}
                >
                  <div className={css.turnRole}>{message.role === 'user' ? '你' : message.role === 'assistant' ? 'CiteCiter' : '错误'}</div>
                  {message.role === 'assistant'
                    ? (
                        <>
                          {message.reasoning !== null && (
                            <details className={css.reasoning}>
                              <summary>思考过程</summary>
                              <p>{message.reasoning}</p>
                            </details>
                          )}
                          <RichAnswer text={message.text} streaming={message.streaming} />
                        </>
                      )
                    : <p>{message.text}</p>}
                </article>
              ))}
              {snapshot.phase === 'creating' && <div className={css.loadingCard}>正在建立只读上下文与独立 Topic…</div>}
              {snapshot.error !== null && <p className={css.panelError} data-citeciter-error>{snapshot.error}</p>}
            </div>

            <form className={css.composer} onSubmit={submit}>
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
                {snapshot.phase === 'running' && <button type="button" onClick={() => { void companion.stop() }}>停止</button>}
                <button className={css.sendButton} type="submit" disabled={active === null || question.trim() === ''}>发送</button>
              </div>
            </form>
          </>
        )}
      </section>
    </aside>
  )
}

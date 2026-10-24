import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { beatAt, compileTimeline, sampleTimeline } from '../../board-animation.ts'
import { frameStyle, useTimelinePlayer } from '../board-timeline.ts'
import { IconPauseOutlineRegular, IconPlayOutlineRegular, MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import {
  EMPTY_BOARD_SNAPSHOT,
  type BoardElementKind,
  type BoardElementState,
  type BoardSnapshot,
  type BoardStyle,
} from '../../board.ts'
import { isSafeSvg, isolatedHtmlDocument, neutralizeMarkdownImages } from '../rich-content.ts'
import css from './BoardView.module.css'
import { markdownLabels } from '../copy.ts'
import { t, useLocale } from '../i18n.ts'

function inlineStyle(style: BoardStyle): CSSProperties {
  return {
    ...(style.color === undefined ? {} : { color: style.color }),
    ...(style.fontSize === undefined ? {} : { fontSize: style.fontSize }),
  }
}

function MathElement({ content }: { readonly content: string }) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (ref.current === null) return
    try {
      katex.render(content, ref.current, { throwOnError: false, displayMode: false })
    } catch {
      ref.current.textContent = content
    }
  }, [content])
  return <div ref={ref} className={css.math} />
}

function ElementBody({ kind, content }: { readonly kind: BoardElementKind, readonly content: string }) {
  useLocale()
  if (kind === 'math') return <MathElement content={content} />
  if (kind === 'markdown' || kind === 'table') {
    return <MarkdownText text={neutralizeMarkdownImages(content)} streaming={false} labels={markdownLabels} />
  }
  if (kind === 'svg') {
    if (!isSafeSvg(content)) return <pre className={css.fallback}>{content}</pre>
    return (
      <img
        className={css.svg}
        src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(content.trim())}`}
        alt={t('board.svg.alt')}
      />
    )
  }
  if (kind === 'html') {
    return (
      <iframe
        className={css.html}
        title={t('board.html.title')}
        sandbox=""
        referrerPolicy="no-referrer"
        srcDoc={isolatedHtmlDocument(content)}
      />
    )
  }
  if (kind === 'image') {
    if (!/^data:image\/(?:png|jpeg|webp|gif|svg\+xml);base64,/u.test(content)) {
      return <pre className={css.fallback}>{t('board.image.invalid')}</pre>
    }
    return <img className={css.image} src={content} alt={t('board.image.alt')} />
  }
  return <div className={css.text}>{content}</div>
}

function animationClass(name: 'fade-in' | 'slide-in' | 'pulse' | 'highlight'): string | undefined {
  if (name === 'fade-in') return css.animFadeIn
  if (name === 'slide-in') return css.animSlideIn
  if (name === 'pulse') return css.animPulse
  return css.animHighlight
}

/**
 * Render one final-state blackboard projection in either learning surface.
 * @param props - snapshot, motion preference, optional compact reading mode and citation action.
 * @returns the safe blackboard canvas.
 */
export function BoardView({
  snapshot,
  animations,
  onQuoteElement,
  compact = false,
  sessionId,
  frameAtMs,
  capture = false,
}: {
  readonly snapshot: BoardSnapshot | undefined
  readonly animations: boolean
  readonly onQuoteElement?: (element: BoardElementState) => void
  readonly compact?: boolean
  readonly sessionId?: string
  /** Freeze the board's timeline at this time, for frame capture. */
  readonly frameAtMs?: number
  /** Render only the logical canvas inside an offscreen capture surface. */
  readonly capture?: boolean
}) {
  useLocale()
  const board = snapshot ?? EMPTY_BOARD_SNAPSHOT
  const [notes, setNotes] = useState(compact)
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const [canvasScale, setCanvasScale] = useState(1)
  useEffect(() => setNotes(compact), [compact])
  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null || notes) return
    const update = () => setCanvasScale(canvas.clientWidth / 1000)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [notes])
  const elements = notes ? [...board.elements].sort((a, b) => a.y - b.y || a.x - b.x) : board.elements
  const timeline = board.timeline ?? null
  const compiled = useMemo(() => {
    if (timeline === null) return null
    try { return compileTimeline(timeline.spec, board.elements) }
    catch { return null } // A timeline whose targets were later removed or changed simply stops playing.
  }, [timeline, board.elements])
  const player = useTimelinePlayer(compiled, timeline?.id ?? null, { autoplay: animations, frozenAt: frameAtMs })
  const frames = compiled === null || notes ? null : sampleTimeline(compiled, player.t)
  const caption = compiled === null || notes ? null : beatAt(compiled, player.t)
  return (
    <section className={css.board} data-citeciter-board={sessionId ?? ''} data-board-revision={board.revision} data-compact={compact || undefined} data-notes={notes || undefined} data-capture={capture || undefined} data-animations={player.canPlay || undefined} aria-label={t('board.label')}>
      <header className={css.boardHeader}>
        <div><strong>{t('board.title')}</strong><span>{t('board.subtitle')}</span></div>
        <span>{board.revision === 0 && board.elements.length === 0 ? t('board.waiting') : t('board.revision', { count: board.revision })}</span>
        {compact && <button className={css.viewToggle} type="button" onClick={() => setNotes(!notes)}>{notes ? t('board.view.canvas') : t('board.view.notes')}</button>}
      </header>
      {board.invalid > 0 && <p className={css.boardWarning} role="status">{t('board.warning.invalid', { count: board.invalid })}</p>}
      <div ref={canvasRef} className={css.canvasViewport} data-board-canvas="">
        <div className={css.canvas} style={notes ? undefined : { transform: `scale(${canvasScale})` }}>
          {board.elements.length === 0 ? (
            <p className={css.boardHint}>{t('board.empty')}</p>
          ) : elements.map((element) => (
            <div
              key={`${element.id}:${element.animation?.run ?? 0}`}
              className={css.elementWrap}
              data-board-element={element.id}
              data-kind={element.kind}
              data-focused={element.focused || undefined}
              style={{
                left: `${element.x}%`,
                top: `${element.y}%`,
                width: `${element.w}%`,
                height: `${element.h}%`,
                ...(frames?.has(element.id) === true ? frameStyle(frames.get(element.id)!, element) : {}),
              }}
            >
              <div
                className={[
                  css.elementInner,
                  element.animation === undefined || !player.canPlay ? undefined : animationClass(element.animation.name),
                ].filter((entry): entry is string => entry !== undefined).join(' ')}
                style={{
                  ...inlineStyle(element.style),
                  ...(element.animation === undefined || !player.canPlay ? {} : {
                    animationDuration: `${element.animation.durationMs}ms`,
                    animationIterationCount: String(element.animation.iterations),
                  }),
                }}
              >
                <ElementBody kind={element.kind} content={element.content} />
              </div>
              {onQuoteElement !== undefined && (
                <button
                  className={css.quoteButton}
                  type="button"
                  onClick={() => onQuoteElement(element)}
                  aria-label={t('board.quote.label', { id: element.id })}
                >
                  {t('board.quote.action')}
                </button>
              )}
            </div>
          ))}
          {caption !== null && <p className={css.caption} aria-live="polite">{caption}</p>}
        </div>
      </div>
      {compiled !== null && !notes && frameAtMs === undefined && (
        <div className={css.player} role="group" aria-label={t('board.animation.label')} data-capture-exclude="">
          {player.canPlay && <button type="button" className={css.playButton} onClick={player.toggle} aria-label={t(player.playing ? 'board.animation.pause' : player.t >= compiled.durationMs ? 'board.animation.replay' : 'board.animation.play')}>{player.playing ? <IconPauseOutlineRegular /> : <IconPlayOutlineRegular />}</button>}
          <input className={css.scrubber} type="range" min={0} max={compiled.durationMs} step={10} value={Math.round(player.t)} aria-label={t('board.animation.progress')}
            onChange={event => player.seek(Number(event.currentTarget.value))} />
          <span className={css.time}>{(player.t / 1000).toFixed(1)} / {(compiled.durationMs / 1000).toFixed(1)} s</span>
          {compiled.beats.length > 0 && (
            <div className={css.beats}>
              {compiled.beats.map((beat, index) => (
                <button key={`${beat.atMs}:${index}`} type="button" className={css.beat} title={beat.caption} aria-label={t('board.animation.step', { count: index + 1, caption: beat.caption })}
                  data-active={caption === beat.caption && player.t >= beat.atMs && (compiled.beats[index + 1]?.atMs ?? Number.POSITIVE_INFINITY) > player.t ? true : undefined}
                  onClick={() => player.seek(beat.atMs)}>{index + 1}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { beatAt, compileTimeline, sampleTimeline } from '../../board-animation.ts'
import { frameStyle, useTimelinePlayer } from '../board-timeline.ts'
import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
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
        alt="Citer 黑板图形"
      />
    )
  }
  if (kind === 'html') {
    return (
      <iframe
        className={css.html}
        title="Citer 黑板动画"
        sandbox=""
        referrerPolicy="no-referrer"
        srcDoc={isolatedHtmlDocument(content)}
      />
    )
  }
  if (kind === 'image') {
    if (!/^data:image\/(?:png|jpeg|webp|gif|svg\+xml);base64,/u.test(content)) {
      return <pre className={css.fallback}>黑板图片内容无效</pre>
    }
    return <img className={css.image} src={content} alt="Citer 黑板图片" />
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
}: {
  readonly snapshot: BoardSnapshot | undefined
  readonly animations: boolean
  readonly onQuoteElement?: (element: BoardElementState) => void
  readonly compact?: boolean
  readonly sessionId?: string
  /** Freeze the board's timeline at this time, for frame capture. */
  readonly frameAtMs?: number
}) {
  const board = snapshot ?? EMPTY_BOARD_SNAPSHOT
  const [notes, setNotes] = useState(compact)
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
    <section className={css.board} data-citeciter-board={sessionId ?? ''} data-board-revision={board.revision} data-compact={compact || undefined} data-notes={notes || undefined} data-animations={animations || undefined} aria-label="Citer 黑板">
      <header className={css.boardHeader}>
        <div><strong>小黑板</strong><span>由 Citer 随讲解实时整理</span></div>
        <span>{board.revision === 0 && board.elements.length === 0 ? '等待板书' : `第 ${board.revision} 次更新`}</span>
        {compact && <button className={css.viewToggle} type="button" onClick={() => setNotes(!notes)}>{notes ? '查看画布' : '条目阅读'}</button>}
      </header>
      {board.invalid > 0 && <p className={css.boardWarning} role="status">已忽略 {board.invalid} 批无效板书提交</p>}
      <div className={css.canvas}>
          {board.elements.length === 0 ? (
            <p className={css.boardHint}>发送需要板书的问题，公式、推导和图示会整理到这里。</p>
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
                  element.animation === undefined || !animations ? undefined : animationClass(element.animation.name),
                ].filter((entry): entry is string => entry !== undefined).join(' ')}
                style={{
                  ...inlineStyle(element.style),
                  ...(element.animation === undefined || !animations ? {} : {
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
                  aria-label={`引用黑板元素 ${element.id} 到提问`}
                >
                  引用到提问
                </button>
              )}
            </div>
          ))}
          {caption !== null && <p className={css.caption} aria-live="polite">{caption}</p>}
      </div>
      {compiled !== null && !notes && frameAtMs === undefined && (
        <div className={css.player} role="group" aria-label="板书动画" data-capture-exclude="">
          <button type="button" className={css.playButton} onClick={player.toggle} aria-label={player.playing ? '暂停动画' : '播放动画'}>{player.playing ? '❚❚' : '▶'}</button>
          <input className={css.scrubber} type="range" min={0} max={compiled.durationMs} step={10} value={Math.round(player.t)} aria-label="动画进度"
            onChange={event => player.seek(Number(event.currentTarget.value))} />
          <span className={css.time}>{(player.t / 1000).toFixed(1)} / {(compiled.durationMs / 1000).toFixed(1)} s</span>
          {compiled.beats.length > 0 && (
            <div className={css.beats}>
              {compiled.beats.map((beat, index) => (
                <button key={`${beat.atMs}:${index}`} type="button" className={css.beat} title={beat.caption} aria-label={`跳到第 ${index + 1} 步：${beat.caption}`}
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

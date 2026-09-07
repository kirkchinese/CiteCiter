import { useEffect, useRef, useState, type CSSProperties } from 'react'
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
        alt="CiteCiter 黑板图形"
      />
    )
  }
  if (kind === 'html') {
    return (
      <iframe
        className={css.html}
        title="CiteCiter 黑板动画"
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
    return <img className={css.image} src={content} alt="CiteCiter 黑板图片" />
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
}: {
  readonly snapshot: BoardSnapshot | undefined
  readonly animations: boolean
  readonly onQuoteElement?: (element: BoardElementState) => void
  readonly compact?: boolean
}) {
  const board = snapshot ?? EMPTY_BOARD_SNAPSHOT
  const [notes, setNotes] = useState(compact)
  const elements = notes ? [...board.elements].sort((a, b) => a.y - b.y || a.x - b.x) : board.elements
  return (
    <section className={css.board} data-citeciter-board data-compact={compact || undefined} data-notes={notes || undefined} data-animations={animations || undefined} aria-label="CiteCiter 黑板">
      <header className={css.boardHeader}>
        <div><strong>小黑板</strong><span>由 CiteCiter 随讲解实时整理</span></div>
        <span>{board.revision === 0 && board.elements.length === 0 ? '等待板书' : `第 ${board.revision} 次更新`}</span>
        {compact && <button className={css.viewToggle} type="button" onClick={() => setNotes(!notes)}>{notes ? '查看画布' : '条目阅读'}</button>}
      </header>
      {board.invalid > 0 && <p className={css.boardWarning} role="status">已忽略 {board.invalid} 批无效板书提交</p>}
      <div className={css.canvas}>
          {board.elements.length === 0 ? (
            <p className={css.boardHint}>选择“定量”并发送，公式、推导和图示会整理到这里。你也可以直接要求画图。</p>
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
      </div>
    </section>
  )
}

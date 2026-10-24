import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import type { DocumentFormat } from '../../topic.ts'
import { lineAtOffset } from '../../document-pages.ts'
import { literalSelection, markdownBlocks, pieceAt, textLines } from '../document-layout.ts'
import type { ActionSource } from '../action-controller.ts'
import type { SelectionSurfaces } from '../wheel-gesture.ts'
import { markdownLabels } from '../copy.ts'
import { t, useLocale } from '../i18n.ts'
import css from './DocumentView.module.css'

/** What a reader selection contributes to an action source. */
export interface DocumentSelection {
  readonly displayText: string
  readonly prefixText: string
  readonly suffixText: string
  readonly line: number
  /** Source range of the rendered Markdown blocks holding the selection; absent for literal text. */
  readonly sourceRange?: { readonly start: number, readonly end: number }
}

export interface DocumentViewProps {
  readonly format: DocumentFormat
  readonly content: string
  /** Scroll to the piece holding `offset` whenever `revision` changes. */
  readonly focus?: { readonly offset: number, readonly revision: number } | undefined
  readonly wrap?: boolean | undefined
  /** A short line under the meta row, such as how a workspace file is kept. */
  readonly note?: ReactNode
  readonly registerSurface: SelectionSurfaces['register']
  /** Turn a selection into the toolbar's action source, or null to ignore it. */
  readonly toSource: (selection: DocumentSelection) => ActionSource | null
  /** Receives the scrolling element, for hosts that restore scroll positions. */
  readonly scrollRef?: ((element: HTMLElement | null) => void) | undefined
}

/** Pieces rendered at first and added each time the reader nears the end. */
const LINE_BATCH = 800
const BLOCK_BATCH = 60
/** How long a jumped-to passage stays highlighted. */
const FLASH_MS = 1600

/** A text node walk position: `node` and `offset` as a Range boundary. */
function textBefore(root: Node, node: Node, offset: number): string {
  const range = document.createRange()
  range.selectNodeContents(root)
  range.setEnd(node, offset)
  return range.toString()
}

function textAfter(root: Node, node: Node, offset: number): string {
  const range = document.createRange()
  range.selectNodeContents(root)
  range.setStart(node, offset)
  return range.toString()
}

/** The rendered Markdown block holding a Range boundary. */
function blockAt(blocks: HTMLElement, node: Node, offset: number, edge: 'start' | 'end'): HTMLElement | null {
  if (node === blocks) {
    const children = blocks.querySelectorAll<HTMLElement>(':scope > [data-source-start]')
    const index = Math.min(Math.max(edge === 'start' ? offset : offset - 1, 0), children.length - 1)
    return children[index] ?? null
  }
  const element = node instanceof Element ? node : node.parentElement
  return element?.closest<HTMLElement>('[data-source-start]') ?? null
}

/**
 * Read a document: Markdown is typeset with DSH's Markdown renderer, text and code show line
 * numbers. Long documents render progressively as the reader scrolls. Selecting text offers
 * Citer's toolbar; the selection is mapped back to the exact source, so citations name the
 * passage and its line.
 */
export function DocumentView({ format, content, focus, wrap = true, note, registerSurface, toSource, scrollRef }: DocumentViewProps) {
  useLocale()
  const pieces = useMemo(() => format === 'markdown' ? markdownBlocks(content) : textLines(content), [format, content])
  const batch = format === 'markdown' ? BLOCK_BATCH : LINE_BATCH
  const [limit, setLimit] = useState(batch)
  const [flash, setFlash] = useState<number | null>(null)
  const scroller = useRef<HTMLDivElement | null>(null)
  const body = useRef<HTMLDivElement | null>(null)
  const sentinel = useRef<HTMLDivElement | null>(null)
  const pendingFocus = useRef<number | null>(null)
  const lineCount = useMemo(() => format === 'markdown' ? lineAtOffset(content, content.length) : pieces.length, [format, content, pieces])
  const shown = Math.min(limit, pieces.length)

  useEffect(() => { setLimit(batch) }, [content, batch])

  // Render more as the end comes into view.
  useEffect(() => {
    const element = sentinel.current
    if (element === null || shown >= pieces.length) return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) setLimit(current => current + batch)
    }, { root: scroller.current, rootMargin: '600px 0px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [shown, pieces.length, batch])

  // Jump to a cited passage: render up to it, then scroll it into view and highlight it.
  const shownRef = useRef(shown)
  shownRef.current = shown
  const reveal = (index: number) => {
    body.current?.querySelector<HTMLElement>(`[data-piece="${index}"]`)?.scrollIntoView({ block: 'center' })
    setFlash(index)
  }
  useEffect(() => {
    if (focus === undefined || pieces.length === 0) return
    const index = pieceAt(pieces, focus.offset)
    if (index < shownRef.current) { reveal(index); return }
    pendingFocus.current = index
    setLimit(current => Math.max(current, index + batch))
  }, [focus?.offset, focus?.revision, pieces, batch])
  useLayoutEffect(() => {
    const index = pendingFocus.current
    if (index === null || index >= shown) return
    pendingFocus.current = null
    reveal(index)
  }, [shown])
  useEffect(() => {
    if (flash === null) return
    const timer = setTimeout(() => setFlash(null), FLASH_MS)
    return () => clearTimeout(timer)
  }, [flash])

  const read = (): ActionSource | null => {
    const root = body.current
    const selection = window.getSelection()
    if (root === null || selection === null || selection.isCollapsed || selection.rangeCount === 0) return null
    const range = selection.getRangeAt(0)
    if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null
    if (format === 'text') {
      // The line column's text is exactly the document's text up to the rendered end.
      const start = textBefore(root, range.startContainer, range.startOffset).length
      const end = textBefore(root, range.endContainer, range.endOffset).length
      const literal = literalSelection(content, start, end)
      if (literal === null) return null
      return toSource({ displayText: literal.displayText, prefixText: literal.prefixText, suffixText: literal.suffixText, line: lineAtOffset(content, literal.start) })
    }
    const first = blockAt(root, range.startContainer, range.startOffset, 'start')
    const last = blockAt(root, range.endContainer, range.endOffset, 'end')
    const displayText = range.toString().trim()
    if (first === null || last === null || displayText === '') return null
    const sourceRange = { start: Number(first.dataset.sourceStart), end: Number(last.dataset.sourceEnd) }
    if (!(sourceRange.start < sourceRange.end)) return null
    // The quote's first words, found in its blocks' source, give its line; else the block's.
    const lead = displayText.split('\n')[0]!.trim().slice(0, 40)
    const at = lead === '' ? -1 : content.indexOf(lead, sourceRange.start)
    const line = at >= 0 && at < sourceRange.end ? lineAtOffset(content, at) : Number(first.dataset.line)
    return toSource({
      displayText,
      prefixText: textBefore(first, range.startContainer, range.startOffset).slice(-240),
      suffixText: textAfter(last, range.endContainer, range.endOffset).slice(0, 240),
      line,
      sourceRange,
    })
  }
  const readRef = useRef(read)
  readRef.current = read
  useEffect(() => {
    const element = body.current
    if (element === null) return
    return registerSurface(element, () => readRef.current())
  }, [registerSurface])

  const rendered = pieces.slice(0, shown)
  return <div ref={(element) => { scroller.current = element; scrollRef?.(element) }} className={css.scroller}>
    <div className={css.meta}>
      <span>{format === 'markdown' ? 'Markdown' : t('settings.reader.text')}</span>
      <span aria-hidden="true">·</span>
      <span>{t('settings.reader.lines', { count: lineCount })}</span>
      <span aria-hidden="true">·</span>
      <span>{t('settings.reader.hint')}</span>
    </div>
    {note !== undefined && <p className={css.note}>{note}</p>}
    {format === 'markdown'
      ? <div ref={body} className={css.markdown} data-citeciter-document>
          {rendered.map((piece, index) => <div key={piece.start} className={css.block} data-piece={index} data-source-start={piece.start} data-source-end={piece.end} data-line={piece.line} data-flash={flash === index || undefined}>
            <MarkdownText text={content.slice(piece.start, piece.end)} streaming={false} labels={markdownLabels} />
          </div>)}
        </div>
      : <div ref={body} className={css.lines} data-wrap={wrap || undefined} data-citeciter-document style={{ '--citeciter-gutter': `${String(lineCount).length + 1}ch` } as CSSProperties}>
          {/* Each line keeps its line break as hidden text, so the column's text is the source itself. */}
          {rendered.map((piece, index) => <div key={piece.start} className={css.line} data-piece={index} data-line={piece.line} data-flash={flash === index || undefined}>
            {content.slice(piece.start, piece.end)}
            {index + 1 < pieces.length && <span className={css.eol}>{content.slice(piece.end, pieces[index + 1]!.start)}</span>}
          </div>)}
        </div>}
    {shown < pieces.length && <div ref={sentinel} className={css.more} aria-hidden="true" />}
  </div>
}

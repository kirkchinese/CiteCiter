/**
 * How the document reader cuts a document into renderable pieces. Pure functions, so the
 * reader can render progressively and still know exactly which source text each piece holds.
 */

/** One rendered piece: a Markdown block or a text line, with its source range and first line. */
export interface DocumentPiece {
  /** UTF-16 offset of the first character. */
  readonly start: number
  /** UTF-16 offset after the last character, excluding the separating line break. */
  readonly end: number
  /** One-based line of `start`. */
  readonly line: number
}

interface SourceLine {
  readonly start: number
  readonly end: number
  readonly text: string
}

function sourceLines(content: string): SourceLine[] {
  const lines: SourceLine[] = []
  let start = 0
  while (start <= content.length) {
    const newline = content.indexOf('\n', start)
    const end = newline < 0 ? content.length : newline
    lines.push({ start, end, text: content.slice(start, end).replace(/\r$/u, '') })
    if (newline < 0) break
    start = newline + 1
  }
  return lines
}

/** Each line of a text document, for the line-numbered view. */
export function textLines(content: string): DocumentPiece[] {
  return sourceLines(content).map((line, index) => ({ start: line.start, end: line.end, line: index + 1 }))
}

const FENCE = /^ {0,3}(`{3,}|~{3,})/u

/**
 * Top-level Markdown blocks: runs of lines separated by blank lines. A fenced code block or a
 * `$$` math block stays whole across blank lines, and an indented line after a blank line
 * continues the block before it, so list items with several paragraphs stay together.
 */
export function markdownBlocks(content: string): DocumentPiece[] {
  const lines = sourceLines(content)
  const blocks: DocumentPiece[] = []
  let first = -1
  let last = -1
  let fence: { readonly marker: string, readonly length: number } | null = null
  let math = false
  const close = () => {
    if (first >= 0) blocks.push({ start: lines[first]!.start, end: lines[last]!.end, line: first + 1 })
    first = -1
    last = -1
  }
  lines.forEach((line, index) => {
    const blank = line.text.trim() === ''
    if (fence === null && !math) {
      if (blank) return
      // A blank line ends a block unless the next text is indented, which continues it.
      if (first >= 0 && last < index - 1 && !/^[ \t]/u.test(line.text)) close()
      if (first < 0) first = index
      last = index
      const opened = FENCE.exec(line.text)
      if (opened !== null) fence = { marker: opened[1]![0]!, length: opened[1]!.length }
      else if (line.text.trim() === '$$') math = true
      return
    }
    last = index
    if (fence !== null) {
      const closed = /^ {0,3}(`{3,}|~{3,})\s*$/u.exec(line.text)
      if (closed !== null && closed[1]![0] === fence.marker && closed[1]!.length >= fence.length) fence = null
    } else if (line.text.trim() === '$$') math = false
  })
  close()
  return blocks
}

/** @returns the index of the piece holding `offset`, or of the last piece starting before it. */
export function pieceAt(pieces: readonly DocumentPiece[], offset: number): number {
  let low = 0
  let high = pieces.length - 1
  let found = 0
  while (low <= high) {
    const middle = (low + high) >> 1
    if (pieces[middle]!.start <= offset) { found = middle; low = middle + 1 }
    else high = middle - 1
  }
  return found
}

/**
 * A literal selection trimmed of surrounding whitespace, with its context.
 * @param content - the document text.
 * @param start - selection start offset.
 * @param end - selection end offset.
 * @returns the trimmed range and quote, or null when only whitespace was selected.
 */
export function literalSelection(content: string, start: number, end: number): { readonly start: number, readonly end: number, readonly displayText: string, readonly prefixText: string, readonly suffixText: string } | null {
  const raw = content.slice(start, end)
  const text = raw.trim()
  if (text === '') return null
  const from = start + raw.length - raw.trimStart().length
  const to = from + text.length
  return { start: from, end: to, displayText: text, prefixText: content.slice(Math.max(0, from - 240), from), suffixText: content.slice(to, to + 240) }
}

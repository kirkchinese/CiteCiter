import type { Nodes } from 'mdast'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import { gfm } from 'micromark-extension-gfm'
import { decodeString } from 'micromark-util-decode-string'

const MARKDOWN_DECODE_TOKEN = /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/giu

interface MappedUnit {
  readonly text: string
  readonly startOffset: number
  readonly endOffset: number
}

interface RawLine {
  readonly text: string
  readonly startOffset: number
  readonly newlineStart: number
  readonly newlineEnd: number
}

type MappedText = readonly MappedUnit[]

/** One raw Markdown range that renders as the requested visible text. */
export interface MarkdownSourceCandidate {
  readonly startOffset: number
  readonly endOffset: number
  readonly sourceText: string
  readonly displayPrefix: string
  readonly displaySuffix: string
}

function children(node: Nodes): readonly Nodes[] {
  return 'children' in node ? node.children : []
}

function offsets(node: Nodes): readonly [number, number] {
  const start = node.position?.start.offset
  const end = node.position?.end.offset
  if (start === undefined || end === undefined) throw new Error('Markdown parser omitted source offsets')
  return [start, end]
}

function directUnits(value: string, startOffset: number): MappedUnit[] {
  const units: MappedUnit[] = []
  let cursor = startOffset
  for (const text of value) {
    units.push({ text, startOffset: cursor, endOffset: cursor + text.length })
    cursor += text.length
  }
  return units
}

function visibleText(units: MappedText): string {
  return units.map((unit) => unit.text).join('')
}

function decodedUnits(markdown: string, value: string, startOffset: number, endOffset: number): MappedUnit[] {
  const source = markdown.slice(startOffset, endOffset)
  const units: MappedUnit[] = []
  let cursor = 0
  for (const match of source.matchAll(MARKDOWN_DECODE_TOKEN)) {
    const index = match.index
    units.push(...directUnits(source.slice(cursor, index), startOffset + cursor))
    const raw = match[0]
    const decoded = decodeString(raw)
    if (decoded === raw) {
      units.push(...directUnits(raw, startOffset + index))
    } else {
      for (const text of decoded) {
        units.push({
          text,
          startOffset: startOffset + index,
          endOffset: startOffset + index + raw.length,
        })
      }
    }
    cursor = index + raw.length
  }
  units.push(...directUnits(source.slice(cursor), startOffset + cursor))
  return visibleText(units) === value ? units : []
}

function literalUnits(source: string, startOffset: number, newline: '\n' | ' '): MappedUnit[] {
  const units: MappedUnit[] = []
  for (let cursor = 0; cursor < source.length;) {
    const text = source[cursor]
    if (text === '\r') {
      const length = source[cursor + 1] === '\n' ? 2 : 1
      units.push({ text: newline, startOffset: startOffset + cursor, endOffset: startOffset + cursor + length })
      cursor += length
      continue
    }
    if (text === '\n') {
      units.push({ text: newline, startOffset: startOffset + cursor, endOffset: startOffset + cursor + 1 })
      cursor++
      continue
    }
    const codePoint = String.fromCodePoint(source.codePointAt(cursor)!)
    units.push({ text: codePoint, startOffset: startOffset + cursor, endOffset: startOffset + cursor + codePoint.length })
    cursor += codePoint.length
  }
  return units
}

function inlineCodeUnits(node: Extract<Nodes, { type: 'inlineCode' }>, markdown: string): MappedUnit[] {
  const [start, end] = offsets(node)
  const source = markdown.slice(start, end)
  const opening = /^`+/u.exec(source)?.[0]
  const closing = /`+$/u.exec(source)?.[0]
  if (opening === undefined || closing === undefined || opening.length !== closing.length) return []
  let units = literalUnits(
    source.slice(opening.length, source.length - closing.length),
    start + opening.length,
    ' ',
  )
  const value = node.value.replace(/\r\n|\r|\n/gu, ' ')
  if (visibleText(units) !== value && units[0]?.text === ' ' && units.at(-1)?.text === ' ') {
    const interior = units.slice(1, -1)
    if (interior.some((unit) => unit.text !== ' ')) units = interior
  }
  return visibleText(units) === value ? units : []
}

function codeBodyOffsets(node: Extract<Nodes, { type: 'code' }>, markdown: string): readonly [number, number] {
  const [start, end] = offsets(node)
  const source = markdown.slice(start, end)
  const opening = /^(?: {0,3})(`{3,}|~{3,})[^\r\n]*(?:\r\n|\r|\n)/u.exec(source)
  if (opening === null) return [start, end]
  const fence = opening[1]!
  const bodyStart = start + opening[0].length
  const tail = source.slice(opening[0].length)
  const marker = fence[0]!
  const closing = new RegExp(
    `(?:^|\\r\\n|\\r|\\n)[ \\t]{0,3}${marker}{${fence.length},}[ \\t]*(?:\\r\\n|\\r|\\n)?$`,
    'u',
  ).exec(tail)
  return [bodyStart, closing === null ? end : bodyStart + closing.index]
}

function rawLines(source: string, startOffset: number): RawLine[] {
  const lines: RawLine[] = []
  for (let cursor = 0; cursor < source.length;) {
    let lineEnd = cursor
    while (lineEnd < source.length && source[lineEnd] !== '\r' && source[lineEnd] !== '\n') lineEnd++
    let newlineEnd = lineEnd
    if (source[newlineEnd] === '\r') newlineEnd++
    if (source[newlineEnd] === '\n') newlineEnd++
    lines.push({
      text: source.slice(cursor, lineEnd),
      startOffset: startOffset + cursor,
      newlineStart: startOffset + lineEnd,
      newlineEnd: startOffset + newlineEnd,
    })
    cursor = newlineEnd
  }
  return lines
}

function codeUnits(node: Extract<Nodes, { type: 'code' }>, markdown: string): MappedUnit[] {
  const [start, end] = codeBodyOffsets(node, markdown)
  const lines = rawLines(markdown.slice(start, end), start)
  const value = node.value.replace(/\r\n|\r/gu, '\n')
  const valueLines = value === '' ? [] : value.split('\n')
  if (valueLines.length > lines.length) return []

  const units: MappedUnit[] = []
  for (const [index, value] of valueLines.entries()) {
    const line = lines[index]!
    const at = line.text.length - value.length
    if (at < 0 || line.text.slice(at) !== value || !/^[ \t]*$/u.test(line.text.slice(0, at))) return []
    units.push(...directUnits(value, line.startOffset + at))
    if (index < valueLines.length - 1) {
      if (line.newlineEnd === line.newlineStart) return []
      units.push({ text: '\n', startOffset: line.newlineStart, endOffset: line.newlineEnd })
    }
  }
  if (lines.slice(valueLines.length).some((line) => line.text.trim() !== '')) return []
  return units
}

function imageAltUnits(
  node: Extract<Nodes, { type: 'image' | 'imageReference' }>,
  markdown: string,
): MappedUnit[] {
  const [start, end] = offsets(node)
  const source = markdown.slice(start, end)
  if (!source.startsWith('![')) return []
  let depth = 1
  for (let cursor = 2; cursor < source.length; cursor++) {
    if (source[cursor] === '\\') {
      cursor++
      continue
    }
    if (source[cursor] === '[') depth++
    if (source[cursor] !== ']') continue
    depth--
    if (depth === 0) return decodedUnits(markdown, node.alt ?? '', start + 2, start + cursor)
  }
  return []
}

function leafText(node: Nodes, markdown: string): MappedUnit[] {
  switch (node.type) {
    case 'text': {
      const [start, end] = offsets(node)
      return decodedUnits(markdown, node.value, start, end)
    }
    case 'inlineCode':
      return inlineCodeUnits(node, markdown)
    case 'code':
      return codeUnits(node, markdown)
    case 'image':
    case 'imageReference':
      return imageAltUnits(node, markdown)
    case 'break': {
      const [start, end] = offsets(node)
      return [{ text: '\n', startOffset: start, endOffset: end }]
    }
    default:
      return []
  }
}

function inlineText(node: Nodes, markdown: string): MappedUnit[] {
  switch (node.type) {
    case 'text':
    case 'inlineCode':
    case 'image':
    case 'imageReference':
    case 'break':
      return leafText(node, markdown)
    case 'html':
      return []
    default:
      return children(node).flatMap((child) => inlineText(child, markdown))
  }
}

function isWhitespace(unit: MappedUnit): boolean {
  return /^\s+$/u.test(unit.text)
}

function trimMapped(units: MappedText): MappedUnit[] {
  let start = 0
  let end = units.length
  while (start < end && isWhitespace(units[start]!)) start++
  while (end > start && isWhitespace(units[end - 1]!)) end--
  return units.slice(start, end)
}

function compactMapped(units: MappedText): MappedUnit[] {
  const compact: MappedUnit[] = []
  for (const unit of trimMapped(units)) {
    if (!isWhitespace(unit)) {
      compact.push(unit)
      continue
    }
    const previous = compact.at(-1)
    if (previous === undefined || previous.text !== ' ') {
      compact.push({ ...unit, text: ' ' })
    } else {
      compact[compact.length - 1] = { ...previous, endOffset: unit.endOffset }
    }
  }
  return compact
}

function joinMapped(parts: readonly MappedText[], separator: string): MappedUnit[] {
  const present = parts.filter((part) => part.length > 0)
  const joined: MappedUnit[] = []
  for (const [index, part] of present.entries()) {
    if (index > 0) {
      const before = joined.at(-1)?.endOffset ?? part[0]!.startOffset
      const after = part[0]!.startOffset
      for (const text of separator) joined.push({ text, startOffset: before, endOffset: after })
    }
    joined.push(...part)
  }
  return joined
}

function blockText(node: Nodes, markdown: string): MappedUnit[] {
  switch (node.type) {
    case 'root':
    case 'blockquote':
      return joinMapped(children(node).map((child) => blockText(child, markdown)), '\n\n')
    case 'paragraph':
    case 'heading':
    case 'tableCell':
      return compactMapped(inlineText(node, markdown))
    case 'code':
      return leafText(node, markdown)
    case 'list':
    case 'table':
      return joinMapped(children(node).map((child) => blockText(child, markdown)), '\n')
    case 'listItem':
      return joinMapped(children(node).map((child) => blockText(child, markdown)), ' ')
    case 'tableRow':
      return joinMapped(children(node).map((child) => blockText(child, markdown)), '\t')
    case 'thematicBreak':
    case 'definition':
    case 'footnoteDefinition':
    case 'html':
      return []
    default:
      return compactMapped(inlineText(node, markdown))
  }
}

function sourceRange(units: MappedText, start: number, end: number): readonly [number, number] | null {
  let visibleOffset = 0
  let first: MappedUnit | undefined
  let last: MappedUnit | undefined
  for (const unit of units) {
    const next = visibleOffset + unit.text.length
    if (next > start && visibleOffset < end) {
      first ??= unit
      last = unit
    }
    visibleOffset = next
  }
  if (first === undefined || last === undefined || first.startOffset >= last.endOffset) return null
  return [first.startOffset, last.endOffset]
}

function candidatesFromProjection(
  markdown: string,
  projection: MappedText,
  needle: string,
): MarkdownSourceCandidate[] {
  const rendered = visibleText(projection)
  const candidates: MarkdownSourceCandidate[] = []
  for (let at = rendered.indexOf(needle); at >= 0; at = rendered.indexOf(needle, at + 1)) {
    const rawRange = sourceRange(projection, at, at + needle.length)
    if (rawRange === null) continue
    const [startOffset, endOffset] = rawRange
    candidates.push({
      startOffset,
      endOffset,
      sourceText: markdown.slice(startOffset, endOffset),
      displayPrefix: rendered.slice(Math.max(0, at - 240), at),
      displaySuffix: rendered.slice(at + needle.length, at + needle.length + 240),
    })
  }
  return candidates
}

/**
 * Locate every GFM source range that renders as one browser-visible selection.
 *
 * @param markdown - committed assistant/message Markdown source.
 * @param displayText - trimmed text returned by the browser Selection.
 * @returns raw ranges plus rendered context for caller-side disambiguation.
 */
export function markdownSourceCandidates(markdown: string, displayText: string): readonly MarkdownSourceCandidate[] {
  const root = fromMarkdown(markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  })
  const projection = trimMapped(blockText(root, markdown))
  const needle = displayText.trim()
  if (needle === '') return []
  const exact = candidatesFromProjection(markdown, projection, needle)
  if (exact.length > 0) return exact
  return candidatesFromProjection(markdown, compactMapped(projection), needle.replace(/\s+/gu, ' '))
}

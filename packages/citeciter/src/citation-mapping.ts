import {
  markdownSourceCandidates,
  type MarkdownSourceCandidate,
} from './client/markdown-source-map.ts'

/** Rendered selection facts used to resolve one exact Markdown source range. */
export interface CitationTextSelection {
  readonly displayText: string
  readonly sourceHintText?: string
  readonly prefixText: string
  readonly suffixText: string
}

/** Exact Markdown source range selected from one committed assistant message. */
export interface ResolvedCitationRange {
  readonly startOffset: number
  readonly endOffset: number
  readonly sourceText: string
  readonly prefixText: string
  readonly suffixText: string
}

function decodedContext(text: string): string {
  return text
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .toLocaleLowerCase()
    .replaceAll(/[\s`*_~[\]()<>#+.!,:;"'\\/|=-]+/gu, '')
}

function commonEdge(left: string, right: string, fromEnd: boolean): number {
  const limit = Math.min(left.length, right.length)
  let matched = 0
  while (matched < limit) {
    const leftIndex = fromEnd ? left.length - matched - 1 : matched
    const rightIndex = fromEnd ? right.length - matched - 1 : matched
    if (left[leftIndex] !== right[rightIndex]) break
    matched++
  }
  return matched
}

/**
 * Locate a literal textarea selection in authoritative document source text.
 * @param selection - raw selected text and page-local surrounding context.
 * @param content - complete normalized document; offsets use UTF-16 code units.
 * @returns the unique best exact match, retaining Markdown and code punctuation.
 * @throws when the quote is absent or repeated context cannot disambiguate it.
 */
export function resolveDocumentRange(selection: CitationTextSelection, content: string): ResolvedCitationRange {
  const needle = selection.displayText.trim()
  let best: { startOffset: number, score: number } | null = null
  let ambiguous = false
  if (needle !== '') for (let at = content.indexOf(needle); at >= 0; at = content.indexOf(needle, at + 1)) {
    const score = commonEdge(selection.prefixText, content.slice(Math.max(0, at - selection.prefixText.length), at), true)
      + commonEdge(selection.suffixText, content.slice(at + needle.length, at + needle.length + selection.suffixText.length), false)
    if (best === null || score > best.score) { best = { startOffset: at, score }; ambiguous = false }
    else if (score === best.score) ambiguous = true
  }
  if (best === null) throw new Error('选区无法映射到文档原文，请重新选择正文后重试')
  if (ambiguous) throw new Error('选区无法唯一映射到文档原文，请缩小或扩大选区后重试')
  const startOffset = best.startOffset
  const endOffset = startOffset + needle.length
  return { startOffset, endOffset, sourceText: content.slice(startOffset, endOffset),
    prefixText: content.slice(Math.max(0, startOffset - 240), startOffset), suffixText: content.slice(endOffset, endOffset + 240) }
}

/** Resolve rendered selection context against authoritative Markdown source. */
export function resolveCitationRange(
  selection: CitationTextSelection,
  answer: string,
): ResolvedCitationRange {
  const candidates: MarkdownSourceCandidate[] = [
    ...markdownSourceCandidates(answer, selection.sourceHintText ?? selection.displayText),
  ]
  if (candidates.length === 0) throw new Error('选区无法映射到已提交的模型回答，请重新选择正文后重试')
  const prefix = decodedContext(selection.prefixText)
  const suffix = decodedContext(selection.suffixText)
  const ranked = candidates.map((candidate) => ({
    candidate,
    score: commonEdge(prefix, decodedContext(candidate.displayPrefix), true)
      + commonEdge(suffix, decodedContext(candidate.displaySuffix), false),
  })).sort((left, right) => right.score - left.score)
  const first = ranked[0]
  if (first === undefined || ranked[1]?.score === first.score) {
    throw new Error('选区无法唯一映射到已提交的模型回答，请缩小或扩大选区后重试')
  }
  const { startOffset, endOffset, sourceText } = first.candidate
  return {
    startOffset,
    endOffset,
    sourceText,
    prefixText: answer.slice(Math.max(0, startOffset - 240), startOffset),
    suffixText: answer.slice(endOffset, endOffset + 240),
  }
}

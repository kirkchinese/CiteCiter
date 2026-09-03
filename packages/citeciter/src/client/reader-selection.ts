/** Reader textarea selection facts resolved from the user-owned textarea value. */

export interface ReaderSelection {
  readonly displayText: string
  readonly prefixText: string
  readonly suffixText: string
}

const READER_CONTEXT_CHARS = 240

/**
 * Resolve the current textarea selection into a verifiable document claim.
 * @param textarea - read-only document textarea holding the complete loaded page.
 * @returns trimmed quote with surrounding context, or null for a collapsed/empty selection.
 */
export function readTextareaSelection(textarea: HTMLTextAreaElement): ReaderSelection | null {
  const value = textarea.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  if (start === end) return null
  const raw = value.slice(start, end)
  const leading = raw.length - raw.trimStart().length
  const trailing = raw.length - raw.trimEnd().length
  const text = raw.trim()
  if (text === '') return null
  const startOffset = start + leading
  const endOffset = end - trailing
  return {
    displayText: text,
    prefixText: value.slice(Math.max(0, startOffset - READER_CONTEXT_CHARS), startOffset),
    suffixText: value.slice(endOffset, endOffset + READER_CONTEXT_CHARS),
  }
}

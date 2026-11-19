/**
 * Truncation that never splits a character. JavaScript strings count UTF-16 code units, and a character outside
 * the Basic Multilingual Plane (emoji such as 🔹, CJK extension B, math alphanumerics) takes two. Cutting between
 * them leaves a lone surrogate, which JSON serializes as an escape such as `"\udd39"` and strict JSON parsers,
 * including model APIs, reject: once such text is in a Topic's history, every later request fails.
 */

const isHighSurrogate = (unit: number): boolean => unit >= 0xd800 && unit <= 0xdbff
const isLowSurrogate = (unit: number): boolean => unit >= 0xdc00 && unit <= 0xdfff

/** Move an end offset back so it does not fall inside a surrogate pair. */
export function snapEnd(text: string, end: number): number {
  return end > 0 && end < text.length && isHighSurrogate(text.charCodeAt(end - 1)) && isLowSurrogate(text.charCodeAt(end)) ? end - 1 : end
}

/** Move a start offset forward so it does not fall inside a surrogate pair. */
export function snapStart(text: string, start: number): number {
  return start > 0 && start < text.length && isLowSurrogate(text.charCodeAt(start)) && isHighSurrogate(text.charCodeAt(start - 1)) ? start + 1 : start
}

/** The first `limit` code units of `text`, one fewer when that would split a character. */
export function headOf(text: string, limit: number): string {
  return text.length <= limit ? text : text.slice(0, snapEnd(text, Math.max(0, limit)))
}

/** The last `limit` code units of `text`, one fewer when that would split a character. */
export function tailOf(text: string, limit: number): string {
  return text.length <= limit ? text : text.slice(snapStart(text, text.length - Math.max(0, limit)))
}

/** `text[start, end)` with both ends moved off surrogate-pair middles: never longer than asked. */
export function sliceWhole(text: string, start: number, end = text.length): string {
  const from = snapStart(text, Math.max(0, start))
  const to = snapEnd(text, Math.min(text.length, end))
  return to <= from ? '' : text.slice(from, to)
}

/**
 * Replace any lone surrogate with U+FFFD, keeping every offset. A last guard for text that reaches a model or
 * a log, whatever cut it upstream.
 */
export function wellFormed(text: string): string {
  return text.replace(/\p{Cs}/gu, '\uFFFD')
}

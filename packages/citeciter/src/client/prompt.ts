/** Maximum genuine user-question length admitted by the Citation Thread UI. */
export const MAX_QUESTION_CHARS = 12_000

const NEXT_QUESTIONS_OPEN = '<citeciter-next-questions>'
const NEXT_QUESTIONS_CLOSE = '</citeciter-next-questions>'
const NEXT_QUESTION_MARKERS = [NEXT_QUESTIONS_OPEN, NEXT_QUESTIONS_CLOSE] as const

export interface ParsedNextQuestions {
  readonly text: string
  readonly questions: readonly string[]
  readonly invalid: boolean
}

/**
 * Normalize a genuine user question without wrapping it in Citation or role
 * prose. System Tutor and Citation Context travel through their own layers.
 */
export function normalizeQuestion(rawQuestion: string): string {
  const question = rawQuestion.trim()
  if (question === '') throw new Error('question cannot be empty')
  if (question.length > MAX_QUESTION_CHARS) {
    throw new Error(`question exceeds ${MAX_QUESTION_CHARS} characters`)
  }
  return question
}

function partialMarkerIndex(text: string): number {
  let earliest = -1
  for (const marker of NEXT_QUESTION_MARKERS) {
    for (let length = Math.min(text.length, marker.length - 1); length > 0; length -= 1) {
      if (!text.endsWith(marker.slice(0, length))) continue
      const index = text.length - length
      earliest = earliest < 0 ? index : Math.min(earliest, index)
      break
    }
  }
  return earliest
}

/**
 * Parse optional follow-up control text without exposing complete or partial markers.
 * @param text - accumulated assistant text.
 * @param streaming - whether the text may end inside a control marker.
 * @returns visible answer text, valid shortcut questions, and malformed-control status.
 */
export function parseNextQuestions(text: string, streaming = false): ParsedNextQuestions {
  const openIndex = text.indexOf(NEXT_QUESTIONS_OPEN)
  const closeIndex = text.indexOf(NEXT_QUESTIONS_CLOSE)
  const partialIndex = streaming ? partialMarkerIndex(text) : -1
  const markerIndices = [openIndex, closeIndex, partialIndex].filter((index) => index >= 0)
  if (markerIndices.length === 0) return { text, questions: [], invalid: false }
  const markerIndex = Math.min(...markerIndices)
  const visibleText = text.slice(0, markerIndex).trimEnd()
  const trimmed = text.trimEnd()
  if (
    openIndex < 0
    || closeIndex < openIndex
    || openIndex !== trimmed.lastIndexOf(NEXT_QUESTIONS_OPEN)
    || closeIndex !== trimmed.lastIndexOf(NEXT_QUESTIONS_CLOSE)
    || !trimmed.endsWith(NEXT_QUESTIONS_CLOSE)
  ) {
    return { text: visibleText, questions: [], invalid: true }
  }
  const marker = new RegExp(
    `^${NEXT_QUESTIONS_OPEN}[ \\t]*(?:\\r?\\n)?([\\s\\S]*?)[ \\t]*(?:\\r?\\n)?${NEXT_QUESTIONS_CLOSE}[ \\t]*$`,
    'u',
  )
  const match = marker.exec(trimmed.slice(openIndex))
  if (match === null) return { text: visibleText, questions: [], invalid: true }
  try {
    const parsed: unknown = JSON.parse(match[1] ?? '')
    if (!Array.isArray(parsed) || parsed.length !== 3) throw new Error('expected three questions')
    const questions = parsed.map((value) => typeof value === 'string' ? value.trim() : '')
    if (questions.some((question) => question === '' || question.length > 160) || new Set(questions).size !== 3) {
      throw new Error('questions must be unique non-empty strings')
    }
    return { text: visibleText, questions, invalid: false }
  } catch {
    return { text: visibleText, questions: [], invalid: true }
  }
}

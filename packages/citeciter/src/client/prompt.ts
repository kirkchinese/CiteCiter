/** Maximum genuine user-question length admitted by the Citation Thread UI. */
export const MAX_QUESTION_CHARS = 12_000

const NEXT_QUESTIONS_OPEN = '<citeciter-next-questions>'
const NEXT_QUESTIONS_CLOSE = '</citeciter-next-questions>'

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

/** Parse the optional exact first-answer follow-up block without exposing malformed control text as UI. */
export function parseNextQuestions(text: string): ParsedNextQuestions {
  const markers = [text.indexOf(NEXT_QUESTIONS_OPEN), text.indexOf(NEXT_QUESTIONS_CLOSE)]
    .filter((index) => index >= 0)
  if (markers.length === 0) return { text, questions: [], invalid: false }
  const markerIndex = Math.min(...markers)
  const visibleText = text.slice(0, markerIndex).trimEnd()
  const marker = new RegExp(
    `^${NEXT_QUESTIONS_OPEN}\\n([\\s\\S]*?)\\n${NEXT_QUESTIONS_CLOSE}\\s*$`,
    'u',
  )
  const match = marker.exec(text.slice(markerIndex))
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

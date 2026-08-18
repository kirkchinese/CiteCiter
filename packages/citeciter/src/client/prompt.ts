/** Maximum genuine user-question length admitted by the Citation Thread UI. */
export const MAX_QUESTION_CHARS = 12_000

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

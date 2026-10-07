/** Recognized question outcomes shared by Host and Client without importing either service face. */
export const QUESTION_TOOL_OUTCOME_CODES = ['ASK_CANCELLED', 'ASK_ABORTED'] as const
export type QuestionToolOutcomeCode = typeof QUESTION_TOOL_OUTCOME_CODES[number]

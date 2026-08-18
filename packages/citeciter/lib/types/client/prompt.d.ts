/** Maximum genuine user-question length admitted by the Citation Thread UI. */
export declare const MAX_QUESTION_CHARS = 12000;
/**
 * Normalize a genuine user question without wrapping it in Citation or role
 * prose. System Tutor and Citation Context travel through their own layers.
 */
export declare function normalizeQuestion(rawQuestion: string): string;

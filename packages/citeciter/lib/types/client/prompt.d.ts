/** Maximum genuine user-question length admitted by the Citation Thread UI. */
export declare const MAX_QUESTION_CHARS = 12000;
export interface ParsedNextQuestions {
    readonly text: string;
    readonly questions: readonly string[];
    readonly invalid: boolean;
}
/**
 * Trim a first question without wrapping it in Citation or role prose. It may be
 * empty because creation only prepares a draft; the length limit applies before any request.
 * @param rawQuestion - text typed or chosen by the user.
 * @returns the trimmed question.
 */
export declare function normalizeDraftQuestion(rawQuestion: string): string;
/**
 * Parse optional follow-up control text without exposing complete or partial markers.
 * @param text - accumulated assistant text.
 * @param streaming - whether the text may end inside a control marker.
 * @returns visible answer text, valid shortcut questions, and malformed-control status.
 */
export declare function parseNextQuestions(text: string, streaming?: boolean): ParsedNextQuestions;

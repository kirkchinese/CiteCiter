/** Visible assistant text and its stream lifecycle. */
export type AssistantAnswer = {
    readonly status: 'running' | 'settled' | 'interrupted';
    readonly text: string;
};
/**
 * Read visible text from one assistant-step payload without retaining its live node.
 * @param data - assistant-step payload from the conversation snapshot.
 * @returns visible text and status, or null when no displayable answer exists.
 */
export declare function readAssistantAnswer(data: unknown): AssistantAnswer | null;

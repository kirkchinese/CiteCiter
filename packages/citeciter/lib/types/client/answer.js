import { projectCitableAssistantContent } from "../assistant-content.js";
/**
 * Read visible text from one assistant-step payload without retaining its live node.
 * @param data - assistant-step payload from the conversation snapshot.
 * @returns visible text and status, or null when no displayable answer exists.
 */
export function readAssistantAnswer(data) {
    if (data === null || typeof data !== 'object')
        return null;
    const record = data;
    if (record.status !== 'running' && record.status !== 'settled' && record.status !== 'interrupted')
        return null;
    const text = projectCitableAssistantContent(record.blocks ?? []);
    return text === '' ? null : { status: record.status, text };
}

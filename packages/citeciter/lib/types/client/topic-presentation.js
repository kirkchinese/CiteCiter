const INTERNAL_TOOLS = new Set(['read_source_session', 'blackboard_apply']);
/**
 * Append a requested board reference without replacing text the user already wrote.
 * @param draft - current Topic composer draft.
 * @param prompt - explicit board reference requested by the user.
 * @returns the combined composer value.
 */
export function appendBoardCitation(draft, prompt) {
    if (draft === '')
        return prompt;
    return draft.endsWith('\n') ? draft + prompt : draft + '\n' + prompt;
}
/**
 * Decide whether one Topic event belongs in the user-facing transcript.
 * @param message - candidate projected Topic event.
 * @param messages - complete ordered Topic transcript used to detect recovery.
 * @returns whether the event should remain visible.
 */
export function isTopicMessageVisible(message, messages) {
    if (message.role === 'context')
        return false;
    if (message.role === 'assistant' && message.text.trim() === '')
        return false;
    if (message.role === 'tool') {
        if (!message.isError && INTERNAL_TOOLS.has(message.name))
            return false;
        if (!message.isError)
            return true;
        return !messages.some((candidate) => candidate.role === 'tool'
            && candidate.seq > message.seq
            && candidate.name === message.name
            && !candidate.running
            && !candidate.isError);
    }
    if (message.role !== 'error')
        return true;
    return !messages.some((candidate) => candidate.role === 'assistant'
        && candidate.seq > message.seq
        && !candidate.streaming
        && candidate.text.trim() !== '');
}

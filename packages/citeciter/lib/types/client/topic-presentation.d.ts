import type { TopicMessage } from '../topic.ts';
/**
 * Append a requested board reference without replacing text the user already wrote.
 * @param draft - current Topic composer draft.
 * @param prompt - explicit board reference requested by the user.
 * @returns the combined composer value.
 */
export declare function appendBoardCitation(draft: string, prompt: string): string;
/**
 * Decide whether one Topic event belongs in the user-facing transcript.
 * @param message - candidate projected Topic event.
 * @param messages - complete ordered Topic transcript used to detect recovery.
 * @returns whether the event should remain visible.
 */
export declare function isTopicMessageVisible(message: TopicMessage, messages: readonly TopicMessage[]): boolean;

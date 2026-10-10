import type { TopicMessage } from '../topic.ts';
/**
 * Decide whether one Topic event belongs in the user-facing transcript.
 * @param message - candidate projected Topic event.
 * @param messages - complete ordered Topic transcript used to detect recovery.
 * @returns whether the event should remain visible.
 */
export declare function isTopicMessageVisible(message: TopicMessage, messages: readonly TopicMessage[]): boolean;

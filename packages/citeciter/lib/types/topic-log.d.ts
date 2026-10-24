import type { SessionEvent, SessionHeader, SessionLogOffset } from '@deepseek-ai/dsh-session';
import { foldSessionTitle } from '@deepseek-ai/dsh-session-title';
import { type BoardSnapshot } from './board.ts';
/** Name of the model tool that records a board animation timeline. */
export declare const BOARD_ANIMATE_TOOL = "blackboard_animate";
import type { TopicMessage, TopicMetadata, TopicUsage } from './topic.ts';
/** Session header and events used to project one Topic. */
export interface TopicLog {
    readonly header: SessionHeader;
    readonly events: readonly SessionEvent[];
    readonly inheritedEventCount: SessionLogOffset;
    readonly liveMessage?: TopicMessage | undefined;
    readonly renderKeys?: ReadonlyMap<number, string> | undefined;
}
/** Fold Topic-owned assistant usage, including retried attempts, without inherited source events. */
export declare function projectTopicUsage(log: TopicLog): TopicUsage | undefined;
/** Last read scan cursor from this Topic log; it may move backward and never limits future reads. */
export declare function latestObservedSeq(events: readonly SessionEvent[]): number | null;
/**
 * Project transcript rows and the latest turn's active failure banner.
 * @param log - Topic Session contents; an inherited prefix from older versions is skipped.
 * @returns transcript rows plus an error only while the newest turn remains failed.
 */
export declare function topicMessages(log: TopicLog): {
    messages: TopicMessage[];
    error: string | null;
};
/**
 * Project final blackboard state from successful blackboard_apply call/result pairs.
 * @param log - Topic Session contents.
 * @returns versioned final state, successful commit revision, and invalid-commit count.
 */
export declare function projectBoardFromLog(log: TopicLog): BoardSnapshot;
/**
 * Classify a folded title for the cached navigation metadata.
 * @param value - latest title projection, if any.
 * @returns its source kind, or null for no title or a source the index does not record.
 */
export declare function titleSourceKind(value: ReturnType<typeof foldSessionTitle>): TopicMetadata['cachedTitleSource'];
/**
 * Fold Topic-owned titles, skipping an inherited prefix kept by older Topics.
 * @param log - restored Topic events and the host-owned inherited event count.
 * @returns the latest Topic title projection, or undefined before any title is recorded.
 */
export declare function foldTopicTitle(log: TopicLog): import("@deepseek-ai/dsh-session-title").SessionTitleSnapshot | undefined;

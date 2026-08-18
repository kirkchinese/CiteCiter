import type { SessionId, SessionListState } from '@deepseek-ai/dsh-client-runtime/client';
import { type CitationRecord, type CitationThread } from '../thread.ts';
import type { CiteSelection } from './types.ts';
/** Browser-facing summary of one durable projected Citation Thread. */
export interface ThreadSummary {
    readonly sessionId: SessionId;
    readonly parentSessionId: SessionId;
    readonly parentTitle: string;
    readonly title?: string;
    readonly updatedAt: number;
    readonly running: boolean;
    readonly citation: CitationRecord;
    readonly historyStartSeq: number;
    readonly contextSeq: number;
}
/** Build the immutable Citation record and its SHA-256 selection identity. */
export declare function createCitation(selection: CiteSelection, sourceSessionId: SessionId, anchorSeq: number): Promise<CitationRecord>;
export declare function summarizeCitationThread(list: SessionListState, sessionId: SessionId, thread: CitationThread): ThreadSummary | null;
/** Discover every unarchived Thread from Host-computed list-row projections. */
export declare function listCitationThreads(list: SessionListState, archivedSessionIds?: readonly SessionId[]): readonly ThreadSummary[];
/** Find the one durable Thread whose full Citation identity matches. */
export declare function findCitationThread(threads: readonly ThreadSummary[], citation: CitationRecord): ThreadSummary | undefined;

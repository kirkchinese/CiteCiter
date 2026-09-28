import type { BoardCaptureJob } from '../board-capture-protocol.ts';
import type { CiteCiterRequest, CiteCiterResponse } from '../topic.ts';
export interface BoardCaptureSnapshot {
    jobs: readonly BoardCaptureJob[];
}
/**
 * Poll only model-requested board renders, independently of navigation or visible Topics.
 * @param request - authenticated root-scoped Citer transport; no Session activation is needed.
 * @param report - report transport failures once until connectivity recovers.
 * @returns render store and stable reply callback; dispose aborts RPCs and removes the poll timer.
 */
export declare function createBoardCaptureController(request: (request: CiteCiterRequest, signal: AbortSignal) => Promise<CiteCiterResponse>, report: (error: unknown) => void): {
    getSnapshot: () => BoardCaptureSnapshot;
    subscribe: (fn: () => void) => () => void;
    reply: (sessionId: string, id: string, png?: string, error?: string) => Promise<void>;
    dispose: () => void;
};

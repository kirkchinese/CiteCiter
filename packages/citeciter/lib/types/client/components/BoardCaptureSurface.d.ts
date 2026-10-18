import type { BoardSnapshot } from '../../board.ts';
/** Reuses the exact board renderer when its visible tab is closed; no synthetic drawing or extra conversation is created. */
export declare function BoardCaptureSurface({ id, sessionId, board, atMs, reply }: {
    readonly id: string;
    readonly sessionId: string;
    readonly board: BoardSnapshot | undefined;
    /** Timeline time to freeze; frames always render offscreen so playback state cannot leak in. */
    readonly atMs?: number | undefined;
    readonly reply: (sessionId: string, id: string, png?: string, error?: string) => Promise<void>;
}): import("react").JSX.Element;

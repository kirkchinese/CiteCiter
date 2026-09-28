import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store';
import type { BoardCaptureSnapshot, createBoardCaptureController } from '../board-capture-controller.ts';
/** Root-owned render workers survive panel close, Topic changes and source navigation. */
export declare function BoardCaptureWorker({ useCapture, reply }: {
    readonly useCapture: SnapshotSelectorHook<BoardCaptureSnapshot>;
    readonly reply: ReturnType<typeof createBoardCaptureController>['reply'];
}): import("react").JSX.Element;

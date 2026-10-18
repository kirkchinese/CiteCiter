import 'katex/dist/katex.min.css';
import { type BoardElementState, type BoardSnapshot } from '../../board.ts';
/**
 * Render one final-state blackboard projection in either learning surface.
 * @param props - snapshot, motion preference, optional compact reading mode and citation action.
 * @returns the safe blackboard canvas.
 */
export declare function BoardView({ snapshot, animations, onQuoteElement, compact, sessionId, frameAtMs, }: {
    readonly snapshot: BoardSnapshot | undefined;
    readonly animations: boolean;
    readonly onQuoteElement?: (element: BoardElementState) => void;
    readonly compact?: boolean;
    readonly sessionId?: string;
    /** Freeze the board's timeline at this time, for frame capture. */
    readonly frameAtMs?: number;
}): import("react").JSX.Element;

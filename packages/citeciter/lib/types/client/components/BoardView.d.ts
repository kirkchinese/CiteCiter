import 'katex/dist/katex.min.css';
import { type BoardElementState, type BoardSnapshot } from '../../board.ts';
/**
 * Render one final-state blackboard projection in the main conversation workspace.
 * @param props - board snapshot, motion preference, and optional citation action.
 * @returns the safe blackboard canvas.
 */
export declare function BoardView({ snapshot, animations, onQuoteElement, }: {
    readonly snapshot: BoardSnapshot | undefined;
    readonly animations: boolean;
    readonly onQuoteElement?: (element: BoardElementState) => void;
}): import("react").JSX.Element;

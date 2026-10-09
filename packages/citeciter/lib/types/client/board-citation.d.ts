import type { BoardElementState } from '../board.ts';
/**
 * Quote the selected board element without exposing its raw SVG/HTML or image bytes.
 * @param element - the actual selected element from the current Topic board.
 * @returns removable draft content; graphic-only references ask for visual inspection
 * after manual submission rather than inventing text or starting a model request.
 */
export declare function boardCitationPrompt(element: BoardElementState): string;

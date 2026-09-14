/**
 * Find the rendered board for one exact capture address.
 * @param sessionId - owning Citer Session identity.
 * @param revision - requested board revision.
 * @param fallback - offscreen capture root, excluded from visible candidates.
 * @returns a painted, viewport-intersecting board, or undefined to use the fallback renderer.
 */
export declare function findVisibleCaptureBoard(sessionId: string, revision: number, fallback: HTMLElement): HTMLElement | undefined;

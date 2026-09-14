/**
 * Find the rendered board for one exact capture address.
 * @param sessionId - owning Citer Session identity.
 * @param revision - requested board revision.
 * @param fallback - offscreen capture root, excluded from visible candidates.
 * @returns a painted, viewport-intersecting board, or undefined to use the fallback renderer.
 */
export function findVisibleCaptureBoard(sessionId: string, revision: number, fallback: HTMLElement): HTMLElement | undefined {
  return [...document.querySelectorAll<HTMLElement>('[data-citeciter-board]')].find(node => {
    if (fallback.contains(node) || node.dataset.citeciterBoard !== sessionId || node.dataset.boardRevision !== String(revision)) return false
    const rect = node.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0 || rect.right <= 0 || rect.bottom <= 0 || rect.left >= window.innerWidth || rect.top >= window.innerHeight) return false
    if (getComputedStyle(node).visibility !== 'visible') return false
    // Hidden panes can retain nonzero layout boxes. Opacity and content visibility
    // on ancestors also prevent painting without changing the board's own bounds.
    for (let parent: HTMLElement | null = node; parent !== null; parent = parent.parentElement) {
      const style = getComputedStyle(parent)
      if (style.display === 'none' || style.contentVisibility === 'hidden' || Number(style.opacity) === 0) return false
    }
    return true
  })
}

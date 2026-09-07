/** Space allocation for the learning panel inside the host content viewport. */
export interface DockViewport {
  readonly width: number
  readonly height: number
  readonly sidebar: number
  readonly details: number
  readonly caption: number
  readonly percent: number
}

/** The host keeps its conversation and details visible in both arrangements. */
export interface DockGeometry {
  readonly mode: 'columns' | 'rows'
  readonly width: number
  readonly height: number
  readonly top: number
}

/**
 * Reserve a separate column, or a bottom row when two readable columns cannot fit.
 * CSS pixels already account for browser zoom and Windows display scaling.
 * @param viewport - measured host dimensions and the saved width preference.
 * @returns panel dimensions within the host, excluding its native caption.
 */
export function resolveDockGeometry(viewport: DockViewport): DockGeometry {
  const contentHeight = Math.max(0, viewport.height - viewport.caption)
  const available = viewport.width - viewport.sidebar - viewport.details - 480
  if (available >= 360) {
    return {
      mode: 'columns',
      width: Math.min(available, Math.max(360, viewport.width * viewport.percent / 100)),
      height: contentHeight,
      top: viewport.caption,
    }
  }
  const height = Math.min(contentHeight * 0.55, Math.max(240, contentHeight - 260))
  return { mode: 'rows', width: viewport.width, height, top: viewport.height - height }
}

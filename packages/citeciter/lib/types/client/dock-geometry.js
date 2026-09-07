/**
 * Reserve a separate column, or a bottom row when two readable columns cannot fit.
 * CSS pixels already account for browser zoom and Windows display scaling.
 * @param viewport - measured host dimensions and the saved width preference.
 * @returns panel dimensions within the host, excluding its native caption.
 */
export function resolveDockGeometry(viewport) {
    const contentHeight = Math.max(0, viewport.height - viewport.caption);
    const available = viewport.width - viewport.sidebar - viewport.details - 480;
    if (available >= 360) {
        return {
            mode: 'columns',
            width: Math.min(available, Math.max(360, viewport.width * viewport.percent / 100)),
            height: contentHeight,
            top: viewport.caption,
        };
    }
    const height = Math.min(contentHeight * 0.55, Math.max(240, contentHeight - 260));
    return { mode: 'rows', width: viewport.width, height, top: viewport.height - height };
}

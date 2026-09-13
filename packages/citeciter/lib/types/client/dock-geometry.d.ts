/** Space allocation for the learning panel inside the host content viewport. */
export interface DockViewport {
    readonly width: number;
    readonly height: number;
    readonly sidebar: number;
    readonly details: number;
    readonly caption: number;
    readonly percent: number;
}
/** Wide windows reserve a column; compact windows navigate to a Citer page. */
export interface DockGeometry {
    readonly mode: 'columns' | 'page';
    readonly width: number;
    readonly height: number;
    readonly top: number;
}
/**
 * Reserve a separate column, or the content area when two readable columns cannot fit.
 * CSS pixels already account for browser zoom and Windows display scaling.
 * @param viewport - measured host dimensions and the saved width preference.
 * @returns panel dimensions within the host, excluding its native caption.
 */
export declare function resolveDockGeometry(viewport: DockViewport): DockGeometry;

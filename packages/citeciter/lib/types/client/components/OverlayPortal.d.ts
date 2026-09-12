import type { ReactNode } from 'react';
/**
 * Render plugin-owned floating content outside the shell's stacking context.
 * The public slot still owns its React lifetime; unmounting removes the portal.
 * Inline content keeps its original ancestry for the isolated dock adapter.
 */
export declare function OverlayPortal({ children, inline }: {
    readonly children: ReactNode;
    readonly inline?: boolean;
}): ReactNode;

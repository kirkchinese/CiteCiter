import type { UseSidebarRightTabInfo } from '@deepseek-ai/dsh-client-ui-sidebar-right/client';
import { type CitePanelProps } from './CitePanel.tsx';
/**
 * Citer's workspace as a DSH right-sidebar tab. The sidebar owns placement, splitting, floating,
 * fullscreen and closing; while the tab is on screen Citer counts as open, so the desktop pet
 * steps aside and finished answers are not marked unread. When the user chose Citer's own panel,
 * a Citer tab (opened from the guide, or left from before) closes and opens that panel instead.
 */
export declare function CiterTab(props: CitePanelProps & {
    readonly useTabInfo: UseSidebarRightTabInfo;
}): import("react").JSX.Element | null;
/** The mascot as the guide card and tab icon, at the size DSH draws icons. */
export declare function CiterIcon({ size, className }: {
    readonly size?: number | undefined;
    readonly className?: string | undefined;
}): import("react").JSX.Element;

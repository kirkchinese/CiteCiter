import type { PointerEventHandler, ReactNode } from 'react';
/**
 * Layout-only header. The Citer mark identifies the panel; dragging the header floats it.
 * Navigation, title and closing are supplied by their own controllers. In DSH's right sidebar
 * the tab chip owns closing and moving, so `onClose` and `onDrag` are omitted there.
 * @param status - shown only while something is happening or needs attention.
 */
export declare function TopicHeader({ compact, onBack, onClose, onDrag, title, status, children }: {
    readonly compact: boolean;
    readonly onBack: () => void;
    readonly onClose?: (() => void) | undefined;
    readonly onDrag?: PointerEventHandler<HTMLElement> | undefined;
    readonly title: ReactNode;
    readonly status: string | null;
    readonly children: ReactNode;
}): import("react").JSX.Element;

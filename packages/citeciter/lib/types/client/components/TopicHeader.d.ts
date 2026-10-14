import type { PointerEventHandler, ReactNode } from 'react';
/**
 * Layout-only header. The Citer mark identifies the panel; dragging the header floats it.
 * Navigation, title and closing are supplied by their own controllers.
 * @param status - shown only while something is happening or needs attention.
 */
export declare function TopicHeader({ compact, onBack, onClose, onDrag, title, status, children }: {
    readonly compact: boolean;
    readonly onBack: () => void;
    readonly onClose: () => void;
    readonly onDrag: PointerEventHandler<HTMLElement>;
    readonly title: ReactNode;
    readonly status: string | null;
    readonly children: ReactNode;
}): import("react").JSX.Element;

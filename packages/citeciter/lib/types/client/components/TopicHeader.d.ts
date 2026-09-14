import type { PointerEventHandler, ReactNode } from 'react';
/** Layout-only header: navigation, title and drag behavior are supplied by their independent controllers. */
export declare function TopicHeader({ compact, onBack, onDrag, title, status, children }: {
    readonly compact: boolean;
    readonly onBack: () => void;
    readonly onDrag: PointerEventHandler<HTMLElement>;
    readonly title: ReactNode;
    readonly status: string;
    readonly children: ReactNode;
}): import("react").JSX.Element;

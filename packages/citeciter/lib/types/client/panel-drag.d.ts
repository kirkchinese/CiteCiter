import { type PointerEvent, type RefObject } from 'react';
/** Pointer lifecycle survives reparenting between the host slot and the floating portal. */
export declare function usePanelDrag(panel: RefObject<HTMLElement | null>, floating: boolean, setPresentation: (mode: 'side' | 'floating') => void): {
    position: {
        left: number;
        top: number;
    } | null;
    dockTarget: boolean;
    start: (event: PointerEvent<HTMLElement>) => void;
};

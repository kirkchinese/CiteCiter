import { type ReactNode } from 'react';
/**
 * The collapsed Citer entry: the mascot peeking over a window edge. It stands up when the
 * pointer comes near or it receives focus, opens Citer on click, and can be dragged to
 * either side; the side and height are remembered in this browser.
 * @param attention - show a dot because an answer finished or a question waits while Citer is closed.
 */
export declare function CiterPet({ attention, onOpen, bubble }: {
    readonly attention: boolean;
    readonly onOpen: () => void;
    readonly bubble?: ReactNode;
}): import("react").JSX.Element;

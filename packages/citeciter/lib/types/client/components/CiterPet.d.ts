import { type ReactNode } from 'react';
/** Content shown where the pet would rest, for when she is hidden: teacher mode's note, or a short hint. */
export declare function PetSpot({ children }: {
    readonly children: ReactNode;
}): import("react").JSX.Element;
/**
 * The collapsed Citer entry: the mascot peeking over a window edge. It stands up when the
 * pointer comes near or it receives focus, opens Citer on click, and can be dragged to
 * either side; the side and height are remembered in this browser.
 * @param attention - show a dot because an answer finished or a question waits while Citer is closed.
 */
export declare function CiterPet({ attention, onOpen, onHide, bubble }: {
    readonly attention: boolean;
    readonly onOpen: () => void;
    readonly onHide?: () => void;
    readonly bubble?: ReactNode;
}): import("react").JSX.Element;

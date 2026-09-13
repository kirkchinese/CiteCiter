import { type ReactNode, type RefObject } from 'react';
/** Anchored menu surface. Owns positioning, focus and dismissal, not selection state. */
export declare function ChoicePopover({ anchor, label, onClose, children }: {
    readonly anchor: RefObject<HTMLElement>;
    readonly label: string;
    readonly onClose: () => void;
    readonly children: ReactNode;
}): import("react").JSX.Element;

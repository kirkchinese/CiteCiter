import { type RefObject } from 'react';
/** Suspend only covered host panes while Citer occupies the compact content page; restore their focusability on return. */
export declare function useCompactNavigation(panel: RefObject<HTMLElement | null>, active: boolean): void;

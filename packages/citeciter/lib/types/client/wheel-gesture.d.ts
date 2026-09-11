import { type CiteAction, type WheelTrigger } from '../actions.ts';
import type { ActionController, ActionSource } from './action-controller.ts';
/** Owned reading surfaces provide captures without probing other plugins' private DOM. */
export declare function createSelectionSurfaces(): {
    register(element: HTMLElement, read: () => ActionSource | null): () => void;
    read(target: EventTarget | null): ActionSource | null;
};
export type SelectionSurfaces = ReturnType<typeof createSelectionSurfaces>;
/** Install hold/move/release gestures; returns a disposer removing every global listener. */
export declare function installWheelGesture(controller: ActionController, read: (event: MouseEvent) => ActionSource | null, preferences: () => {
    wheelTrigger?: WheelTrigger | undefined;
    wheelSlots?: (CiteAction | null)[] | undefined;
}): () => void;

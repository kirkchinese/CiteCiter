import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store';
import { type ActionController, type ActionSnapshot } from '../action-controller.ts';
import type { CompanionActions } from '../view-actions.ts';
export type ActionCallbacks = Omit<ActionController, 'getSnapshot' | 'subscribe' | 'dispose'>;
/** Public wheel and creation-error retry. Questions and models are edited only in the Topic composer. */
export declare function ActionWheel({ useActions, actions, companion }: {
    useActions: SnapshotSelectorHook<ActionSnapshot>;
    actions: ActionCallbacks;
    companion: CompanionActions;
}): import("react").JSX.Element;

import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store';
import { type ActionController, type ActionSnapshot } from '../action-controller.ts';
import type { CompanionSnapshot } from '../companion-controller.ts';
export type ActionCallbacks = Omit<ActionController, 'getSnapshot' | 'subscribe' | 'dispose'>;
/** Optional wheel and the action retry prompt. Questions and models are edited only in the Topic composer. */
export declare function ActionWheel({ useActions, useCompanion, actions }: {
    useActions: SnapshotSelectorHook<ActionSnapshot>;
    useCompanion: SnapshotSelectorHook<CompanionSnapshot>;
    actions: ActionCallbacks;
}): import("react").JSX.Element;

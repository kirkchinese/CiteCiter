import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store';
import { type ActionController, type ActionSnapshot } from '../action-controller.ts';
import type { CompanionActions } from '../view-actions.ts';
import type { CompanionSnapshot } from '../companion-controller.ts';
export type ActionCallbacks = Omit<ActionController, 'getSnapshot' | 'subscribe' | 'dispose'>;
/** Public shell overlay: wheel, input prompt and visible retry. Business work stays in its controller. */
export declare function ActionWheel({ useActions, useCompanion, actions, companion }: {
    useActions: SnapshotSelectorHook<ActionSnapshot>;
    useCompanion: SnapshotSelectorHook<CompanionSnapshot>;
    actions: ActionCallbacks;
    companion: CompanionActions;
}): import("react").JSX.Element;

import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store';
import type { CompanionSnapshot } from '../companion-controller.ts';
import type { CompanionActions, OverlayActions } from '../view-actions.ts';
import type { ConvViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client';
/** Additional faces owned by CiteCiter's conversation-view registration. */
export interface BlackboardWorkspaceInjected {
    readonly useCompanion: SnapshotSelectorHook<CompanionSnapshot>;
    readonly companion: CompanionActions;
    readonly bus: OverlayActions;
    readonly openPanel: () => void;
}
export type BlackboardWorkspaceProps = ConvViewProps & BlackboardWorkspaceInjected;
/**
 * Render the session-scoped blackboard registered through conversation.view.
 * @param props - active DSH conversation identity and CiteCiter browser faces.
 * @returns the matching Topic board or a source-specific empty state.
 */
export declare function BlackboardWorkspace({ useCompanion, sessionId, companion, bus, openPanel }: BlackboardWorkspaceProps): import("react").JSX.Element;

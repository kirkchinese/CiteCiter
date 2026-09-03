import type { ConvViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { CompanionFace } from '../companion-controller.ts';
import type { CiteBus } from '../types.ts';
/** Additional faces owned by CiteCiter's conversation-view registration. */
export interface BlackboardWorkspaceInjected {
    readonly companion: CompanionFace;
    readonly bus: CiteBus;
    readonly openPanel: () => void;
}
export type BlackboardWorkspaceProps = ConvViewProps & BlackboardWorkspaceInjected;
/**
 * Render the session-scoped blackboard registered through conversation.view.
 * @param props - active DSH conversation identity and CiteCiter browser faces.
 * @returns the matching Topic board or a source-specific empty state.
 */
export declare function BlackboardWorkspace({ sessionId, companion, bus, openPanel }: BlackboardWorkspaceProps): import("react").JSX.Element;

import type { NativeComposer, DeliveryMode } from '../native-composer.ts';
import type { UseSessionPendingInteraction } from '@deepseek-ai/dsh-client-ui-session/client';
import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store';
import type { CiteOverlaySnapshot } from '../types.ts';
import type { CompanionSnapshot } from '../companion-controller.ts';
import type { CompanionActions, OverlayActions } from '../view-actions.ts';
export interface CitePanelProps {
    readonly nativeComposer: NativeComposer;
    readonly useCompanion: SnapshotSelectorHook<CompanionSnapshot>;
    readonly useOverlay: SnapshotSelectorHook<CiteOverlaySnapshot>;
    readonly useInteractions: UseSessionPendingInteraction;
    readonly useSubmission: SnapshotSelectorHook<DeliveryMode>;
    readonly bus: OverlayActions;
    readonly companion: CompanionActions;
    readonly closePanel: () => void;
    readonly openReader: () => void;
    readonly reportParseError: (messageId: string) => void;
}
/**
 * Render the independent Topic workspace on the right edge of the shell.
 * @param props - shared panel bus, Topic controller, and host callbacks.
 * @returns the responsive Topic dock and its dialogs, or null while closed.
 */
export declare function CitePanel({ nativeComposer, useCompanion, useOverlay, useInteractions, useSubmission, bus, companion, closePanel, openReader, reportParseError }: CitePanelProps): import("react").JSX.Element | null;

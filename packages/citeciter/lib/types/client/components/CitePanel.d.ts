import type { NativeComposer, DeliveryMode } from '../native-composer.ts';
import { type DraftController, type DraftSnapshot } from '../draft-controller.ts';
import type { InteractionSnapshot } from '../host-ui-adapter.ts';
import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store';
import type { CiteOverlaySnapshot } from '../types.ts';
import type { CompanionSnapshot } from '../companion-controller.ts';
import type { CompanionActions, OverlayActions } from '../view-actions.ts';
export interface CitePanelProps {
    readonly drafts: Omit<DraftController, 'getSnapshot' | 'subscribe' | 'dispose'>;
    readonly useDrafts: SnapshotSelectorHook<DraftSnapshot>;
    readonly nativeComposer: NativeComposer;
    readonly useCompanion: SnapshotSelectorHook<CompanionSnapshot>;
    readonly useOverlay: SnapshotSelectorHook<CiteOverlaySnapshot>;
    readonly useInteractions: SnapshotSelectorHook<InteractionSnapshot>;
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
export declare function CitePanel({ nativeComposer, drafts, useDrafts, useCompanion, useOverlay, useInteractions, useSubmission, bus, companion, closePanel, openReader, reportParseError }: CitePanelProps): import("react").JSX.Element | null;

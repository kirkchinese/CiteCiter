import type { NativeComposer, DeliveryMode } from '../native-composer.ts';
import { type DraftController, type DraftSnapshot } from '../draft-controller.ts';
import type { InteractionSnapshot } from '../host-ui-adapter.ts';
import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store';
import type { UseSessions } from '@deepseek-ai/dsh-client-ui-session/client';
import type { CiteOverlaySnapshot } from '../types.ts';
import type { SelectionSurfaces } from '../wheel-gesture.ts';
import type { FileOpener } from '../native-file-link.ts';
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
    /** Host standard prop: the session list, used to show source titles on reference chips. */
    readonly useSessions?: UseSessions;
    /** Makes text selected in the transcript a Citer action source that continues this Topic. */
    readonly registerSurface?: SelectionSurfaces['register'];
    /** Opens a source-workspace file in DSH's right sidebar. */
    readonly openFile?: FileOpener;
}
/**
 * Render the independent Topic workspace on the right edge of the shell.
 * @param props - shared panel bus, Topic controller, and host callbacks.
 * @returns the responsive Topic dock and its dialogs, or null while closed.
 */
export declare function CitePanel({ nativeComposer, drafts, useDrafts, useCompanion, useOverlay, useInteractions, useSubmission, useSessions, bus, companion, closePanel, openReader, reportParseError, registerSurface, openFile }: CitePanelProps): import("react").JSX.Element | null;

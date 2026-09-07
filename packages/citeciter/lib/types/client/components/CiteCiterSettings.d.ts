import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store';
import type { UpdateNoticeSnapshot } from '../update-controller.ts';
import type { SettingsDocumentSnapshot } from '../settings-document.ts';
import type { CompanionSnapshot } from '../companion-controller.ts';
import type { CompanionActions, UpdateActions, SettingsDocumentActions } from '../view-actions.ts';
import type { SettingsSectionOwnerProps } from '@deepseek-ai/dsh-client-ui-settings/client';
export interface CiteCiterSettingsProps extends SettingsSectionOwnerProps {
    readonly useCompanion: SnapshotSelectorHook<CompanionSnapshot>;
    readonly useDocument: SnapshotSelectorHook<SettingsDocumentSnapshot>;
    readonly useUpdate: SnapshotSelectorHook<UpdateNoticeSnapshot>;
    readonly companion: CompanionActions;
    readonly settingsDocument: SettingsDocumentActions;
    readonly updateController: UpdateActions;
}
/** Native DSH settings page for CiteCiter-owned preferences. */
export declare function CiteCiterSettings({ useCompanion, useDocument, useUpdate, companion, settingsDocument, updateController }: CiteCiterSettingsProps): import("react").JSX.Element;

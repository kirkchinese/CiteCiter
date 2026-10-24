import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store';
import type { UpdateNoticeSnapshot } from '../update-controller.ts';
import type { SettingsDocumentSnapshot } from '../settings-document.ts';
import type { CompanionSnapshot } from '../companion-controller.ts';
import type { CompanionActions, UpdateActions, SettingsDocumentActions } from '../view-actions.ts';
import type { SettingsSectionOwnerProps } from '@deepseek-ai/dsh-client-ui-settings/client';
/** What the settings page needs; the host's settings and plugin pages each add their own owner props. */
export interface CiteCiterSettingsProps extends Partial<SettingsSectionOwnerProps> {
    readonly useCompanion: SnapshotSelectorHook<CompanionSnapshot>;
    readonly useDocument: SnapshotSelectorHook<SettingsDocumentSnapshot>;
    readonly useUpdate: SnapshotSelectorHook<UpdateNoticeSnapshot>;
    readonly companion: CompanionActions;
    readonly settingsDocument: SettingsDocumentActions;
    readonly updateController: UpdateActions;
}
/**
 * Citer's entry on DSH's plugin page: a one-line summary in the list, the full settings on its page.
 * @param view - `summary` for the bundle row, `page` for the bundle's own page.
 */
export declare function CiterPluginConfig(props: CiteCiterSettingsProps & {
    readonly view: 'summary' | 'page';
}): import("react").JSX.Element;
/** Native DSH settings page for Citer preferences. */
export declare function CiteCiterSettings({ useCompanion, useDocument, useUpdate, companion, settingsDocument, updateController }: CiteCiterSettingsProps): import("react").JSX.Element;

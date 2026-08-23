import type { SettingsSectionOwnerProps } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { CompanionFace } from '../companion-controller.ts';
import type { SettingsDocumentController } from '../settings-document.ts';
export interface CiteCiterSettingsProps extends SettingsSectionOwnerProps {
    readonly companion: CompanionFace;
    readonly settingsDocument: SettingsDocumentController;
}
/** Native DSH settings page for CiteCiter-owned preferences. */
export declare function CiteCiterSettings({ companion, settingsDocument }: CiteCiterSettingsProps): import("react").JSX.Element;

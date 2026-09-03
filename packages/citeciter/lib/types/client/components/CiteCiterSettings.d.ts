import type { SettingsSectionOwnerProps } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { CompanionFace } from '../companion-controller.ts';
import type { SettingsDocumentController } from '../settings-document.ts';
import type { UpdateController } from '../update-controller.ts';
export interface CiteCiterSettingsProps extends SettingsSectionOwnerProps {
    readonly companion: CompanionFace;
    readonly settingsDocument: SettingsDocumentController;
    readonly updateController: UpdateController;
}
/** Native DSH settings page for CiteCiter-owned preferences. */
export declare function CiteCiterSettings({ companion, settingsDocument, updateController }: CiteCiterSettingsProps): import("react").JSX.Element;

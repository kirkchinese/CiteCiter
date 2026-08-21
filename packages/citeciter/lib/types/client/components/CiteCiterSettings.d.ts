import type { SettingsSectionOwnerProps } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { CompanionFace } from '../companion-controller.ts';
export interface CiteCiterSettingsProps extends SettingsSectionOwnerProps {
    readonly companion: CompanionFace;
}
/** Native DSH settings page for CiteCiter-owned preferences. */
export declare function CiteCiterSettings({ companion }: CiteCiterSettingsProps): import("react").JSX.Element;

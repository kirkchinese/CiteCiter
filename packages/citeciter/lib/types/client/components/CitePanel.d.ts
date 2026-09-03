import type { CompanionFace } from '../companion-controller.ts';
import type { CiteBus } from '../types.ts';
export interface CitePanelProps {
    readonly bus: CiteBus;
    readonly companion: CompanionFace;
    readonly closePanel: () => void;
    readonly reportParseError: (messageId: string) => void;
}
/**
 * Render the independent Topic workspace on the right edge of the shell.
 * @param props - shared panel bus, Topic controller, and host callbacks.
 * @returns the responsive Topic dock and its dialogs, or null while closed.
 */
export declare function CitePanel({ bus, companion, closePanel, reportParseError }: CitePanelProps): import("react").JSX.Element | null;

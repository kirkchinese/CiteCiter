import type { CompanionFace } from '../companion-controller.ts';
import type { CiteBus } from '../types.ts';
export interface CitePanelProps {
    readonly bus: CiteBus;
    readonly companion: CompanionFace;
    readonly closePanel: () => void;
    readonly reportParseError: (messageId: string) => void;
}
/** Independent learning workspace with a reversible Host-column compatibility adapter. */
export declare function CitePanel({ bus, companion, closePanel, reportParseError }: CitePanelProps): import("react").JSX.Element | null;

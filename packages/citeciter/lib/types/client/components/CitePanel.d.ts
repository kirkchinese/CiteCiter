import type { CompanionFace } from '../companion-controller.ts';
import type { CiteBus } from '../types.ts';
export interface CitePanelProps {
    readonly bus: CiteBus;
    readonly companion: CompanionFace;
    readonly closePanel: () => void;
}
/** Independent, resizable learning workspace docked beside the active coding conversation. */
export declare function CitePanel({ bus, companion, closePanel }: CitePanelProps): import("react").JSX.Element | null;

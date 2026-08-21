import type { CompanionFace } from '../companion-controller.ts';
import type { CiteBus } from '../types.ts';
export interface SelectionMenuProps {
    readonly bus: CiteBus;
    readonly companion: CompanionFace;
    readonly openPanel: () => void;
}
/** Ask the first question beside the selected source text. */
export declare function SelectionMenu({ bus, companion, openPanel }: SelectionMenuProps): import("react").JSX.Element;

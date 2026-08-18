import type { ExplainFace } from '../explainer.ts';
import type { CiteBus, CiteSelection } from '../types.ts';
/** Dependencies injected into the root overlay entry. */
export interface SelectionMenuProps {
    readonly bus: CiteBus;
    readonly explainer: ExplainFace;
    readonly openPanel: (selection?: CiteSelection) => void;
}
/**
 * Render the contextual `Citer!` action and a persistent Thread launcher.
 * @param props - shared selection bus, explainer state, and panel opener.
 * @returns shell-overlay controls.
 */
export declare function SelectionMenu({ bus, explainer, openPanel }: SelectionMenuProps): import("react").JSX.Element;

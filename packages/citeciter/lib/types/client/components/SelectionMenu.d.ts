import type { CiteBus, CiteSelection } from '../types.ts';
/** Dependencies injected into the root overlay entry. */
export interface SelectionMenuProps {
    readonly bus: CiteBus;
    readonly openPanel: (selection: CiteSelection) => void;
}
/**
 * Render the floating `Citer!` menu in the shell overlay.
 * @param props - shared selection bus and panel opener.
 * @returns menu element while a valid selection exists, otherwise null.
 */
export declare function SelectionMenu({ bus, openPanel }: SelectionMenuProps): import("react").JSX.Element | null;

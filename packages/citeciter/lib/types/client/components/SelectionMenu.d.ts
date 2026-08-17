import type { CiteBus, CiteSelection } from '../types.ts';
export interface SelectionMenuProps {
    readonly bus: CiteBus;
    readonly openPanel: (selection: CiteSelection) => void;
}
/** Floating `Citer!` menu rendered through the shell.overlay seat. */
export declare function SelectionMenu({ bus, openPanel }: SelectionMenuProps): import("react").JSX.Element | null;

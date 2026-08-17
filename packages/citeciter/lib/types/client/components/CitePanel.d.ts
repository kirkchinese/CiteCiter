import type { CiteBus } from '../types.ts';
export interface CitePanelProps {
    readonly bus: CiteBus;
    readonly close: () => void;
}
/**
 * Right details-column panel. Milestone 0 renders the resolved selection;
 * the explainer session pipeline (fork, read-only permission switch, prompt,
 * rich-media rendering) attaches in the next milestone.
 */
export declare function CitePanel({ bus, close }: CitePanelProps): import("react").JSX.Element;

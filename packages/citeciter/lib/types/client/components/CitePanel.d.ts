import type { CiteBus } from '../types.ts';
import type { ExplainFace } from '../explainer.ts';
export interface CitePanelProps {
    readonly bus: CiteBus;
    readonly close: () => void;
    readonly explainer: ExplainFace;
}
/** Right details-column panel with the explainer pipeline status. */
export declare function CitePanel({ bus, close, explainer }: CitePanelProps): import("react").JSX.Element;

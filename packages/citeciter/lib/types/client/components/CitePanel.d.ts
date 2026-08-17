import type { CiteBus } from '../types.ts';
import type { ExplainFace } from '../explainer.ts';
/** Dependencies injected into the session-scoped details entry. */
export interface CitePanelProps {
    readonly bus: CiteBus;
    readonly close: () => void;
    readonly explainer: ExplainFace;
}
/**
 * Render the right details-column explanation panel.
 * @param props - selection state, close action, and explainer face.
 * @returns panel element with current status and response.
 */
export declare function CitePanel({ bus, close, explainer }: CitePanelProps): import("react").JSX.Element;

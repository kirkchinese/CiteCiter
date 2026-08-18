import type { ExplainFace } from '../explainer.ts';
/** Dependencies injected into the session-scoped details entry. */
export interface CitePanelProps {
    readonly close: () => void;
    readonly explainer: ExplainFace;
}
/**
 * Render the durable Citation Thread panel.
 * @param props - close action and plugin-owned controller.
 * @returns question composer, transcript, recovery controls, and lifecycle actions.
 */
export declare function CitePanel({ close, explainer }: CitePanelProps): import("react").JSX.Element;

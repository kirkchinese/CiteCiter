import type { LearningExample as Example } from '../../learning-example.ts';
/** Render the explicit example kind; even HTML/SVG source stays literal code. */
export declare function LearningExample({ example }: {
    readonly example: Example;
}): import("react").JSX.Element;

import { type ReactNode } from 'react';
import type { DocumentFormat } from '../../topic.ts';
import type { ActionSource } from '../action-controller.ts';
import type { SelectionSurfaces } from '../wheel-gesture.ts';
/** What a reader selection contributes to an action source. */
export interface DocumentSelection {
    readonly displayText: string;
    readonly prefixText: string;
    readonly suffixText: string;
    readonly line: number;
    /** Source range of the rendered Markdown blocks holding the selection; absent for literal text. */
    readonly sourceRange?: {
        readonly start: number;
        readonly end: number;
    };
}
export interface DocumentViewProps {
    readonly format: DocumentFormat;
    readonly content: string;
    /** Scroll to the piece holding `offset` whenever `revision` changes. */
    readonly focus?: {
        readonly offset: number;
        readonly revision: number;
    } | undefined;
    readonly wrap?: boolean | undefined;
    /** A short line under the meta row, such as how a workspace file is kept. */
    readonly note?: ReactNode;
    readonly registerSurface: SelectionSurfaces['register'];
    /** Turn a selection into the toolbar's action source, or null to ignore it. */
    readonly toSource: (selection: DocumentSelection) => ActionSource | null;
    /** Receives the scrolling element, for hosts that restore scroll positions. */
    readonly scrollRef?: ((element: HTMLElement | null) => void) | undefined;
}
/**
 * Read a document: Markdown is typeset with DSH's Markdown renderer, text and code show line
 * numbers. Long documents render progressively as the reader scrolls. Selecting text offers
 * Citer's toolbar; the selection is mapped back to the exact source, so citations name the
 * passage and its line.
 */
export declare function DocumentView({ format, content, focus, wrap, note, registerSurface, toSource, scrollRef }: DocumentViewProps): import("react").JSX.Element;

import type { DocumentPreviewProps } from '@deepseek-ai/dsh-client-ui-sidebar-documentpreview/client';
import type { ActionSource } from '../action-controller.ts';
import type { SelectionSurfaces } from '../wheel-gesture.ts';
export interface LearningDocumentActions {
    readonly registerSurface: SelectionSurfaces['register'];
    readonly openActions: (source: ActionSource, x: number, y: number) => void;
}
/**
 * Citer's reading view of a workspace file, offered by DSH's file preview next to its own views.
 * DSH owns loading, reload and file navigation; Citer renders the text like a library document.
 */
export declare function NativeLearningDocument({ content, resourceAddress, wrap, scrollportRef, registerSurface }: DocumentPreviewProps & LearningDocumentActions): import("react").JSX.Element;

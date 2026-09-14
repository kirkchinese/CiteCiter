import type { DocumentPreviewProps } from '@deepseek-ai/dsh-client-ui-sidebar-documentpreview/client';
import type { ActionSource } from '../action-controller.ts';
import type { SelectionSurfaces } from '../wheel-gesture.ts';
export interface LearningDocumentActions {
    readonly registerSurface: SelectionSurfaces['register'];
    readonly openActions: (source: ActionSource, x: number, y: number) => void;
}
/** Alternate native document renderer. DSH owns loading, reload and file navigation. */
export declare function NativeLearningDocument({ content, resourceAddress, wrap, scrollportRef, registerSurface, openActions }: DocumentPreviewProps & LearningDocumentActions): import("react").JSX.Element;

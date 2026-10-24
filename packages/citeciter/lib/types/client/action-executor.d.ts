import { type CiteAction, type ActionModel, type PanelPresentation } from '../actions.ts';
import { type ActionSource } from './action-controller.ts';
import type { CompanionFace } from './companion-controller.ts';
import type { DocumentLibraryFace } from './document-library.ts';
/** Where a chosen action goes: the selected Topic by default, or a new Topic when the user asks for one. */
export interface ActionRunOptions {
    readonly newTopic?: boolean;
}
/** Bind explicit Topic and document services. No UI, global listeners or Cordis discovery. */
export declare function createActionExecutor(companion: CompanionFace, documents: Pick<DocumentLibraryFace, 'importText'>, open: (presentation: PanelPresentation) => void): ((source: ActionSource, action: CiteAction, question: string, modelRoute?: ActionModel, options?: ActionRunOptions) => Promise<void>) & {
    quote: (source: ActionSource) => Promise<void>;
};

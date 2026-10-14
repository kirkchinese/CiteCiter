import { type CiteAction, type ActionModel, type PanelPresentation } from '../actions.ts';
import { type ActionSource } from './action-controller.ts';
import type { CompanionFace } from './companion-controller.ts';
import type { ReaderFace } from './reader-controller.ts';
/** Where a chosen action goes: the selected Topic by default, or a new Topic when the user asks for one. */
export interface ActionRunOptions {
    readonly newTopic?: boolean;
}
/** Bind explicit Topic and document services. No UI, global listeners or Cordis discovery. */
export declare function createActionExecutor(companion: CompanionFace, reader: ReaderFace, open: (presentation: PanelPresentation) => void): (source: ActionSource, action: CiteAction, question: string, modelRoute?: ActionModel, options?: ActionRunOptions) => Promise<void>;

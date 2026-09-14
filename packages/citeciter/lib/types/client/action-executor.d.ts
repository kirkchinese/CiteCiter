import type { CiteAction, ActionModel, PanelPresentation } from '../actions.ts';
import { type ActionSource } from './action-controller.ts';
import type { CompanionFace } from './companion-controller.ts';
import type { ReaderFace } from './reader-controller.ts';
/** Bind explicit Topic and document services. No UI, global listeners or Cordis discovery. */
export declare function createActionExecutor(companion: CompanionFace, reader: ReaderFace, open: (presentation: PanelPresentation) => void): (source: ActionSource, action: CiteAction, question: string, modelRoute?: ActionModel) => Promise<void>;

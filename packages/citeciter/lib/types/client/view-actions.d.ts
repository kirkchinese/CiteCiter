/** Plain UI callbacks; subscriptions and disposal remain with the Client plugin. */
import type { CompanionFace } from './companion-controller.ts';
import type { DocumentLibraryFace } from './document-library.ts';
import type { SettingsDocumentController } from './settings-document.ts';
import type { CiteBus } from './types.ts';
import type { UpdateController } from './update-controller.ts';
/** Callbacks the Topic view may invoke. */
export type CompanionActions = Omit<CompanionFace, 'getSnapshot' | 'subscribe' | 'dispose'>;
/** Callbacks the document views may invoke. */
export type LibraryActions = Omit<DocumentLibraryFace, 'getSnapshot' | 'subscribe' | 'dispose'>;
/** Callbacks the settings view may invoke. */
export type SettingsDocumentActions = Omit<SettingsDocumentController, 'getSnapshot' | 'subscribe' | 'dispose'>;
/** Callbacks the update view may invoke. */
export type UpdateActions = Omit<UpdateController, 'getSnapshot' | 'subscribe' | 'dispose'>;
/** Overlay events used by rendered components. */
export type OverlayActions = Pick<CiteBus, 'setPanelOpen' | 'holdTabVisible' | 'setPresentation' | 'requestBoardCitation' | 'clearBoardCitation' | 'closeDocument'>;
/** What the panel can do with Citer's documents; opening goes to the sidebar or the panel itself. */
export interface DocumentActions extends Pick<LibraryActions, 'load' | 'remove' | 'refresh'> {
    /** Open a document, scrolled to a source offset when given. */
    readonly open: (documentId: string, offset?: number) => void;
    /** Import a local file and open it. */
    readonly importFile: (file: File) => Promise<void>;
}
/**
 * Remove lifecycle and subscription methods from a plain controller's view props.
 * @param controller - Client-owned controller with arrow-function callbacks.
 * @returns callbacks separate from the observable supplied to inject.hooks.
 */
export declare function viewActions<T extends {
    getSnapshot(): unknown;
    subscribe(listener: () => void): () => void;
    dispose(): Promise<void>;
}>(controller: T): Omit<T, 'getSnapshot' | 'subscribe' | 'dispose'>;

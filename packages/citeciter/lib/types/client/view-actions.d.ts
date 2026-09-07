/** Plain UI callbacks; subscriptions and disposal remain with the Client plugin. */
import type { CompanionFace } from './companion-controller.ts';
import type { ReaderFace } from './reader-controller.ts';
import type { SettingsDocumentController } from './settings-document.ts';
import type { CiteBus } from './types.ts';
import type { UpdateController } from './update-controller.ts';
/** Callbacks the Topic view may invoke. */
export type CompanionActions = Omit<CompanionFace, 'getSnapshot' | 'subscribe' | 'dispose'>;
/** Callbacks the document view may invoke. */
export type ReaderActions = Omit<ReaderFace, 'getSnapshot' | 'subscribe' | 'dispose'>;
/** Callbacks the settings view may invoke. */
export type SettingsDocumentActions = Omit<SettingsDocumentController, 'getSnapshot' | 'subscribe' | 'dispose'>;
/** Callbacks the update view may invoke. */
export type UpdateActions = Omit<UpdateController, 'getSnapshot' | 'subscribe' | 'dispose'>;
/** Overlay events used by rendered components. */
export type OverlayActions = Pick<CiteBus, 'setMenuSelection' | 'setPanelOpen' | 'requestBoardCitation' | 'clearBoardCitation'>;
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

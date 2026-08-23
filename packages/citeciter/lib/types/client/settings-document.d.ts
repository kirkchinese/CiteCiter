import type { SettingsDescribeFace } from '@deepseek-ai/dsh-client-ui-settings/client';
export interface SettingsDocumentSnapshot {
    status: 'idle' | 'loading' | 'ready' | 'missing' | 'unavailable' | 'error';
    opening: boolean;
    error: string | null;
    message: string | null;
}
export interface SettingsDocumentController {
    getSnapshot(): SettingsDocumentSnapshot;
    subscribe(listener: () => void): () => void;
    load(): Promise<void>;
    open(): Promise<void>;
    dispose(): Promise<void>;
}
/**
 * Create the browser owner for the Host settings-document action.
 * @param describe - mirrored Host settings-document availability.
 * @param openDocument - Host operation that opens the authoritative file.
 * @returns observable loading, availability, and action state.
 */
export declare function createSettingsDocumentController(describe: SettingsDescribeFace, openDocument: (signal: AbortSignal) => Promise<void>): SettingsDocumentController;

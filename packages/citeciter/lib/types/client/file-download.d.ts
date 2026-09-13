import type { NativeComposer } from './native-composer.ts';
/**
 * Download one committed attachment on demand through its owning Session.
 * @param sessionId - the exact Topic that authorizes the attachment read.
 * @param id - the durable native attachment identity.
 * @param name - suggested local filename; never used as a source filesystem path.
 * @param load - native attachment reader, provided by the client controller.
 * @returns the download action and its visible progress/error state.
 * Repeated clicks share one request. Identity changes and unmount cancel UI effects
 * and release the owned object URL without cancelling the host's shared reader.
 */
export declare function useFileDownload(sessionId: string, id: string, name: string, load: NativeComposer['attachment']): {
    download: () => Promise<void>;
    busy: boolean;
    error: string | undefined;
};

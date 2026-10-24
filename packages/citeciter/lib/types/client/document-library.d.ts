import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import type { CiteCiterRequest, CiteCiterResponse, DocumentFormat, DocumentSummary } from '../topic.ts';
export type DocumentLibraryStatus = 'idle' | 'loading' | 'ready' | 'error';
export interface DocumentLibrarySnapshot {
    readonly documents: readonly DocumentSummary[];
    readonly status: DocumentLibraryStatus;
    readonly error: string | null;
    readonly importing: boolean;
    /** Documents deleted in this window; their open views close. */
    readonly deleted: readonly string[];
}
/** One document's complete text, assembled from its pages. */
export interface LoadedDocument {
    readonly documentId: string;
    readonly title: string;
    readonly format: DocumentFormat;
    readonly content: string;
}
export interface DocumentLibraryFace {
    getSnapshot(): DocumentLibrarySnapshot;
    subscribe(listener: () => void): () => void;
    refresh(): Promise<void>;
    /** Save text into the library. Throws when the Host refuses it. */
    importText(title: string, content: string): Promise<DocumentSummary>;
    /** Read a local file and save it; failures show in the library snapshot. */
    importFile(file: Pick<File, 'name' | 'size' | 'text'>): Promise<DocumentSummary | null>;
    remove(documentId: string): Promise<void>;
    /** The whole document, loaded once per document and shared by every view of it. */
    load(documentId: string): Promise<LoadedDocument>;
    /** A known title, for tab chips opened before the document loads. */
    title(documentId: string): string | undefined;
    dispose(): Promise<void>;
}
type RemoteRequest = (request: CiteCiterRequest, signal: AbortSignal) => Promise<RemoteResult<CiteCiterResponse>>;
export declare const INITIAL_DOCUMENT_LIBRARY: DocumentLibrarySnapshot;
/** Bind the library to the Citer Remote. */
export declare function createDocumentLibrary(request: RemoteRequest, store?: import("@deepseek-ai/dsh-client-store").SnapshotStore<DocumentLibrarySnapshot>): DocumentLibraryFace;
export {};

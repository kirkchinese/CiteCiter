import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import type { CiteCiterRequest, CiteCiterResponse, DocumentContent, DocumentSummary } from '../topic.ts';
import type { CompanionFace } from './companion-controller.ts';
import type { ReaderSelection } from './reader-selection.ts';
export type ReaderDocumentsStatus = 'idle' | 'loading' | 'ready' | 'error';
export interface ReaderSnapshot {
    open: boolean;
    documents: readonly DocumentSummary[];
    documentsStatus: ReaderDocumentsStatus;
    active: DocumentContent | null;
    selection: ReaderSelection | null;
    question: string;
    creating: boolean;
    error: string | null;
}
export interface ReaderFace {
    getSnapshot(): ReaderSnapshot;
    subscribe(listener: () => void): () => void;
    setOpen(open: boolean): void;
    refresh(): Promise<void>;
    importFile(name: string, content: string): Promise<DocumentSummary | null>;
    openDocument(documentId: string): Promise<void>;
    setSelection(selection: ReaderSelection | null): void;
    setQuestion(question: string): void;
    createTopic(): Promise<void>;
    dispose(): Promise<void>;
}
type RemoteRequest = (request: CiteCiterRequest, signal: AbortSignal) => Promise<RemoteResult<CiteCiterResponse>>;
/** Initial Reader snapshot. */
export declare function createInitialReaderSnapshot(): ReaderSnapshot;
/** Bind the Reader store to the CiteCiter Remote and the companion Topic creator. */
export declare function createReaderController(request: RemoteRequest, companion: CompanionFace, store?: import("@deepseek-ai/dsh-client-runtime/client").SnapshotStore<ReaderSnapshot>): ReaderFace;
export {};

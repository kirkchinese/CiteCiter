import { type DocumentContent, type DocumentFormat, type DocumentSummary } from './topic.ts';
export { DOCUMENT_CONTENT_MAX_BYTES } from './document-pages.ts';
interface DocumentRecordFile {
    readonly schemaVersion: 1;
    readonly documentId: string;
    readonly title: string;
    readonly format: DocumentFormat;
    readonly size: number;
    readonly importedAt: number;
}
/** Validate and persist one imported text document under the private library. */
export declare class DocumentStore {
    private readonly root;
    private readonly summaries;
    /** @param root - private document library root. */
    constructor(root?: string);
    /** Read validated, immutable metadata without loading the document body. Missing documents return null; successful reads are cached for this store's lifetime. */
    summary(documentId: string): Promise<DocumentSummary | null>;
    /**
     * Persist one imported document and its normalized UTF-8 text.
     * @param input - validated title, format, and content from the import boundary.
     * @returns the durable document summary.
     */
    import(input: {
        readonly title: string;
        readonly format: DocumentFormat;
        readonly content: string;
    }): Promise<DocumentSummary>;
    /**
     * Read one stored document record and its complete normalized text.
     * @param documentId - private document identity.
     * @returns the record and content pair.
     */
    read(documentId: string): Promise<{
        readonly record: DocumentRecordFile;
        readonly content: string;
    }>;
    /** @returns all documents sorted by import time descending. */
    list(): Promise<DocumentSummary[]>;
    /**
     * Return one bounded Reader page.
     * @param documentId - private document identity.
     * @param pageIndex - zero-based page; omitted requests the first page. Out-of-range pages are rejected.
     * @returns a UTF-8-budgeted page and the total page count; Unicode code points are never split.
     */
    get(documentId: string, pageIndex?: number): Promise<DocumentContent>;
}

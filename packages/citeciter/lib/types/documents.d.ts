import { type DocumentContent, type DocumentFormat, type DocumentSummary } from './topic.ts';
/** Reader page budget keeps one document-get response comfortably bounded. */
export declare const DOCUMENT_CONTENT_MAX_BYTES: number;
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
    /** @param root - private document library root. */
    constructor(root?: string);
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
     * @returns the first content window, truncated when the text exceeds the page budget.
     */
    get(documentId: string): Promise<DocumentContent>;
}
export {};

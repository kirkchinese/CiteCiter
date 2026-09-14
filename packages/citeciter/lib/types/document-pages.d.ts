/** Shared Host/Client page budget; full text stays in the document owner. */
export declare const DOCUMENT_CONTENT_MAX_BYTES: number;
/** Split UTF-8 text without breaking code points; concatenation exactly reproduces the input. */
export declare function documentPages(content: string): string[];

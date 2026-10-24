/** Shared Host/Client page budget; full text stays in the document owner. */
export declare const DOCUMENT_CONTENT_MAX_BYTES: number;
/** @returns the one-based line holding `offset` (UTF-16 code units) of `content`. */
export declare function lineAtOffset(content: string, offset: number): number;
/** Split UTF-8 text without breaking code points; concatenation exactly reproduces the input. */
export declare function documentPages(content: string): string[];

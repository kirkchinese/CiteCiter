/** Addresses of Citer's library documents in DSH's right sidebar. */
/** Tab type id and kind of Citer's document tabs. */
export declare const DOCUMENT_TAB_ID = "@kirkchinese/dsh-citeciter/document";
export declare const DOCUMENT_TAB_KIND = "citeciter-document";
/** Glob the document tab type claims. */
export declare const DOCUMENT_ADDRESS_PATTERN = "dsh-resource://citeciter-document/**";
/** @returns the sidebar address of one library document. */
export declare function documentAddress(documentId: string): string;
/** @returns the document id of a Citer document address, or undefined for any other address. */
export declare function documentIdFromAddress(address: string): string | undefined;

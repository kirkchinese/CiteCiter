import type { ActionSource } from './action-controller.ts';
import type { ReaderSelection } from './reader-selection.ts';
/** Decode a complete Host-owned preview buffer. Reject binary, partial and oversized imports. */
export declare function decodeNativeText(content: {
    readonly kind: 'text';
    readonly text: string;
    readonly eof: boolean;
} | {
    readonly kind: 'bytes';
    readonly data: Uint8Array;
}): string;
/** Capture the file address's own Session and immutable text, never the later active tab. */
export declare function nativeDocumentSource(address: string, content: string, selection: ReaderSelection): ActionSource;

import type { ActionSource } from './action-controller.ts';
import type { DocumentSelection } from './components/DocumentView.tsx';
import type { DocumentPreviewProps } from '@deepseek-ai/dsh-client-ui-sidebar-documentpreview/client';
/** Decode a complete Host-owned preview buffer. Reject binary, partial and oversized imports. */
export declare function decodeNativeText(content: DocumentPreviewProps['content']): string;
/** Capture the file address's own Session and immutable text, never the later active tab. */
export declare function nativeDocumentSource(address: string, content: string, selection: DocumentSelection): ActionSource;

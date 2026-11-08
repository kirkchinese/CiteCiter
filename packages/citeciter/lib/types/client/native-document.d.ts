import { SessionId } from '@deepseek-ai/dsh-session/types';
import type { ActionSource } from './action-controller.ts';
import type { DocumentSelection } from './components/DocumentView.tsx';
import type { DocumentPreviewProps } from '@deepseek-ai/dsh-client-ui-sidebar-documentpreview/client';
/** Decode a complete Host-owned preview buffer. Reject binary, partial and oversized imports. */
export declare function decodeNativeText(content: DocumentPreviewProps['content']): string;
/**
 * Capture the file's Session and immutable text. A file read through a Session belongs to that Session;
 * a file opened by its absolute path belongs to no Session, so it is asked about in the conversation on screen.
 * @param onScreen - the main conversation on screen, or null when none is.
 */
export declare function nativeDocumentSource(address: string, content: string, selection: DocumentSelection, onScreen: SessionId | null): ActionSource;

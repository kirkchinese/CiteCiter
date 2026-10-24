import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store';
import type { UseSidebarRightTabInfo } from '@deepseek-ai/dsh-client-ui-sidebar-right/client';
import type { DocumentLibrarySnapshot } from '../document-library.ts';
import { type LibraryDocumentProps } from './LibraryDocument.tsx';
declare module '@deepseek-ai/dsh-client-ui-sidebar-right/client' {
    interface SidebarRightResourceParamsMap {
        /** Where to open a Citer document: the source offset to scroll to. */
        citeciterDocument: {
            readonly offset?: number;
        };
    }
}
/**
 * A Citer library document as a DSH right-sidebar tab. Reopening it scrolls to the new place;
 * deleting the document closes the tab.
 */
export declare function DocumentTab({ useTabInfo, useLibrary, ...props }: Omit<LibraryDocumentProps, 'documentId' | 'focus'> & {
    readonly useTabInfo: UseSidebarRightTabInfo;
    readonly useLibrary: SnapshotSelectorHook<DocumentLibrarySnapshot>;
}): import("react").JSX.Element;

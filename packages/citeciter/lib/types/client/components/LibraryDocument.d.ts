import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { DocumentLibraryFace } from '../document-library.ts';
import type { SelectionSurfaces } from '../wheel-gesture.ts';
export interface LibraryDocumentProps {
    readonly documentId: string;
    readonly focus?: {
        readonly offset: number;
        readonly revision: number;
    } | undefined;
    readonly library: Pick<DocumentLibraryFace, 'load'>;
    readonly registerSurface: SelectionSurfaces['register'];
    /** The source conversation questions about this document belong to, when one is open. */
    readonly sourceSessionId: () => SessionId | null;
}
/** One document of Citer's library, loaded once and read in the shared document view. */
export declare function LibraryDocument({ documentId, focus, library, registerSurface, sourceSessionId }: LibraryDocumentProps): import("react").JSX.Element;

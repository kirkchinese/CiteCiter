import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store';
import type { TopicSummary } from '../../topic.ts';
import type { DocumentLibrarySnapshot } from '../document-library.ts';
import type { DocumentActions } from '../view-actions.ts';
import { type TopicMenu } from './TopicActions.tsx';
/** Which page of the list popover is showing. */
export type ListPage = 'topics' | 'documents';
/** Ask the list to open on a page; `revision` changes on every request. */
export interface ListRequest {
    readonly page: ListPage;
    readonly revision: number;
}
/** Topic list and Citer's documents, with the new-Topic button and the Topic menu. Receives rows and callbacks, without service discovery. */
export declare function TopicNavigation({ topics, activeId, archived, onOpen, onNew, onArchiveView, menu, useLibrary, documents, listRequest }: {
    readonly topics: readonly TopicSummary[];
    readonly activeId: string | undefined;
    readonly archived: boolean;
    readonly onOpen: (id: string) => void;
    readonly onNew: () => void;
    readonly onArchiveView: (archived: boolean) => void;
    readonly menu: TopicMenu;
    readonly useLibrary: SnapshotSelectorHook<DocumentLibrarySnapshot>;
    readonly documents: DocumentActions;
    readonly listRequest?: ListRequest | undefined;
}): import("react").JSX.Element;

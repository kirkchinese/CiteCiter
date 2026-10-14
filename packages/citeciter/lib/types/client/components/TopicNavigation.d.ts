import type { TopicSummary } from '../../topic.ts';
import { type TopicMenu } from './TopicActions.tsx';
/** Topic list with search, new Topic and the Topic menu. Receives domain rows and callbacks, without service discovery. */
export declare function TopicNavigation({ topics, activeId, archived, onOpen, onNew, onArchiveView, menu }: {
    readonly topics: readonly TopicSummary[];
    readonly activeId: string | undefined;
    readonly archived: boolean;
    readonly onOpen: (id: string) => void;
    readonly onNew: () => void;
    readonly onArchiveView: (archived: boolean) => void;
    readonly menu: TopicMenu;
}): import("react").JSX.Element;

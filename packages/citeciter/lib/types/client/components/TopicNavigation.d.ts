import type { TopicSummary } from '../../topic.ts';
/** Session-list navigation with search. Receives domain rows and callbacks, without service discovery. */
export declare function TopicNavigation({ topics, activeId, archived, onOpen, onNew, onArchiveView, onSettings, onReader }: {
    readonly topics: readonly TopicSummary[];
    readonly activeId: string | undefined;
    readonly archived: boolean;
    readonly onOpen: (id: string) => void;
    readonly onNew: () => void;
    readonly onArchiveView: (archived: boolean) => void;
    readonly onSettings: () => void;
    readonly onReader: () => void;
}): import("react").JSX.Element;

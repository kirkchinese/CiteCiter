/** Everything the Topic menu offers; callbacks own their dialogs and services. */
export interface TopicMenu {
    readonly topic: {
        readonly archived: boolean;
    } | undefined;
    readonly busy: boolean;
    readonly learningRoute: boolean;
    /** Whether ordinary context (runtime, time, skills, system prompt) is listed in the transcript. */
    readonly allContext: boolean;
    readonly onAllContext: (shown: boolean) => void;
    readonly onRename: () => void;
    readonly onLearningRoute: (enabled: boolean) => void;
    readonly onReader: () => void;
    readonly onArchive: (archived: boolean) => void;
    readonly onDelete: () => void;
}
/** The "⋯" menu in the host's menu: rename, learning route, document reader, context visibility, archive and permanent deletion. */
export declare function TopicActions({ menu }: {
    readonly menu: TopicMenu;
}): import("react").JSX.Element;

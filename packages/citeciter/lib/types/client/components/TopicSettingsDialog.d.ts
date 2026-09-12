/**
 * Render infrequent Topic management separately from the learning composer.
 * @param props - current identity, operation status and management callbacks.
 * @returns a controlled dialog; renaming keeps its draft until this Topic changes.
 */
export declare function TopicSettingsDialog({ open, topic, renaming, archiving, deleting, error, onClose, onRename, onArchive, onDelete }: {
    readonly open: boolean;
    readonly topic: {
        readonly sessionId: string;
        readonly title: string;
        readonly archived: boolean;
    } | undefined;
    readonly renaming: boolean;
    readonly archiving: boolean;
    readonly deleting: boolean;
    readonly error: string | null;
    readonly onClose: () => void;
    readonly onRename: (title: string) => Promise<boolean>;
    readonly onArchive: (archived: boolean) => Promise<boolean>;
    readonly onDelete: () => void;
}): import("react").JSX.Element;

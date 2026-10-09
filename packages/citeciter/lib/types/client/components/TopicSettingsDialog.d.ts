/**
 * Render infrequent Topic management separately from the learning composer.
 * @param props - current identity, operation status and management callbacks.
 * @returns a controlled dialog for archiving and permanent deletion.
 */
export declare function TopicSettingsDialog({ open, topic, archiving, deleting, error, onClose, onArchive, onDelete }: {
    readonly open: boolean;
    readonly topic: {
        readonly sessionId: string;
        readonly title: string;
        readonly archived: boolean;
    } | undefined;
    readonly archiving: boolean;
    readonly deleting: boolean;
    readonly error: string | null;
    readonly onClose: () => void;
    readonly onArchive: (archived: boolean) => Promise<boolean>;
    readonly onDelete: () => void;
}): import("react").JSX.Element;

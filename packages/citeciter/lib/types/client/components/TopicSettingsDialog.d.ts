/**
 * Render infrequent Topic management separately from the learning composer.
 * @param props - current identity, operation status and management callbacks.
 * @returns a controlled dialog; deletion is enabled only for legacy private logs or verified Citer-owned source storage.
 */
export declare function TopicSettingsDialog({ open, topic, archiving, deleting, error, onClose, onArchive, onDelete }: {
    readonly open: boolean;
    readonly topic: {
        readonly sessionId: string;
        readonly title: string;
        readonly archived: boolean;
        readonly hosted?: boolean | undefined;
        readonly storage?: 'source' | undefined;
    } | undefined;
    readonly archiving: boolean;
    readonly deleting: boolean;
    readonly error: string | null;
    readonly onClose: () => void;
    readonly onArchive: (archived: boolean) => Promise<boolean>;
    readonly onDelete: () => void;
}): import("react").JSX.Element;

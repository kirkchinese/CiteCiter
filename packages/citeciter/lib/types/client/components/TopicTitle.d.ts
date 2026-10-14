/**
 * Inline rename committed by Enter or blur, cancelled by Escape. Double-click, F2 or a
 * changed `renameRequest` (the Topic menu) start editing.
 */
export declare function TopicTitle({ id, title, onRename, renameRequest }: {
    readonly id: string;
    readonly title: string;
    readonly onRename: (title: string) => Promise<boolean>;
    readonly renameRequest?: number;
}): import("react").JSX.Element;

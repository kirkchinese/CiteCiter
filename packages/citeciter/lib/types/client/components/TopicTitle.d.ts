/** Inline rename committed by Enter or blur, cancelled by Escape. Double-click and F2 start editing. */
export declare function TopicTitle({ id, title, onRename }: {
    readonly id: string;
    readonly title: string;
    readonly onRename: (title: string) => Promise<boolean>;
}): import("react").JSX.Element;

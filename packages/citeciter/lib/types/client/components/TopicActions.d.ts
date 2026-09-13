/** Workspace actions remain reachable without a floating launcher over the composer. Callbacks own their dialogs and services. */
export declare function TopicActions({ hasTopic, onSettings, onReader }: {
    readonly hasTopic: boolean;
    readonly onSettings: () => void;
    readonly onReader: () => void;
}): import("react").JSX.Element;

import type { TopicMessage } from '../../topic.ts';
/** Optional native todo projection. The user toggles planning; the model owns plan contents. */
export declare function LearningRoute({ enabled, messages, onChange }: {
    readonly enabled: boolean;
    readonly messages: readonly TopicMessage[];
    readonly onChange: (enabled: boolean) => void;
}): import("react").JSX.Element;

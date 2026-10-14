import type { TopicMessage } from '../../topic.ts';
/** Progress of the optional learning route. It is switched in the Topic menu; the model owns the plan. */
export declare function LearningRoute({ enabled, messages }: {
    readonly enabled: boolean;
    readonly messages: readonly TopicMessage[];
}): import("react").JSX.Element | null;

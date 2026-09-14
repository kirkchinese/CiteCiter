import { type LearningCardsProjection } from '../../learning.ts';
/** Read the latest durable Topic card set. Recall affects display only and never schedules work. */
export declare function LearningCards({ projection, recall, setRecall, disabled, topicTitle, topicId, source, onRevise }: {
    readonly projection: LearningCardsProjection;
    readonly recall: boolean;
    readonly setRecall: (value: boolean) => void;
    readonly disabled: boolean;
    readonly topicTitle: string;
    readonly topicId: string;
    readonly source: string;
    readonly onRevise: () => void;
}): import("react").JSX.Element;

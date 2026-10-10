import { type RefObject } from 'react';
import type { AskUserQuestionAnswer } from '@deepseek-ai/dsh-user-questions';
import type { PendingQuestion } from '../../topic.ts';
import type { QuestionInteraction } from '../question-interaction.ts';
import type { QuestionDraftController } from '../question-draft-controller.ts';
export interface QuestionCardProps {
    readonly pending: {
        readonly key: string;
        readonly questions: readonly PendingQuestion['questions'][number][];
    };
    readonly onAnswer: (answer: AskUserQuestionAnswer) => Promise<unknown>;
    readonly onCancel: () => Promise<unknown>;
    readonly interaction?: QuestionInteraction;
    readonly surface?: RefObject<HTMLFormElement>;
    readonly draftStore?: QuestionDraftController | undefined;
}
/** Collect one standard DSH ask_user_question answer batch inside the private Topic. */
export declare function QuestionCard({ onAnswer, onCancel, pending, interaction, surface, draftStore }: QuestionCardProps): import("react").JSX.Element | null;

import type { AskUserQuestionAnswer } from '@deepseek-ai/dsh-user-questions';
import type { PendingQuestion } from '../../topic.ts';
export interface QuestionCardProps {
    readonly pending: {
        readonly key: string;
        readonly questions: readonly (PendingQuestion['questions'][number] & {
            readonly detail?: string;
        })[];
    };
    readonly onAnswer: (answer: AskUserQuestionAnswer) => Promise<unknown>;
    readonly onCancel: () => Promise<unknown>;
}
/** Collect one standard DSH ask_user_question answer batch inside the private Topic. */
export declare function QuestionCard({ onAnswer, onCancel, pending }: QuestionCardProps): import("react").JSX.Element | null;

import type { CompanionFace } from '../companion-controller.ts';
import type { PendingQuestion } from '../../topic.ts';
export interface QuestionCardProps {
    readonly companion: CompanionFace;
    readonly pending: PendingQuestion;
}
/** Collect one standard DSH ask_user_question answer batch inside the private Topic. */
export declare function QuestionCard({ companion, pending }: QuestionCardProps): import("react").JSX.Element | null;

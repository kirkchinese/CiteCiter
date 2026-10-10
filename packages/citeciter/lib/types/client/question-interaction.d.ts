import { type RefObject } from 'react';
import type { PendingQuestion } from '@deepseek-ai/dsh-client-ui-user-questions/client';
import type { AskUserQuestionAnswerItem } from '@deepseek-ai/dsh-user-questions';
/** Host-owned question lifecycle projected into a service-independent answer form. */
export interface QuestionInteraction {
    readonly state: 'open' | 'continued';
    readonly channel: 'waterfall' | 'rpc' | 'none';
    readonly closed: boolean;
    readonly review: readonly AskUserQuestionAnswerItem[] | undefined;
    readonly dismissLabel: string;
    readonly status: string | undefined;
    readonly canTakeTime: boolean;
    readonly allowSkip: boolean;
    focus(): void;
    blur(): void;
    edit(): void;
    takeTime(): void;
}
/**
 * Keep the native carrier responsible for its timeout and late-reply channel.
 * Focus pauses only a pristine countdown; the first edit asks the Host to wait.
 * @param pending - the current Host carrier, never a copied question record.
 * @returns the form lifecycle and a ref identifying its answer surface.
 */
export declare function useNativeQuestionInteraction(pending: Pick<PendingQuestion, 'subscribe' | 'getSnapshot' | 'review' | 'dismissal' | 'holdFocus' | 'releaseFocus' | 'engage' | 'takeTime'> & {
    readonly callId?: string | undefined;
    readonly kind?: string | undefined;
    readonly allowSkip?: boolean;
    readonly interrupted?: boolean;
}): {
    readonly interaction: QuestionInteraction;
    readonly surface: RefObject<HTMLFormElement>;
};

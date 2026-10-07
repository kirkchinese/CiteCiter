import type { AskUserQuestionAnswer } from '@deepseek-ai/dsh-user-questions';
import type { PendingQuestion as HostQuestion } from '@deepseek-ai/dsh-client-ui-user-questions/client';
import type { PendingQuestion } from '../topic.ts';
export interface QuestionDraftAnswer {
    readonly selected: readonly string[];
    readonly custom: string;
}
export type QuestionDraft = Readonly<Record<string, QuestionDraftAnswer>>;
type HostSnapshot = ReturnType<HostQuestion['getSnapshot']>;
export type TopicQuestionSnapshot = HostSnapshot & {
    readonly hidden: boolean;
    readonly error: string | undefined;
};
interface WaitClaim extends AsyncIterable<{
    remainingMs: number;
}> {
    dispose(): void;
}
export interface TopicQuestionChannel {
    claim(callId: string, signal: AbortSignal): WaitClaim;
    answer(key: string, answer: AskUserQuestionAnswer): Promise<void>;
    cancel(key: string): Promise<void>;
    timeout(key: string): Promise<void>;
}
/**
 * Private Topic presentation of the Host's foreground question protocol.
 * This controller outlives its React card: hidden cards keep counting, and a
 * disconnected Client releases its public Host claim instead of pinning a run.
 */
export declare class TopicQuestionController {
    private readonly channel;
    readonly review: undefined;
    readonly dismissal: 'hide' | 'cancel';
    private pending;
    private readonly lifetime;
    private readonly listeners;
    private timer;
    private claim;
    private started;
    private ended;
    private deadline;
    private remaining;
    private focused;
    private edited;
    private held;
    private closed;
    private hidden;
    private failure;
    private draft;
    private snapshot;
    constructor(pending: PendingQuestion, channel: TopicQuestionChannel);
    readonly subscribe: (listener: () => void) => (() => void);
    readonly getSnapshot: () => TopicQuestionSnapshot;
    get callId(): string | undefined;
    getDraft(): QuestionDraft;
    setDraft(draft: QuestionDraft): void;
    /** Reconcile the private Host snapshot; an older open frame cannot undo continuation. */
    sync(pending: PendingQuestion): void;
    private attach;
    private read;
    private publish;
    /** Focus freezes only an untouched countdown; blur resumes the remaining duration. */
    holdFocus(): void;
    releaseFocus(): void;
    /** The first actual edit keeps this Client's answerable foreground wait open. */
    engage(): void;
    takeTime(): void;
    private timeout;
    answer(answer: AskUserQuestionAnswer): Promise<void>;
    dismiss(): Promise<void>;
    reveal(): void;
    private close;
    /** Called when the native composer is disposed or a fresh Host snapshot drops this call. */
    dispose(): void;
}
export {};

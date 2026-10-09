import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { ToolCallId } from '@deepseek-ai/dsh-llm/brand';
import type { AskUserQuestionAnswer, AskUserQuestionItem, AskUserQuestionRequest } from '@deepseek-ai/dsh-user-questions';
import type { PendingQuestion, QuestionAnswer } from './topic.ts';
/** Keep late replies inside an explicitly injected contribution owned by the exact Topic Agent. */
export declare class TopicQuestionReplies {
    private readonly replies;
    private readonly recoveredReplies;
    /**
     * Bind the official answer service in a child of the Topic contribution scope.
     * @param ctx - Topic-owned contribution context; its teardown releases this binding.
     * @param agent - Exact live Agent receiving replies, never a Host list lookup.
     */
    attach(ctx: Context, agent: Agent): Promise<void>;
    /** Route a continued answer through its live injected service; absence must never recreate the Agent. */
    answer(agent: Agent, callId: ToolCallId, answer: AskUserQuestionAnswer): boolean;
    /** A queued answer is hidden until the Host admits or explicitly discards it. */
    isQueued(agent: Agent, callId: string): boolean;
    /**
     * Manually continue an interrupted legacy ask through the public Agent Inbox.
     * The old tool result remains intact; the new, durable user message names the
     * original call and preserves its question/answer batch for model replay.
     * Caller validates the exact recovered question and holds Topic admission/CAS.
     */
    answerRecoveredBlocking(agent: Agent, question: PendingQuestion, answer: AskUserQuestionAnswer): void;
}
/** A named Host call keeps one answer identity across the foreground/continued boundary. */
export declare function questionKey(sessionId: string, callId: string): string;
/** Copy only the public question presentation, including supporting plan/detail text. */
export declare function questionPresentation(questions: readonly AskUserQuestionItem[]): PendingQuestion['questions'];
/** Project a live private waterfall without assuming that every question blocks indefinitely. */
export declare function openQuestion(key: string, questions: readonly AskUserQuestionItem[], wait: AskUserQuestionRequest['wait'], callId?: string): PendingQuestion;
/**
 * Read the Host's durable question projection for this exact owned Agent.
 * Replies already in its native Inbox are excluded until admitted/discarded.
 * No Session is registered in the Host list and no log format is rewritten.
 */
export declare function continuedQuestions(agent: Agent): PendingQuestion[];
/**
 * Validate a complete answer against the exact Host question before it is submitted.
 * @param questions - the pending question items.
 * @param answer - one answer per question.
 * @param allowSkipped - whether an unanswered optional item may be submitted empty.
 * @returns the answer in the Host's format.
 */
export declare function validateQuestionAnswer(questions: readonly {
    readonly id: string;
    readonly options?: readonly {
        readonly label: string;
    }[] | undefined;
    readonly multiSelect?: boolean | undefined;
}[], answer: QuestionAnswer, allowSkipped?: boolean): AskUserQuestionAnswer;

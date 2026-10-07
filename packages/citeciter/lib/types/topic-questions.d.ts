import type { Agent } from '@deepseek-ai/dsh-agent';
import type { AskUserQuestionItem, AskUserQuestionRequest } from '@deepseek-ai/dsh-user-questions';
import type { PendingQuestion } from './topic.ts';
/** A named Host call keeps one answer identity across the foreground/continued boundary. */
export declare function questionKey(sessionId: string, callId: string): string;
/** Copy only the public question presentation, including supporting plan/detail text. */
export declare function questionPresentation(questions: readonly AskUserQuestionItem[]): PendingQuestion['questions'];
/** Project a live private waterfall without assuming that every question blocks indefinitely. */
export declare function openQuestion(key: string, questions: readonly AskUserQuestionItem[], wait: AskUserQuestionRequest['wait']): PendingQuestion;
/**
 * Read the Host's durable question projection for this exact owned Agent.
 * Replies already in its native Inbox are excluded until admitted/discarded.
 * No Session is registered in the Host list and no log format is rewritten.
 */
export declare function continuedQuestions(agent: Agent): PendingQuestion[];

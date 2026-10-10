import { z } from 'zod';
/** Client-safe presentation of a durable late answer; the original model payload stays in the Session log. */
export declare const questionReplySchema: z.ZodObject<{
    callId: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        question: z.ZodString;
        header: z.ZodOptional<z.ZodString>;
        values: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type QuestionReply = z.infer<typeof questionReplySchema>;
/**
 * Read the official late-answer payload at the persisted-data boundary.
 * @param text - Text of one committed user-question-reply message.
 * @param callId - Identity from the message source, which the payload must match.
 * @returns Question/answer pairs, or an empty presentation for unreadable history; never raw internal JSON.
 */
export declare function readQuestionReply(text: string, callId: string): QuestionReply;
/** Human-readable transcript text for copying and other plain-text consumers. */
export declare function questionReplyText(reply: QuestionReply): string;
/** Derived tool-row summary; never replaces the original recorded tool result. */
export declare function questionReplySummary(reply: QuestionReply): string;

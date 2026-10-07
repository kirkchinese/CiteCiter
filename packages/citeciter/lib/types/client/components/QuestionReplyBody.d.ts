import type { QuestionReply } from '../../question-reply.ts';
/** Show the user's recorded choices as text, without interpreting their answer as Markdown or replaying internal prompts. */
export declare function QuestionReplyBody({ reply }: {
    readonly reply: QuestionReply;
}): import("react").JSX.Element;

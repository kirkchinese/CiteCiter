import type { QuestionReply } from '../../question-reply.ts';
/**
 * Read-only presentation of a committed user message. Attachments remain inspectable as reference
 * chips and formulas are rendered without mutating the durable prompt. A learning-stage prompt
 * collapses to its stage line and the user's own question.
 */
export declare function UserMessageBody({ text, questionReply, sourceTitle, stageClassName }: {
    readonly text: string;
    readonly questionReply?: QuestionReply | undefined;
    readonly sourceTitle?: ((sessionId: string) => string | undefined) | undefined;
    readonly stageClassName?: string | undefined;
}): import("react").JSX.Element;

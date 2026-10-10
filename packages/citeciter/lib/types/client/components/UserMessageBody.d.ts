import type { QuestionReply } from '../../question-reply.ts';
/** Read-only presentation of a committed user message. Attachments remain inspectable and formulas are rendered without mutating the durable prompt. */
export declare function UserMessageBody({ text, questionReply }: {
    readonly text: string;
    readonly questionReply?: QuestionReply | undefined;
}): import("react").JSX.Element;

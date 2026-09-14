/** Read-only presentation of a committed user message. Attachments remain inspectable and formulas are rendered without mutating the durable prompt. */
export declare function UserMessageBody({ text }: {
    readonly text: string;
}): import("react").JSX.Element;

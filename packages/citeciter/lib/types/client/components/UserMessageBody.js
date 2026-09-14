import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { parseSentReferences } from "../draft-references.js";
import { ReferenceAttachments } from "./ReferenceAttachments.js";
import { RichAnswer } from "./RichAnswer.js";
/** Read-only presentation of a committed user message. Attachments remain inspectable and formulas are rendered without mutating the durable prompt. */
export function UserMessageBody({ text }) {
    const { question, references } = parseSentReferences(text);
    return _jsxs(_Fragment, { children: [references.length > 0 && _jsx(ReferenceAttachments, { references: references }), question !== '' && _jsx(RichAnswer, { text: question, streaming: false })] });
}

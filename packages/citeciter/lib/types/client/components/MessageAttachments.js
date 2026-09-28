import { jsx as _jsx } from "react/jsx-runtime";
import { MessageFile } from "./MessageFile.js";
import { MessageImage } from "./MessageImage.js";
import css from './MessageAttachments.module.css';
/** Render durable native attachments with a session-authorized loader and owned object URLs. */
export function MessageAttachments({ sessionId, attachments, load }) {
    return _jsx("div", { className: css.attachments, children: attachments.map(item => item.kind === 'image' ? _jsx(MessageImage, { sessionId: sessionId, attachment: item, load: load }, item.id) : _jsx(MessageFile, { sessionId: sessionId, attachment: item, load: load }, item.id)) });
}

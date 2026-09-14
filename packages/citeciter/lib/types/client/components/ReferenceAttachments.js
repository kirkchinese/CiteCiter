import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { draftReferenceName } from "../draft-references.js";
import { RichAnswer } from "./RichAnswer.js";
import css from './ReferenceAttachments.module.css';
/** Removable draft chips and rendered previews. No model calls or source reads. */
export function ReferenceAttachments({ references, onRemove }) {
    const [expanded, setExpanded] = useState(null);
    const current = references.find(reference => reference.id === expanded);
    return _jsxs("div", { className: css.attachments, children: [_jsx("div", { className: css.rail, "aria-label": onRemove === undefined ? '已发送引用附件' : '待发送引用附件', children: references.map(reference => _jsxs("div", { className: css.chip, children: [onRemove !== undefined && _jsx("button", { type: "button", title: "\u79FB\u9664\u9644\u4EF6", "aria-label": `移除${reference.label}`, onClick: () => onRemove(reference.id), children: "\u00D7" }), _jsxs("button", { type: "button", title: reference.kind === 'source' ? reference.content : reference.label, "aria-label": draftReferenceName(reference) === reference.label ? reference.label : `${reference.label}：${draftReferenceName(reference)}`, "aria-expanded": expanded === reference.id, onClick: () => setExpanded(expanded === reference.id ? null : reference.id), children: [_jsx("span", { "aria-hidden": "true", children: reference.kind === 'source' ? '↳' : reference.kind === 'board' ? '▧' : '❝' }), " ", draftReferenceName(reference)] })] }, reference.id)) }), current !== undefined && _jsxs("div", { className: css.preview, children: [current.address !== undefined && _jsx("code", { children: current.address }), current.kind === 'source' ? _jsx("p", { children: current.content }) : _jsx(RichAnswer, { text: current.content, streaming: false })] })] });
}

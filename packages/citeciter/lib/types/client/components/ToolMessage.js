import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { DisclosureRow, JsonTree } from '@deepseek-ai/dsh-client-ui-primitives';
import { IconQuestionOutlineMedium, IconSparkleMedium } from "../host-icons.js";
import { jsonTreeLabels } from "../copy.js";
import { MessageAttachments } from "./MessageAttachments.js";
import css from './CiteCiter.module.css';
function compactPreview(text, limit = 120) {
    const compact = text.replaceAll(/\s+/g, ' ').trim();
    return compact.length > limit ? compact.slice(0, limit) + '…' : compact;
}
function jsonObject(text) {
    try {
        const value = JSON.parse(text);
        return typeof value === 'object' && value !== null ? value : null;
    }
    catch {
        // Plain text tool output is expected and is rendered without JSON parsing.
        return null;
    }
}
function FlowDisclosure({ icon, title, summary, running = false, children, }) {
    const [open, setOpen] = useState(false);
    return (_jsx(DisclosureRow, { className: css.flowDisclosure, rowClassName: running ? css.flowRowRunning : css.flowRow, icon: icon, title: title, open: open, expandable: true, expandOnRowClick: true, onToggle: () => setOpen(!open), collapsedContent: _jsxs(_Fragment, { children: [_jsx("span", { className: css.flowDot, children: "\u00B7" }), _jsx("span", { className: css.flowSummary, children: summary })] }), children: children }));
}
/** Show returned files immediately while keeping diagnostic arguments and results collapsible. */
export function ToolRow({ message, sessionId, load }) {
    const args = jsonObject(message.arguments);
    const result = message.result === null ? null : jsonObject(message.result);
    const summary = message.running
        ? compactPreview(message.arguments)
        : message.isError
            ? '调用失败'
            : compactPreview(message.result || ((message.attachments?.length ?? 0) > 0 ? '附件已返回' : '完成'));
    return (_jsxs("div", { "data-citeciter-message": message.id, children: [_jsx(FlowDisclosure, { icon: message.name === 'ask_user_question' ? _jsx(IconQuestionOutlineMedium, {}) : _jsx(IconSparkleMedium, {}), title: message.name, summary: summary, running: message.running, children: _jsxs("div", { className: css.toolPreview, children: [_jsx("strong", { children: "\u53C2\u6570" }), args === null ? _jsx("pre", { children: message.arguments }) : _jsx(JsonTree, { data: args, label: "\u5DE5\u5177\u53C2\u6570", copyable: false, labels: jsonTreeLabels }), message.result !== null && (_jsxs(_Fragment, { children: [_jsx("strong", { children: message.isError ? '错误' : '结果' }), result === null
                                    ? _jsx("pre", { children: message.result })
                                    : _jsx(JsonTree, { data: result, label: "\u5DE5\u5177\u7ED3\u679C", copyable: false, labels: jsonTreeLabels })] }))] }) }), _jsx(MessageAttachments, { sessionId: sessionId, attachments: message.attachments ?? [], load: load })] }));
}

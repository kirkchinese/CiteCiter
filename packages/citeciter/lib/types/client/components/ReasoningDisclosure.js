import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { DisclosureRow, IconThinkOutline14, MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives';
import { markdownLabels } from "../copy.js";
import css from './ReasoningDisclosure.module.css';
/** Display only reasoning actually returned by the model. Expansion is local UI state; no model call or Session mutation occurs. */
export function ReasoningDisclosure({ text, active }) {
    const [open, setOpen] = useState(false);
    const preview = useMemo(() => text.replaceAll(/\s+/gu, ' ').trim().slice(0, 180), [text]);
    return (_jsx(DisclosureRow, { className: css.disclosure, rowClassName: active ? css.activeRow : css.row, icon: _jsx(IconThinkOutline14, {}), title: active ? '思考中' : '思考', open: open, expandable: true, expandOnRowClick: true, onToggle: () => setOpen(value => !value), collapsedContent: _jsxs("span", { className: css.preview, children: ["\u00B7 ", preview] }), children: _jsx("div", { className: css.body, children: _jsx(MarkdownText, { text: text, streaming: active, labels: markdownLabels }) }) }));
}

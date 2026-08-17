import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import css from './CiteCiter.module.css';
/**
 * Right details-column panel. Milestone 0 renders the resolved selection;
 * the explainer session pipeline (fork, read-only permission switch, prompt,
 * rich-media rendering) attaches in the next milestone.
 */
export function CitePanel({ bus, close }) {
    const [selection, setSelection] = useState(() => bus.getPanelSelection());
    useEffect(() => bus.subscribe(() => {
        setSelection(bus.getPanelSelection());
    }), [bus]);
    return (_jsxs("div", { className: css.panel, "data-citeciter-panel": true, children: [_jsxs("header", { className: css.panelHeader, children: [_jsx("span", { className: css.panelTitle, children: "CiteCiter" }), _jsx("button", { className: css.closeButton, type: "button", "aria-label": "Close", onClick: close, children: "\u00D7" })] }), selection === null ? (_jsx("p", { className: css.panelHint, children: "\u9009\u4E2D\u52A9\u624B\u56DE\u590D\u4E2D\u7684\u4E00\u6BB5\u6587\u5B57\uFF0C\u53F3\u952E\u9009\u62E9 Citer!\u3002" })) : (_jsxs("div", { className: css.panelBody, children: [_jsx("blockquote", { className: css.quote, children: selection.text }), _jsxs("dl", { className: css.meta, children: [_jsx("dt", { children: "kind" }), _jsx("dd", { children: selection.kind }), _jsx("dt", { children: "anchor" }), _jsx("dd", { children: selection.anchorKey })] }), _jsx("p", { className: css.panelNote, children: "\u89E3\u91CA\u4F1A\u8BDD\u63A5\u5165\uFF08fork + \u53EA\u8BFB\u6743\u9650 + \u5BCC\u5A92\u4F53\u6E32\u67D3\uFF09\u5C06\u5728\u4E0B\u4E00\u91CC\u7A0B\u7891\u5B8C\u6210\u3002" })] }))] }));
}

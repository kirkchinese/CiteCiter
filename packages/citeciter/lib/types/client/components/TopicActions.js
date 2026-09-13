import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useRef, useState } from 'react';
import { ChoicePopover } from "./ChoicePopover.js";
/** Workspace actions remain reachable without a floating launcher over the composer. Callbacks own their dialogs and services. */
export function TopicActions({ hasTopic, onSettings, onReader }) {
    const [open, setOpen] = useState(false);
    const anchor = useRef(null);
    const close = useCallback(() => setOpen(false), []);
    const choose = (action) => { close(); anchor.current?.focus(); action(); };
    return _jsxs(_Fragment, { children: [_jsx("button", { ref: anchor, type: "button", title: "Topic \u64CD\u4F5C", "aria-label": "Topic \u64CD\u4F5C", "aria-haspopup": "menu", "aria-expanded": open, onClick: () => setOpen(value => !value), children: _jsx("svg", { viewBox: "0 0 20 20", "aria-hidden": "true", children: _jsx("path", { d: "M4 10h.1M10 10h.1M16 10h.1" }) }) }), open && _jsxs(ChoicePopover, { anchor: anchor, label: "Topic \u64CD\u4F5C", onClose: close, children: [_jsx("button", { type: "button", role: "menuitem", onClick: () => choose(onReader), children: "\u6587\u6863\u9605\u8BFB" }), _jsx("button", { type: "button", role: "menuitem", disabled: !hasTopic, onClick: () => choose(onSettings), children: "Topic \u8BBE\u7F6E" })] })] });
}

import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { ChoicePopover } from "./ChoicePopover.js";
import css from './TopicModelControls.module.css';
const choices = [
    ['read-only', '只读', '分析与回答；不修改工作区'],
    ['workspace-write', '工作区内修改', '按 DSH 权限修改当前项目'],
    ['danger-full-access', '完全权限', '按 DSH 完全权限运行工具'],
];
/** Explicit permission selection; receives the Host's effective value. */
export function PermissionControl({ value, onChange }) {
    const anchor = useRef(null);
    const [open, setOpen] = useState(false);
    return _jsxs(_Fragment, { children: [_jsxs("button", { ref: anchor, type: "button", className: css.trigger, "aria-label": `权限：${choices.find(row => row[0] === value)?.[1]}`, title: "DSH \u6743\u9650", "aria-expanded": open, onClick: () => setOpen(!open), children: [_jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: [_jsx("path", { d: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z", stroke: "currentColor", strokeWidth: "1.6" }), _jsx("path", { d: "m8 12 3 3 5-6", stroke: "currentColor", strokeWidth: "1.6" })] }), _jsx("span", { children: choices.find(row => row[0] === value)?.[1] })] }), open && _jsx(ChoicePopover, { anchor: anchor, onClose: () => setOpen(false), label: "DSH \u6743\u9650", children: choices.map(([mode, label, description]) => _jsxs("button", { type: "button", role: "menuitemradio", "aria-checked": value === mode, title: description, onClick: () => { onChange(mode); setOpen(false); }, children: [label, value === mode ? ' ✓' : ''] }, mode)) })] });
}

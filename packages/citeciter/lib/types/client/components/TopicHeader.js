import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CompactBackButton } from "./CompactBackButton.js";
import css from './TopicHeader.module.css';
/** Layout-only header: navigation, title and drag behavior are supplied by their independent controllers. */
export function TopicHeader({ compact, onBack, onDrag, title, status, children }) {
    return _jsxs("header", { className: css.header, "data-compact": compact || undefined, onPointerDown: compact ? undefined : onDrag, children: [compact ? _jsx(CompactBackButton, { onBack: onBack }) : _jsx("span", { className: css.grip, "aria-hidden": "true", children: "\u283F" }), _jsxs("div", { className: css.heading, children: [title, _jsx("span", { className: css.status, children: status })] }), children] });
}

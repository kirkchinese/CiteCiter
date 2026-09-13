import { jsx as _jsx } from "react/jsx-runtime";
import css from './CompactBackButton.module.css';
/** Return from the compact Citer page without discarding its Topic or draft. */
export function CompactBackButton({ onBack }) {
    return _jsx("button", { className: css.back, type: "button", onClick: onBack, "aria-label": "\u8FD4\u56DE\u4E3B\u5BF9\u8BDD", children: _jsx("svg", { viewBox: "0 0 20 20", width: "20", height: "20", fill: "none", "aria-hidden": "true", children: _jsx("path", { d: "m12 4-6 6 6 6", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" }) }) });
}

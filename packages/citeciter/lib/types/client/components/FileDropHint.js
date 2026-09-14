import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import css from './FileDropHint.module.css';
/** Display the receiving Topic without intercepting the drag's pointer target. */
export function FileDropHint({ enabled, title }) {
    return _jsxs("div", { className: css.hint, role: "status", "data-citeciter-file-drop": true, "data-disabled": !enabled || undefined, children: [_jsx("strong", { children: enabled ? '松开，添加到 Citer' : '先选择一个 Topic' }), enabled && title && _jsx("span", { children: title })] });
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { learningTodos } from "../learning-route.js";
import css from './LearningRoute.module.css';
/** Optional native todo projection. The user toggles planning; the model owns plan contents. */
export function LearningRoute({ enabled, messages, onChange }) {
    const todos = learningTodos(messages);
    return _jsxs("div", { className: css.route, children: [_jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: enabled, onChange: event => onChange(event.currentTarget.checked) }), "\u5B66\u4E60\u8DEF\u7EBF"] }), enabled && todos.length > 0 && _jsxs("details", { children: [_jsxs("summary", { children: [todos.filter(item => item.status === 'completed').length, " / ", todos.length, " \u00B7 ", todos.find(item => item.status === 'in_progress')?.content ?? '学习计划'] }), _jsx("ol", { children: todos.map((item, index) => _jsxs("li", { "data-state": item.status, children: [_jsx("span", { "aria-hidden": "true", children: item.status === 'completed' ? '✓' : item.status === 'in_progress' ? '◉' : '○' }), item.content] }, index)) })] })] });
}

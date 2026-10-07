import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import css from './QuestionReplyBody.module.css';
/** Show the user's recorded choices as text, without interpreting their answer as Markdown or replaying internal prompts. */
export function QuestionReplyBody({ reply }) {
    return _jsxs("section", { className: css.reply, "aria-label": "\u8865\u7B54\u5148\u524D\u7684\u95EE\u9898", children: [_jsx("span", { className: css.label, children: "\u8865\u7B54" }), reply.items.length === 0 ? _jsx("p", { children: "\u8FD9\u6761\u5386\u53F2\u56DE\u7B54\u7684\u683C\u5F0F\u65E0\u6CD5\u89E3\u6790\u3002" }) : _jsx("dl", { className: css.pairs, children: reply.items.map(item => _jsxs("div", { children: [_jsxs("dt", { className: css.question, children: [item.header !== undefined && item.header !== item.question && _jsxs("span", { className: css.label, children: [item.header, " \u00B7 "] }), item.question] }), _jsx("dd", { className: css.answer, children: item.values.length === 0
                                ? _jsx("span", { className: css.label, children: "\u5DF2\u8DF3\u8FC7" })
                                : item.values.map((value, index) => _jsx("p", { children: value }, index)) })] }, item.id)) })] });
}

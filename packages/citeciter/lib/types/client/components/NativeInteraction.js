import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { QuestionCard } from "./QuestionCard.js";
import css from './NativeInteraction.module.css';
/** Present the Host's one-shot pending request. Decisions go to its existing waterfall; no second permission authority is created. Remount on pending.key. */
export function NativeInteraction({ pending, messages }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState();
    if (pending.kind === 'question' || pending.kind === 'plan-review') {
        return _jsx("div", { className: css.questions, children: _jsx(QuestionCard, { pending: pending, onAnswer: answer => pending.answer(answer), onCancel: () => pending.cancel() }) });
    }
    if (pending.kind !== 'approval')
        return _jsx("p", { role: "status", children: "\u5F53\u524D\u5DE5\u5177\u6B63\u5728\u7B49\u5F85\u5BBF\u4E3B\u4EA4\u4E92\u3002\u53EF\u505C\u6B62\u540E\u91CD\u8BD5\u3002" });
    const call = messages.find(message => message.role === 'tool' && message.id === pending.callId);
    const answer = (decision) => {
        if (busy)
            return;
        setBusy(true);
        setError(undefined);
        void pending.answer(decision).catch(error => { setError(String(error)); setBusy(false); });
    };
    return _jsxs("section", { className: css.approval, "aria-label": "DSH \u5DE5\u5177\u5BA1\u6279", children: [_jsxs("div", { className: css.body, children: [_jsxs("strong", { children: ["\u7B49\u5F85\u6388\u6743 \u00B7 ", pending.toolName] }), pending.reason !== undefined && _jsx("p", { children: pending.reason }), call?.role === 'tool' && _jsxs("details", { children: [_jsx("summary", { children: "\u67E5\u770B\u5DE5\u5177\u53C2\u6570" }), _jsx("pre", { children: call.arguments })] }), error !== undefined && _jsx("p", { role: "alert", children: error })] }), _jsxs("div", { className: css.actions, children: [_jsx("button", { type: "button", disabled: busy, onClick: () => answer('rejected'), children: "\u62D2\u7EDD" }), _jsx("button", { type: "button", disabled: busy, onClick: () => answer('allowed-once'), children: "\u4EC5\u5141\u8BB8\u8FD9\u6B21" })] })] });
}

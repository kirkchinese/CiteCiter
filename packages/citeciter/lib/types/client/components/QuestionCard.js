import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { IconQuestionOutline14 } from '@deepseek-ai/dsh-client-ui-primitives';
import { RichAnswer } from "./RichAnswer.js";
import css from './CiteCiter.module.css';
/** Collect one standard DSH ask_user_question answer batch inside the private Topic. */
export function QuestionCard({ onAnswer, onCancel, pending }) {
    const [page, setPage] = useState(0);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState();
    const run = (action) => {
        if (busy)
            return;
        setBusy(true);
        setError(undefined);
        void action().catch(error => { setError(String(error)); setBusy(false); });
    };
    const [drafts, setDrafts] = useState({});
    const question = pending.questions[page];
    const complete = useMemo(() => pending.questions.every((item) => {
        const draft = drafts[item.id];
        return draft !== undefined && (draft.selected.length > 0 || draft.custom.trim() !== '');
    }), [drafts, pending.questions]);
    if (question === undefined)
        return null;
    const draft = drafts[question.id] ?? { selected: [], custom: '' };
    const update = (next) => setDrafts((current) => ({ ...current, [question.id]: next }));
    const choose = (label) => {
        if (question.multiSelect === true) {
            update({
                ...draft,
                selected: draft.selected.includes(label)
                    ? draft.selected.filter((item) => item !== label)
                    : [...draft.selected, label],
            });
            return;
        }
        update({ selected: [label], custom: '' });
    };
    const submit = (event) => {
        event.preventDefault();
        if (!complete || busy)
            return;
        const answer = {
            answers: pending.questions.map((item) => {
                const value = drafts[item.id] ?? { selected: [], custom: '' };
                const custom = value.custom.trim();
                return {
                    id: item.id,
                    selected: [...value.selected],
                    ...(custom === '' ? {} : { custom }),
                };
            }),
        };
        run(() => onAnswer(answer));
    };
    return (_jsxs("form", { className: css.questionFrame, onSubmit: submit, "aria-label": "CiteCiter \u63D0\u95EE", children: [_jsxs("div", { className: css.questionHeader, children: [_jsx(IconQuestionOutline14, {}), _jsxs("div", { children: [_jsx("span", { children: question.header ?? 'CiteCiter 需要你的回答' }), _jsx("strong", { children: question.question })] }), _jsxs("span", { children: [page + 1, "/", pending.questions.length] })] }), question.detail !== undefined && _jsx(RichAnswer, { text: question.detail, streaming: false }), error !== undefined && _jsx("p", { role: "alert", children: error }), (question.options ?? []).length > 0 && (_jsx("div", { className: css.questionOptions, children: question.options?.map((option, index) => {
                    const selected = draft.selected.includes(option.label);
                    return (_jsxs("button", { type: "button", disabled: busy, "data-selected": selected || undefined, onClick: () => choose(option.label), children: [_jsx("span", { children: question.multiSelect === true ? selected ? '✓' : '□' : index + 1 }), _jsxs("span", { children: [_jsx("strong", { children: option.label }), option.description !== undefined && _jsx("small", { children: option.description })] })] }, option.label));
                }) })), _jsx("textarea", { className: css.questionCustom, rows: 2, disabled: busy, value: draft.custom, placeholder: (question.options ?? []).length === 0 ? '输入回答…' : '其他（可填写）', "aria-label": "\u81EA\u5B9A\u4E49\u56DE\u7B54", onChange: (event) => update({
                    selected: question.multiSelect === true ? draft.selected : [],
                    custom: event.currentTarget.value,
                }) }), _jsxs("div", { className: css.questionFooter, children: [_jsx("button", { type: "button", disabled: busy, onClick: () => run(onCancel), children: "\u53D6\u6D88" }), _jsx("span", {}), page > 0 && _jsx("button", { type: "button", onClick: () => setPage(page - 1), children: "\u4E0A\u4E00\u4E2A" }), page + 1 < pending.questions.length
                        ? _jsx("button", { type: "button", disabled: draft.selected.length === 0 && draft.custom.trim() === '', onClick: () => setPage(page + 1), children: "\u4E0B\u4E00\u4E2A" })
                        : _jsx("button", { type: "submit", disabled: !complete || busy, children: busy ? '提交中…' : '提交回答' })] })] }));
}

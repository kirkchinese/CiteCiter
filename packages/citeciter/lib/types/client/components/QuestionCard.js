import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { IconQuestionOutline14 } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './CiteCiter.module.css';
/** Collect one standard DSH ask_user_question answer batch inside the private Topic. */
export function QuestionCard({ companion, pending }) {
    const [page, setPage] = useState(0);
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
        if (!complete)
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
        void companion.answerQuestion(pending.key, answer);
    };
    return (_jsxs("form", { className: css.questionFrame, onSubmit: submit, "aria-label": "CiteCiter \u63D0\u95EE", children: [_jsxs("div", { className: css.questionHeader, children: [_jsx(IconQuestionOutline14, {}), _jsxs("div", { children: [_jsx("span", { children: question.header ?? 'CiteCiter 需要你的回答' }), _jsx("strong", { children: question.question })] }), _jsxs("span", { children: [page + 1, "/", pending.questions.length] })] }), (question.options ?? []).length > 0 && (_jsx("div", { className: css.questionOptions, children: question.options?.map((option, index) => {
                    const selected = draft.selected.includes(option.label);
                    return (_jsxs("button", { type: "button", "data-selected": selected || undefined, onClick: () => choose(option.label), children: [_jsx("span", { children: question.multiSelect === true ? selected ? '✓' : '□' : index + 1 }), _jsxs("span", { children: [_jsx("strong", { children: option.label }), option.description !== undefined && _jsx("small", { children: option.description })] })] }, option.label));
                }) })), _jsx("textarea", { className: css.questionCustom, rows: 2, value: draft.custom, placeholder: (question.options ?? []).length === 0 ? '输入回答…' : '其他（可填写）', "aria-label": "\u81EA\u5B9A\u4E49\u56DE\u7B54", onChange: (event) => update({
                    selected: question.multiSelect === true ? draft.selected : [],
                    custom: event.currentTarget.value,
                }) }), _jsxs("div", { className: css.questionFooter, children: [_jsx("button", { type: "button", onClick: () => { void companion.cancelQuestion(pending.key); }, children: "\u53D6\u6D88" }), _jsx("span", {}), page > 0 && _jsx("button", { type: "button", onClick: () => setPage(page - 1), children: "\u4E0A\u4E00\u4E2A" }), page + 1 < pending.questions.length
                        ? _jsx("button", { type: "button", disabled: draft.selected.length === 0 && draft.custom.trim() === '', onClick: () => setPage(page + 1), children: "\u4E0B\u4E00\u4E2A" })
                        : _jsx("button", { type: "submit", disabled: !complete, children: "\u63D0\u4EA4\u56DE\u7B54" })] })] }));
}

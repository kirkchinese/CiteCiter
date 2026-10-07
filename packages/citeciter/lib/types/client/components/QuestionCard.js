import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { IconQuestionOutlineMedium } from "../host-icons.js";
import { RichAnswer } from "./RichAnswer.js";
import css from './CiteCiter.module.css';
/** Collect one standard DSH ask_user_question answer batch inside the private Topic. */
export function QuestionCard({ onAnswer, onCancel, pending, interaction, surface, draftStore }) {
    const [page, setPage] = useState(0);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState();
    const sentVia = useRef(undefined);
    const readonly = interaction?.review !== undefined;
    const locked = busy || readonly;
    useEffect(() => {
        // An answer sent at the deadline may lose the Host's waterfall race.
        // Keep the text and re-enable the same form when the late-reply channel opens.
        if (sentVia.current !== 'waterfall' || interaction?.state !== 'continued')
            return;
        sentVia.current = undefined;
        setBusy(false);
        setError('模型已继续，回答仍保留，请再次提交。');
    }, [interaction?.state]);
    const run = (action) => {
        if (busy)
            return;
        setBusy(true);
        setError(undefined);
        void action().catch(error => { setError(String(error)); setBusy(false); });
    };
    const [drafts, setDrafts] = useState(() => draftStore?.getDraft() ?? Object.fromEntries((interaction?.review ?? []).map(answer => [answer.id, { selected: [...answer.selected], custom: answer.custom ?? '' }])));
    const question = pending.questions[page];
    const complete = useMemo(() => pending.questions.every((item) => {
        const draft = drafts[item.id];
        return draft !== undefined && (interaction?.allowSkip === true || draft.selected.length > 0 || draft.custom.trim() !== '');
    }), [drafts, pending.questions, interaction?.allowSkip]);
    if (question === undefined || interaction?.closed)
        return null;
    const draft = drafts[question.id] ?? { selected: [], custom: '' };
    const update = (next) => {
        if (locked)
            return;
        interaction?.edit();
        const value = { ...drafts, [question.id]: next };
        draftStore?.setDraft(value);
        setDrafts(value);
    };
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
        if (!complete || locked || interaction?.channel === 'none')
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
        sentVia.current = interaction?.channel;
        run(() => onAnswer(answer));
    };
    return (_jsxs("form", { ref: surface, className: css.questionFrame, onSubmit: submit, "aria-label": "CiteCiter \u63D0\u95EE", onFocus: event => { if (!event.currentTarget.contains(event.relatedTarget))
            interaction?.focus(); }, onBlur: event => { if (!event.currentTarget.contains(event.relatedTarget))
            interaction?.blur(); }, children: [_jsxs("div", { className: css.questionHeader, children: [_jsx(IconQuestionOutlineMedium, {}), _jsxs("div", { children: [_jsx("span", { children: question.header ?? 'CiteCiter 需要你的回答' }), _jsx("strong", { children: question.question })] }), _jsxs("span", { children: [page + 1, "/", pending.questions.length] })] }), question.detail !== undefined && _jsx(RichAnswer, { text: question.detail, streaming: false }), interaction?.status !== undefined && _jsx("p", { role: "status", children: interaction.status }), error !== undefined && _jsx("p", { role: "alert", children: error }), (question.options ?? []).length > 0 && (_jsx("div", { className: css.questionOptions, children: question.options?.map((option, index) => {
                    const selected = draft.selected.includes(option.label);
                    return (_jsxs("button", { type: "button", disabled: locked, "data-selected": selected || undefined, onClick: () => choose(option.label), children: [_jsx("span", { children: question.multiSelect === true ? selected ? '✓' : '□' : index + 1 }), _jsxs("span", { children: [_jsx("strong", { children: option.label }), option.description !== undefined && _jsx("small", { children: option.description })] })] }, option.label));
                }) })), _jsx("textarea", { className: css.questionCustom, rows: 2, disabled: locked, value: draft.custom, placeholder: (question.options ?? []).length === 0 ? '输入回答…' : '其他（可填写）', "aria-label": "\u81EA\u5B9A\u4E49\u56DE\u7B54", onChange: (event) => update({
                    selected: question.multiSelect === true ? draft.selected : [],
                    custom: event.currentTarget.value,
                }) }), _jsxs("div", { className: css.questionFooter, children: [_jsx("button", { type: "button", disabled: busy, onClick: () => run(onCancel), children: interaction?.dismissLabel ?? '取消' }), interaction?.canTakeTime && _jsx("button", { type: "button", disabled: busy, onClick: () => interaction.takeTime(), children: "\u7B49\u6211\u56DE\u7B54" }), interaction?.allowSkip && !readonly && _jsx("button", { type: "button", disabled: busy, onClick: () => {
                            update({ selected: [], custom: '' });
                            if (page + 1 < pending.questions.length)
                                setPage(page + 1);
                        }, children: "\u8DF3\u8FC7\u6B64\u9898" }), _jsx("span", {}), page > 0 && _jsx("button", { type: "button", onClick: () => setPage(page - 1), children: "\u4E0A\u4E00\u4E2A" }), page + 1 < pending.questions.length
                        ? _jsx("button", { type: "button", disabled: !readonly && (drafts[question.id] === undefined || (!interaction?.allowSkip && draft.selected.length === 0 && draft.custom.trim() === '')), onClick: () => setPage(page + 1), children: "\u4E0B\u4E00\u4E2A" })
                        : !readonly && _jsx("button", { type: "submit", disabled: !complete || busy || interaction?.channel === 'none', children: busy ? '提交中…' : '提交回答' })] })] }));
}

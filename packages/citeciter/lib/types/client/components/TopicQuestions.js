import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useReducer } from 'react';
import { useNativeQuestionInteraction } from "../question-interaction.js";
import { QuestionCard } from "./QuestionCard.js";
function TopicQuestion({ pending, controller }) {
    const { interaction, surface } = useNativeQuestionInteraction(controller);
    const failure = controller.getSnapshot().error;
    return _jsxs(_Fragment, { children: [failure !== undefined && _jsx("p", { role: "alert", children: failure }), _jsx(QuestionCard, { pending: pending, interaction: interaction, surface: surface, draftStore: controller.drafts, onAnswer: answer => controller.answer(answer), onCancel: () => controller.dismiss() })] });
}
/** Private Topic questions share native wait semantics without joining the Host's Session list. */
export function TopicQuestions({ sessionId, pending, native, children }) {
    const [, render] = useReducer(value => value + 1, 0);
    const cards = useMemo(() => pending.map(question => ({ question, controller: native.question(sessionId, question) })), [native, sessionId, pending]);
    useEffect(() => {
        const releases = cards.map(card => card.controller.subscribe(render));
        native.syncQuestions(sessionId, pending);
        return () => { for (const release of releases)
            release(); };
    }, [cards, native, pending, sessionId]);
    const answerable = cards.filter(card => !card.controller.getSnapshot().closed);
    const visible = answerable.find(card => !card.controller.getSnapshot().hidden);
    return _jsxs(_Fragment, { children: [answerable.length > 0 && (answerable.length > 1 || visible === undefined) && _jsx("div", { "aria-label": "\u5F85\u56DE\u7B54\u95EE\u9898", children: answerable.map((card, index) => _jsxs("button", { type: "button", disabled: visible?.controller.dismissal === 'cancel' && visible !== card, "aria-pressed": visible === card, onClick: () => {
                        for (const other of answerable) {
                            if (other !== card && other.controller.dismissal === 'hide')
                                void other.controller.dismiss();
                        }
                        card.controller.reveal();
                    }, children: [card.question.questions[0]?.header ?? `问题 ${index + 1}`, card.question.state === 'continued' ? ' · 可补答' : ''] }, card.question.key)) }), visible === undefined ? children : _jsx(TopicQuestion, { pending: visible.question, controller: visible.controller }, visible.question.key)] });
}

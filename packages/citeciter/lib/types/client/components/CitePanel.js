import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { RichAnswer } from "./RichAnswer.js";
import css from './CiteCiter.module.css';
const PHASE_LABEL = {
    idle: '选择一条 Citation Thread',
    draft: '提出你的问题',
    creating: '正在创建只读 Thread…',
    ready: '可以继续追问',
    running: '正在回答…',
    error: '需要处理',
};
const INITIAL_QUESTIONS = [
    '请结合它在原对话中的上下文，深入解释这段话。',
    '请给一个具体例子，帮助我理解这段话。',
    '这段话为什么成立？请从原理讲起。',
];
const FOLLOW_UPS = [
    '换一种更直观的方式解释。',
    '再给一个不同的例子。',
    '它和前文的推理有什么关系？',
];
function threadLabel(thread) {
    const title = thread.title?.trim();
    if (title !== undefined && title !== '')
        return title;
    const quote = thread.citation.selectedText.replaceAll(/\s+/g, ' ').trim();
    return quote.length > 34 ? `${quote.slice(0, 34)}…` : quote;
}
/** Render one parent-grouped Thread selector. */
function ThreadPicker({ threads, activeId, onChange }) {
    const groups = useMemo(() => {
        const grouped = new Map();
        for (const thread of threads) {
            const group = grouped.get(thread.parentSessionId) ?? {
                title: thread.parentTitle,
                threads: [],
            };
            group.threads.push(thread);
            grouped.set(thread.parentSessionId, group);
        }
        return [...grouped.entries()];
    }, [threads]);
    if (threads.length === 0)
        return null;
    return (_jsxs("label", { className: css.threadPicker, children: [_jsx("span", { children: "\u5386\u53F2 Threads" }), _jsxs("select", { value: activeId ?? '', onChange: (event) => {
                    if (event.currentTarget.value !== '')
                        onChange(event.currentTarget.value);
                }, children: [_jsx("option", { value: "", disabled: true, children: "\u9009\u62E9\u4E00\u6761 Citation Thread" }), groups.map(([parentId, group]) => (_jsx("optgroup", { label: group.title, children: group.threads.map((thread) => (_jsx("option", { value: thread.sessionId, children: threadLabel(thread) }, thread.sessionId))) }, parentId)))] })] }));
}
/**
 * Render the durable Citation Thread panel.
 * @param props - close action and plugin-owned controller.
 * @returns question composer, transcript, recovery controls, and lifecycle actions.
 */
export function CitePanel({ close, explainer }) {
    const subscribe = useCallback((listener) => explainer.subscribe(listener), [explainer]);
    const snapshot = useSyncExternalStore(subscribe, explainer.getSnapshot);
    const [question, setQuestion] = useState('');
    const [rename, setRename] = useState('');
    const activeId = snapshot.activeThread?.sessionId ?? null;
    const quote = snapshot.activeThread?.citation.selectedText ?? snapshot.selection?.text ?? null;
    const quickQuestions = snapshot.activeThread === null ? INITIAL_QUESTIONS : FOLLOW_UPS;
    useEffect(() => {
        setQuestion('');
        setRename(snapshot.activeThread?.title ?? '');
    }, [activeId, snapshot.selection?.anchorKey, snapshot.activeThread?.title]);
    const submitQuestion = (event) => {
        event.preventDefault();
        const value = question.trim();
        if (value === '')
            return;
        setQuestion('');
        void explainer.ask(value);
    };
    return (_jsxs("div", { className: css.panel, "data-citeciter-panel": true, children: [_jsxs("header", { className: css.panelHeader, children: [_jsxs("div", { children: [_jsx("div", { className: css.panelTitle, children: "CiteCiter" }), _jsx("div", { className: css.panelSubtitle, children: "\u7CBE\u786E\u5386\u53F2\u4E0A\u4E0B\u6587\u4E2D\u7684\u5B66\u4E60\u4F34\u4FA3" })] }), _jsx("button", { className: css.closeButton, type: "button", "aria-label": "\u5173\u95ED CiteCiter", onClick: close, children: "\u00D7" })] }), _jsx(ThreadPicker, { threads: snapshot.threads, activeId: activeId, onChange: (sessionId) => { void explainer.switchThread(sessionId); } }), quote === null ? (_jsxs("div", { className: css.emptyState, children: [_jsx("p", { children: snapshot.threads.length === 0
                            ? '选中一段已完成的助手回复，右键选择 Citer!，创建第一条 Citation Thread。'
                            : '选择一条历史 Thread，或从助手回复中创建新的 Citation。' }), _jsx("span", { children: "Thread \u72EC\u7ACB\u8FD0\u884C\uFF0C\u4E0D\u4F1A\u628A\u63D0\u95EE\u5199\u5165\u539F\u4F1A\u8BDD\u3002" }), snapshot.error !== null && (_jsx("p", { className: css.panelError, "data-citeciter-error": true, children: snapshot.error }))] })) : (_jsxs("div", { className: css.panelBody, children: [_jsx("blockquote", { className: css.quote, children: quote }), _jsxs("div", { className: css.statusRow, children: [_jsx("span", { className: css.statusDot, "data-phase": snapshot.phase }), _jsx("span", { children: PHASE_LABEL[snapshot.phase] }), snapshot.activeThread !== null && (_jsx("code", { title: snapshot.activeThread.sessionId, children: snapshot.activeThread.sessionId.slice(0, 8) }))] }), snapshot.activeThread !== null && (_jsxs("div", { className: css.threadActions, children: [_jsx("input", { value: rename, onChange: (event) => setRename(event.currentTarget.value), placeholder: "Thread \u540D\u79F0", "aria-label": "Thread \u540D\u79F0" }), _jsx("button", { type: "button", onClick: () => { void explainer.renameActive(rename); }, disabled: rename.trim() === '', children: "\u4FDD\u5B58" }), _jsx("button", { className: css.dangerButton, type: "button", onClick: () => { void explainer.archiveActive(); }, children: "\u5F52\u6863" })] })), snapshot.error !== null && (_jsx("p", { className: css.panelError, "data-citeciter-error": true, children: snapshot.error })), snapshot.transcript.length > 0 && (_jsx("div", { className: css.transcript, "aria-live": "polite", children: snapshot.transcript.map((entry) => (_jsxs("article", { className: entry.role === 'user' ? css.userTurn : entry.role === 'assistant' ? css.assistantTurn : css.errorTurn, children: [_jsx("div", { className: css.turnRole, children: entry.role === 'user' ? '你' : entry.role === 'assistant' ? 'CiteCiter' : '错误' }), entry.role === 'assistant'
                                    ? _jsx(RichAnswer, { text: entry.text, streaming: entry.streaming })
                                    : _jsx("p", { children: entry.text })] }, entry.id))) })), _jsx("div", { className: css.quickQuestions, children: quickQuestions.map((item) => (_jsx("button", { type: "button", onClick: () => { void explainer.ask(item); }, children: item }, item))) }), _jsxs("form", { className: css.composer, onSubmit: submitQuestion, children: [_jsx("textarea", { value: question, onChange: (event) => setQuestion(event.currentTarget.value), placeholder: snapshot.activeThread === null ? '你想从哪一点开始？' : '继续追问…', rows: 3, maxLength: 12_000 }), _jsxs("div", { className: css.composerActions, children: [_jsx("span", { children: "\u8FD9\u662F\u4E00\u4E2A\u771F\u5B9E\u7684\u7528\u6237\u95EE\u9898\uFF0C\u53EF\u7EE7\u7EED\u591A\u8F6E\u5BF9\u8BDD\u3002" }), snapshot.phase === 'running' && (_jsx("button", { className: css.stopButton, type: "button", onClick: () => { void explainer.stop(); }, children: "\u505C\u6B62" })), _jsx("button", { className: css.sendButton, type: "submit", disabled: question.trim() === '' || snapshot.phase === 'creating', children: snapshot.phase === 'running' ? '排队' : '发送' })] })] })] }))] }));
}

import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useSyncExternalStore } from 'react';
import mascotUrl from '../assets/citeciter-mascot.png';
import css from './CiteCiter.module.css';
const PREVIEW_LIMIT = 96;
/**
 * Ask the first question beside the selected source text.
 * @param props - shared selection state and Topic actions.
 * @returns the contextual creation popover and companion launcher.
 */
export function SelectionMenu({ bus, companion, openPanel }) {
    const overlay = useSyncExternalStore(bus.subscribe, bus.getSnapshot);
    const snapshot = useSyncExternalStore(companion.subscribe, companion.getSnapshot);
    const [question, setQuestion] = useState('');
    const [mode, setMode] = useState(snapshot.settings.defaultMode);
    const [scenario, setScenario] = useState('qa');
    const selection = overlay.menuSelection;
    useEffect(() => {
        if (selection === null)
            return;
        setQuestion('');
        setMode(snapshot.settings.defaultMode);
        setScenario('qa');
    }, [selection, snapshot.settings.defaultMode]);
    const submit = (event) => {
        event.preventDefault();
        if (selection === null || question.trim() === '')
            return;
        const prompt = question.trim();
        openPanel();
        bus.setMenuSelection(null);
        void companion.create(selection, prompt, mode, scenario);
    };
    const preview = selection === null
        ? ''
        : selection.displayText.length > PREVIEW_LIMIT
            ? selection.displayText.slice(0, PREVIEW_LIMIT) + '…'
            : selection.displayText;
    const left = selection === null ? 0 : Math.max(12, Math.min(selection.x, window.innerWidth - 390));
    const top = selection === null ? 0 : Math.max(12, Math.min(selection.y, window.innerHeight - 350));
    return (_jsxs(_Fragment, { children: [selection !== null && (_jsxs("form", { className: css.selectionPopover, "data-citeciter-menu": true, style: { left, top }, role: "dialog", "aria-label": "\u5411 CiteCiter \u63D0\u95EE", onSubmit: submit, children: [_jsxs("div", { className: css.popoverQuote, title: selection.displayText, children: ["\u201C", preview, "\u201D"] }), (snapshot.settings.promptTemplates ?? []).length > 0 && (_jsx("div", { className: css.popoverTemplates, children: (snapshot.settings.promptTemplates ?? []).map((template) => (_jsx("button", { type: "button", onClick: () => setQuestion(template.text), title: template.text, children: template.label }, template.id))) })), _jsxs("div", { className: css.popoverComposer, children: [_jsx("input", { autoFocus: true, value: question, maxLength: 12_000, onChange: (event) => setQuestion(event.currentTarget.value), placeholder: scenario === 'present' ? '希望 CiteCiter 怎样讲解？' : '哪里没看懂？', "aria-label": "CiteCiter \u7684\u7B2C\u4E00\u4E2A\u95EE\u9898" }), _jsx("button", { type: "submit", disabled: question.trim() === '', children: scenario === 'present' ? '开始讲解' : '开始提问' })] }), _jsxs("details", { className: css.popoverMode, children: [_jsxs("summary", { children: ["\u4E0A\u4E0B\u6587\u65B9\u5F0F\uFF1A", mode === 'observer' ? '旁观（推荐）' : mode === 'exact-fork' ? '精确分叉' : '可用时精确分叉'] }), _jsxs("select", { value: mode, onChange: (event) => setMode(event.currentTarget.value), children: [_jsx("option", { value: "observer", children: "\u65C1\u89C2\uFF1A\u6765\u6E90\u7EE7\u7EED\u66F4\u65B0" }), _jsx("option", { value: "exact-when-available", children: "\u8F6E\u6B21\u7ED3\u675F\u65F6\u7CBE\u786E\uFF0C\u5426\u5219\u65C1\u89C2" }), _jsx("option", { value: "exact-fork", children: "\u7CBE\u786E\u5206\u53C9\uFF1A\u8981\u6C42\u8F6E\u6B21\u5DF2\u7ED3\u675F" })] })] }), selection.kind === 'assistant-step' && (_jsxs("fieldset", { className: css.scenarioPicker, children: [_jsx("legend", { children: "Topic \u5F62\u6001" }), _jsxs("button", { type: "button", "data-active": scenario === 'qa' || undefined, "aria-pressed": scenario === 'qa', onClick: () => setScenario('qa'), children: [_jsx("strong", { children: "\u95EE\u7B54" }), _jsx("span", { children: "\u76F4\u63A5\u8BA8\u8BBA\u9009\u4E2D\u5185\u5BB9" })] }), _jsxs("button", { type: "button", "data-active": scenario === 'present' || undefined, "aria-pressed": scenario === 'present', onClick: () => setScenario('present'), children: [_jsx("strong", { children: "\u8BB2\u89E3" }), _jsx("span", { children: "\u540C\u6B65\u6574\u7406\u5230\u5C0F\u9ED1\u677F" })] })] }))] })), snapshot.sourceSessionId !== null && !overlay.panelOpen && (_jsxs("button", { className: css.topicLauncher, type: "button", onClick: openPanel, "aria-label": snapshot.topics.length === 0
                    ? '打开 CiteCiter'
                    : '打开 CiteCiter，共 ' + snapshot.topics.length + ' 个讨论', title: "\u6253\u5F00 CiteCiter", children: [_jsx("img", { src: mascotUrl, alt: "", "aria-hidden": "true" }), snapshot.topics.length > 0 && _jsx("span", { className: css.launcherCount, children: snapshot.topics.length })] }))] }));
}

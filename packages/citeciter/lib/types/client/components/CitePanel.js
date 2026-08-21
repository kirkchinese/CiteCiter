import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, } from 'react';
import { RichAnswer } from "./RichAnswer.js";
import css from './CiteCiter.module.css';
const PHASE_LABEL = {
    idle: '等待一个选区',
    creating: '正在创建独立 Topic…',
    ready: '可以继续追问',
    running: 'CiteCiter 正在回答…',
    error: '需要处理',
};
function clampWidth(value) {
    return Math.max(28, Math.min(55, Math.round(value)));
}
function modelValue(provider, model) {
    return encodeURIComponent(provider) + '|' + encodeURIComponent(model);
}
function parseModelValue(value) {
    const divider = value.indexOf('|');
    return [decodeURIComponent(value.slice(0, divider)), decodeURIComponent(value.slice(divider + 1))];
}
function quotePreview(text) {
    const compact = text.replaceAll(/\s+/g, ' ').trim();
    return compact.length > 54 ? compact.slice(0, 54) + '…' : compact;
}
/** Reserve a real third DSH column while keeping the official shell and coding surface intact. */
function useDockColumn(open, widthPercent) {
    const [width, setWidth] = useState(0);
    const [docked, setDocked] = useState(true);
    useEffect(() => {
        if (!open)
            return;
        const overlay = document.querySelector('[data-shell-overlay]');
        const frame = overlay?.parentElement;
        if (!(frame instanceof HTMLElement))
            return;
        const setTrack = (name, value) => {
            if (frame.style.getPropertyValue(name) !== value)
                frame.style.setProperty(name, value);
        };
        const apply = () => {
            const frameWidth = frame.getBoundingClientRect().width;
            const nativeTrack = /^([\d.]+)px(?:\s|$)/u.exec(frame.style.gridTemplateColumns);
            const sidebarWidth = nativeTrack === null
                ? frame.firstElementChild?.getBoundingClientRect().width ?? 0
                : Number(nativeTrack[1]);
            const available = frameWidth - sidebarWidth - 480;
            setTrack('--citeciter-sidebar-width', sidebarWidth + 'px');
            if (available < 360) {
                setTrack('--citeciter-dock-width', '0px');
                setWidth(Math.min(frameWidth, 720));
                setDocked(false);
                return;
            }
            const requested = frameWidth * widthPercent / 100;
            const panelWidth = Math.max(360, Math.min(requested, available));
            setTrack('--citeciter-dock-width', panelWidth + 'px');
            setWidth(panelWidth);
            setDocked(true);
        };
        apply();
        frame.dataset.citeciterDocked = 'true';
        const resizeObserver = new ResizeObserver(apply);
        const styleObserver = new MutationObserver(apply);
        resizeObserver.observe(frame);
        styleObserver.observe(frame, { attributes: true, attributeFilter: ['style'] });
        return () => {
            resizeObserver.disconnect();
            styleObserver.disconnect();
            delete frame.dataset.citeciterDocked;
            frame.style.removeProperty('--citeciter-sidebar-width');
            frame.style.removeProperty('--citeciter-dock-width');
        };
    }, [open, widthPercent]);
    return [width, docked];
}
/** Independent, resizable learning workspace docked beside the active coding conversation. */
export function CitePanel({ bus, companion, closePanel }) {
    const overlay = useSyncExternalStore(bus.subscribe, bus.getSnapshot);
    const snapshot = useSyncExternalStore(companion.subscribe, companion.getSnapshot);
    const [question, setQuestion] = useState('');
    const [title, setTitle] = useState('');
    const [widthPercent, setWidthPercent] = useState(snapshot.settings.panelWidthPercent);
    const resizeOrigin = useRef(null);
    const open = overlay.panelOpen;
    const [panelWidth, docked] = useDockColumn(open, widthPercent);
    const active = snapshot.active;
    useEffect(() => companion.setVisible(open), [companion, open]);
    useEffect(() => setWidthPercent(snapshot.settings.panelWidthPercent), [snapshot.settings.panelWidthPercent]);
    useEffect(() => setTitle(active?.topic.title ?? ''), [active?.topic.sessionId, active?.topic.title]);
    const selectedProvider = snapshot.providers.find((provider) => provider.id === active?.topic.modelConfig.provider);
    const selectedModel = selectedProvider?.models.find((model) => model.id === active?.topic.modelConfig.model);
    const models = useMemo(() => snapshot.providers.flatMap((provider) => provider.models.map((model) => ({
        provider: provider.id,
        providerName: provider.name,
        model,
    }))), [snapshot.providers]);
    if (!open)
        return null;
    const submit = (event) => {
        event.preventDefault();
        const value = question.trim();
        if (value === '')
            return;
        setQuestion('');
        void companion.ask(value);
    };
    const updateWidth = (next) => {
        const value = clampWidth(next);
        setWidthPercent(value);
        void companion.setSetting('panelWidthPercent', value);
    };
    const startResize = (event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        resizeOrigin.current = {
            x: event.clientX,
            width: widthPercent,
            frameWidth: document.querySelector('[data-shell-overlay]')?.parentElement?.getBoundingClientRect().width
                ?? window.innerWidth,
        };
    };
    const moveResize = (event) => {
        const origin = resizeOrigin.current;
        if (origin === null || !event.currentTarget.hasPointerCapture(event.pointerId))
            return;
        setWidthPercent(clampWidth(origin.width + (origin.x - event.clientX) / origin.frameWidth * 100));
    };
    const endResize = (event) => {
        const origin = resizeOrigin.current;
        if (origin === null || !event.currentTarget.hasPointerCapture(event.pointerId))
            return;
        resizeOrigin.current = null;
        event.currentTarget.releasePointerCapture(event.pointerId);
        updateWidth(origin.width + (origin.x - event.clientX) / origin.frameWidth * 100);
    };
    const cancelResize = (event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
        resizeOrigin.current = null;
    };
    const resizeKey = (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')
            return;
        event.preventDefault();
        updateWidth(widthPercent + (event.key === 'ArrowLeft' ? 1 : -1));
    };
    return (_jsxs("aside", { className: css.dock, style: { width: panelWidth > 0 ? panelWidth : undefined }, "data-citeciter-panel": true, "data-overlay": docked ? undefined : true, "aria-label": "CiteCiter \u5B66\u4E60\u4F34\u4FA3", children: [docked && (_jsx("div", { className: css.resizeHandle, role: "separator", "aria-label": "\u8C03\u6574 CiteCiter \u5BBD\u5EA6", "aria-orientation": "vertical", "aria-valuemin": 28, "aria-valuemax": 55, "aria-valuenow": widthPercent, tabIndex: 0, onPointerDown: startResize, onPointerMove: moveResize, onPointerUp: endResize, onPointerCancel: cancelResize, onKeyDown: resizeKey })), _jsxs("nav", { className: css.topicRail, "aria-label": "CiteCiter Topics", children: [_jsxs("div", { className: css.brand, children: [_jsx("span", { className: css.brandMark, "aria-hidden": "true", children: "\uD83D\uDC0B" }), _jsxs("div", { children: [_jsx("strong", { children: "CiteCiter" }), _jsx("span", { children: "\u5B66\u4E60\u4F34\u4FA3" })] })] }), _jsxs("div", { className: css.railCaption, children: [_jsx("span", { children: "\u5F53\u524D\u6765\u6E90\u7684\u8BA8\u8BBA" }), _jsx("button", { type: "button", onClick: () => companion.setIncludeArchived(!snapshot.includeArchived), children: snapshot.includeArchived ? '仅活动' : '查看归档' })] }), _jsxs("div", { className: css.topicList, children: [snapshot.topics.map((topic) => (_jsxs("button", { className: css.topicItem, "data-active": active?.topic.sessionId === topic.sessionId || undefined, "data-archived": topic.archived || undefined, "data-citeciter-topic": topic.sessionId, type: "button", onClick: () => { void companion.openTopic(topic.sessionId); }, children: [_jsx("span", { className: css.topicStatus, "data-running": topic.running || undefined }), _jsxs("span", { className: css.topicCopy, children: [_jsx("strong", { "data-pending": topic.titlePending || undefined, children: topic.title }), _jsxs("small", { children: ["\u201C", quotePreview(topic.citation.displayText), "\u201D"] })] })] }, topic.sessionId))), snapshot.topics.length === 0 && (_jsx("p", { className: css.railEmpty, children: "\u5728\u4E2D\u592E\u7F16\u7A0B\u5BF9\u8BDD\u4E2D\u9009\u4E2D\u6587\u5B57\uFF0C\u53F3\u952E\u5373\u53EF\u5F00\u59CB\u3002" }))] }), _jsxs("div", { className: css.railFoot, children: [_jsxs("span", { children: [snapshot.topics.length, " \u4E2A Topic"] }), _jsxs("span", { children: [widthPercent, "%"] })] })] }), _jsxs("section", { className: css.learningWorkspace, children: [_jsxs("header", { className: css.dockHeader, children: [_jsxs("div", { className: css.dockHeading, children: [_jsx("span", { className: css.modeBadge, children: active?.topic.mode === 'exact-fork' ? 'Exact Fork' : 'Observer' }), _jsx("strong", { children: active?.topic.title ?? '新的学习讨论' }), _jsx("span", { children: PHASE_LABEL[snapshot.phase] })] }), _jsx("button", { className: css.closeButton, type: "button", onClick: closePanel, "aria-label": "\u5173\u95ED CiteCiter", children: "\u00D7" })] }), active === null && snapshot.draftQuote === null ? (_jsxs("div", { className: css.emptyState, children: [_jsx("div", { className: css.emptyWhale, "aria-hidden": "true", children: "\uD83D\uDC0B" }), _jsx("h2", { children: "\u7F16\u7A0B\u522B\u505C\uFF0C\u95EE\u9898\u653E\u5230\u65C1\u8FB9\u95EE" }), _jsx("p", { children: "\u9009\u4E2D\u4E3B\u5BF9\u8BDD\u91CC\u4E00\u6B21\u5DF2\u5B8C\u6210\u6A21\u578B\u8C03\u7528\u7684\u4EFB\u610F\u6587\u5B57\uFF0C\u53F3\u952E\u8F93\u5165\u95EE\u9898\u3002Topic \u4F1A\u5728\u8FD9\u91CC\u72EC\u7ACB\u591A\u8F6E\u7EE7\u7EED\uFF0C\u4E0D\u8FDB\u5165\u5DE6\u4FA7\u4E3B\u4F1A\u8BDD\u5217\u8868\u3002" }), snapshot.error !== null && _jsx("p", { className: css.panelError, children: snapshot.error })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: css.contextBar, children: [_jsxs("blockquote", { children: ["\u201C", active?.topic.citation.displayText ?? snapshot.draftQuote, "\u201D"] }), active !== null && (_jsxs("div", { className: css.contextMeta, children: [_jsx("span", { "data-ok": active.topic.sourceAvailable || undefined, children: active.topic.sourceAvailable ? '来源在线' : '来源不可用' }), _jsx("span", { children: active.topic.observedThroughSeq === null ? '尚未读取来源' : '已读至 seq ' + active.topic.observedThroughSeq })] }))] }), active !== null && (_jsxs("div", { className: css.topicToolbar, children: [_jsxs("form", { onSubmit: (event) => {
                                            event.preventDefault();
                                            void companion.rename(title);
                                        }, children: [_jsx("input", { value: title, onChange: (event) => setTitle(event.currentTarget.value), "aria-label": "Topic \u6807\u9898" }), _jsx("button", { type: "submit", disabled: title.trim() === '' || title === active.topic.title, children: "\u4FDD\u5B58\u6807\u9898" })] }), _jsxs("select", { "aria-label": "CiteCiter \u6A21\u578B", value: modelValue(active.topic.modelConfig.provider, active.topic.modelConfig.model), onChange: (event) => {
                                            const [provider, model] = parseModelValue(event.currentTarget.value);
                                            void companion.selectModel(provider, model, null);
                                        }, children: [!models.some((item) => item.provider === active.topic.modelConfig.provider && item.model.id === active.topic.modelConfig.model) && (_jsxs("option", { value: modelValue(active.topic.modelConfig.provider, active.topic.modelConfig.model), children: [active.topic.modelConfig.provider, " / ", active.topic.modelConfig.model] })), snapshot.providers.map((provider) => (_jsx("optgroup", { label: provider.name, children: provider.models.map((model) => (_jsx("option", { value: modelValue(provider.id, model.id), children: model.name }, model.id))) }, provider.id)))] }), selectedModel !== undefined && selectedModel.reasoningEfforts.length > 0 && (_jsxs("select", { "aria-label": "\u601D\u8003\u5F3A\u5EA6", value: active.topic.modelConfig.reasoningEffort ?? '', onChange: (event) => {
                                            void companion.selectModel(active.topic.modelConfig.provider, active.topic.modelConfig.model, event.currentTarget.value === '' ? null : event.currentTarget.value);
                                        }, children: [_jsx("option", { value: "", children: "\u6A21\u578B\u9ED8\u8BA4\u601D\u8003" }), selectedModel.reasoningEfforts.map((effort) => (_jsx("option", { value: effort.id, children: effort.name }, effort.id)))] })), _jsx("button", { type: "button", "aria-label": active.topic.archived ? '恢复当前 Topic' : '归档当前 Topic', onClick: () => { void companion.archive(!active.topic.archived); }, children: active.topic.archived ? '恢复' : '归档' })] })), _jsxs("div", { className: css.transcript, "aria-live": "polite", children: [active?.messages.map((message) => (_jsxs("article", { className: message.role === 'user' ? css.userTurn : message.role === 'assistant' ? css.assistantTurn : css.errorTurn, children: [_jsx("div", { className: css.turnRole, children: message.role === 'user' ? '你' : message.role === 'assistant' ? 'CiteCiter' : '错误' }), message.role === 'assistant'
                                                ? (_jsxs(_Fragment, { children: [message.reasoning !== null && (_jsxs("details", { className: css.reasoning, children: [_jsx("summary", { children: "\u601D\u8003\u8FC7\u7A0B" }), _jsx("p", { children: message.reasoning })] })), _jsx(RichAnswer, { text: message.text, streaming: message.streaming })] }))
                                                : _jsx("p", { children: message.text })] }, message.id))), snapshot.phase === 'creating' && _jsx("div", { className: css.loadingCard, children: "\u6B63\u5728\u5EFA\u7ACB\u53EA\u8BFB\u4E0A\u4E0B\u6587\u4E0E\u72EC\u7ACB Topic\u2026" }), snapshot.error !== null && _jsx("p", { className: css.panelError, "data-citeciter-error": true, children: snapshot.error })] }), _jsxs("form", { className: css.composer, onSubmit: submit, children: [_jsx("textarea", { rows: 3, maxLength: 12_000, "aria-label": "\u7EE7\u7EED\u5411 CiteCiter \u63D0\u95EE", value: question, disabled: active === null, onChange: (event) => setQuestion(event.currentTarget.value), placeholder: active === null ? 'Topic 创建后可继续追问' : '继续追问，或聊点题外话…' }), _jsxs("div", { className: css.composerActions, children: [_jsx("span", { children: "\u53EA\u8BFB \u00B7 \u4E0D\u5E72\u9884\u4E3B Agent" }), snapshot.phase === 'running' && _jsx("button", { type: "button", onClick: () => { void companion.stop(); }, children: "\u505C\u6B62" }), _jsx("button", { className: css.sendButton, type: "submit", disabled: active === null || question.trim() === '', children: "\u53D1\u9001" })] })] })] }))] })] }));
}

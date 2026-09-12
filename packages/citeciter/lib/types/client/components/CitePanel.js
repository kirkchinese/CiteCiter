import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { Button, DisclosureRow, IconArchiveOutline20, IconQuestionOutline14, IconSendOutline16, IconSparkle16, IconStopFill16, JsonTree, Modal, } from '@deepseek-ai/dsh-client-ui-primitives';
import { parseNextQuestions } from "../prompt.js";
import { appendBoardCitation, isTopicMessageVisible } from "../topic-presentation.js";
import collapseArrowUrl from '../assets/collapse-arrow.svg';
import mascotUrl from '../assets/citeciter-mascot.png';
import { QuestionCard } from "./QuestionCard.js";
import { OverlayPortal } from "./OverlayPortal.js";
import { RichAnswer } from "./RichAnswer.js";
import css from './CiteCiter.module.css';
import { jsonTreeLabels } from "../copy.js";
import { findContainingFrame, useHostDock } from "../host-dock.js";
import { LEARNING_STAGES, latestLearningStage, learningQuestion, projectLearningCards } from "../../learning.js";
import { LearningCards } from "./LearningCards.js";
import { BoardView } from "./BoardView.js";
import learningCss from './LearningWorkspace.module.css';
const PHASE_LABEL = {
    idle: '新建或选择 Topic',
    creating: '正在确认上下文方式…',
    ready: '可以继续追问',
    running: 'CiteCiter 正在回答…',
    stopping: '正在停止…',
    stopped: '已停止，可继续',
    error: '需要处理',
};
function modelValue(provider, model) {
    return encodeURIComponent(provider) + '|' + encodeURIComponent(model);
}
function parseModelValue(value) {
    const divider = value.indexOf('|');
    return [decodeURIComponent(value.slice(0, divider)), decodeURIComponent(value.slice(divider + 1))];
}
function compactPreview(text, limit = 120) {
    const compact = text.replaceAll(/\s+/g, ' ').trim();
    return compact.length > limit ? compact.slice(0, limit) + '…' : compact;
}
function jsonObject(text) {
    try {
        const value = JSON.parse(text);
        return typeof value === 'object' && value !== null ? value : null;
    }
    catch {
        return null;
    }
}
function friendlyFailure(text) {
    if (text.includes('Citation source has no model route')) {
        return '当前主会话还没有可复用的模型。请先在主对话发送一条消息，再创建 Topic。';
    }
    return text.replaceAll(/https?:\/\/[^\s)]+/gu, '模型服务地址');
}
function FlowDisclosure({ icon, title, summary, running = false, children, }) {
    const [open, setOpen] = useState(false);
    return (_jsx(DisclosureRow, { className: css.flowDisclosure, rowClassName: running ? css.flowRowRunning : css.flowRow, icon: icon, title: title, open: open, expandable: true, expandOnRowClick: true, onToggle: () => setOpen(!open), collapsedContent: _jsxs(_Fragment, { children: [_jsx("span", { className: css.flowDot, children: "\u00B7" }), _jsx("span", { className: css.flowSummary, children: summary })] }), children: children }));
}
function ToolRow({ message }) {
    const args = jsonObject(message.arguments);
    const result = message.result === null ? null : jsonObject(message.result);
    const summary = message.running
        ? compactPreview(message.arguments)
        : message.isError
            ? '调用失败'
            : compactPreview(message.result ?? '完成');
    return (_jsx(FlowDisclosure, { icon: message.name === 'ask_user_question' ? _jsx(IconQuestionOutline14, {}) : _jsx(IconSparkle16, {}), title: message.name, summary: summary, running: message.running, children: _jsxs("div", { className: css.toolPreview, children: [_jsx("strong", { children: "\u53C2\u6570" }), args === null ? _jsx("pre", { children: message.arguments }) : _jsx(JsonTree, { data: args, label: "\u5DE5\u5177\u53C2\u6570", copyable: false, labels: jsonTreeLabels }), message.result !== null && (_jsxs(_Fragment, { children: [_jsx("strong", { children: message.isError ? '错误' : '结果' }), result === null
                            ? _jsx("pre", { children: message.result })
                            : _jsx(JsonTree, { data: result, label: "\u5DE5\u5177\u7ED3\u679C", copyable: false, labels: jsonTreeLabels })] }))] }) }));
}
function ErrorTurn({ message }) {
    const summary = friendlyFailure(message.text);
    return (_jsxs("article", { className: css.errorTurn, "data-status": message.status, role: message.status === 'failed' ? 'alert' : undefined, children: [_jsx("div", { className: css.turnRole, children: message.status === 'stopped' ? '已停止' : '请求失败' }), _jsx("p", { children: summary }), _jsxs("div", { className: css.errorMeta, children: [_jsxs("span", { children: ["\u7B2C ", message.attempt, " \u6B21\u8BF7\u6C42"] }), _jsx("span", { children: message.bodyRetained ? '已保留已生成正文' : '未产生可保留正文' }), _jsx("span", { children: message.status === 'stopped' ? '可继续追问' : '可修改问题后重试' })] }), summary !== message.text && _jsxs("details", { children: [_jsx("summary", { children: "\u6280\u672F\u8BE6\u60C5" }), _jsx("pre", { children: message.text })] })] }));
}
function AssistantTurn({ message, disabled, onQuestion, reportParseError, }) {
    const parsed = useMemo(() => parseNextQuestions(message.text, message.streaming), [message.streaming, message.text]);
    useEffect(() => {
        if (!message.streaming && parsed.invalid)
            reportParseError(message.id);
    }, [message.id, message.streaming, parsed.invalid, reportParseError]);
    return (_jsxs("article", { className: css.assistantTurn, children: [_jsx("div", { className: css.turnRole, children: "CiteCiter" }), parsed.text !== '' && _jsx(RichAnswer, { text: parsed.text, streaming: message.streaming }), !message.streaming && parsed.questions.length === 3 && (_jsxs("fieldset", { className: css.nextQuestions, children: [_jsx("legend", { children: "\u63A5\u4E0B\u6765\u53EF\u80FD\u60F3\u95EE" }), parsed.questions.map((question) => (_jsx("button", { type: "button", disabled: disabled, onClick: () => onQuestion(question), children: question }, question)))] }))] }));
}
/**
 * Render the independent Topic workspace on the right edge of the shell.
 * @param props - shared panel bus, Topic controller, and host callbacks.
 * @returns the responsive Topic dock and its dialogs, or null while closed.
 */
export function CitePanel({ useCompanion, useOverlay, bus, companion, closePanel, reportParseError }) {
    const overlay = useOverlay(value => value);
    const snapshot = useCompanion(value => value);
    const draftKey = snapshot.active?.topic.sessionId ?? snapshot.sourceSessionId ?? 'new';
    const [drafts, setDrafts] = useState({});
    const question = drafts[draftKey] ?? '';
    const setQuestion = useCallback((value) => {
        setDrafts(current => ({ ...current, [draftKey]: typeof value === 'string' ? value : value(current[draftKey] ?? '') }));
    }, [draftKey]);
    const [stages, setStages] = useState({});
    const stageId = Object.hasOwn(stages, draftKey) ? stages[draftKey] ?? null : latestLearningStage(snapshot.active?.messages ?? []);
    const stage = LEARNING_STAGES.find(candidate => candidate.id === stageId);
    const [views, setViews] = useState({});
    const [routeExpanded, setRouteExpanded] = useState({});
    const [composerExpanded, setComposerExpanded] = useState({});
    const view = views[draftKey] ?? 'explain';
    const setView = (next) => setViews(current => ({ ...current, [draftKey]: next }));
    const selectStage = (next) => {
        setStages(current => ({ ...current, [draftKey]: next }));
        setView(next === 'quantitative' ? 'board' : next === 'summary' ? 'cards' : 'explain');
        if (!floating && dock?.mode === 'rows')
            setRouteExpanded(current => ({ ...current, [draftKey]: false }));
        requestAnimationFrame(() => composerRef.current?.focus());
    };
    const cards = useMemo(() => projectLearningCards(snapshot.active?.messages ?? []), [snapshot.active?.messages]);
    const [title, setTitle] = useState('');
    const [titleDirty, setTitleDirty] = useState(false);
    const [newTopicOpen, setNewTopicOpen] = useState(false);
    const [newTopicQuestion, setNewTopicQuestion] = useState('');
    const [newTopicScenario, setNewTopicScenario] = useState('present');
    const [newTopicSubmitting, setNewTopicSubmitting] = useState(false);
    const [newTopicError, setNewTopicError] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [deleteError, setDeleteError] = useState(null);
    const [widthPercent, setWidthPercent] = useState(snapshot.settings.panelWidthPercent);
    const dockWidthPercent = widthPercent;
    const resizeOrigin = useRef(null);
    const panelRef = useRef(null);
    const [floatPosition, setFloatPosition] = useState(null);
    const floatDrag = useRef(null);
    const composerRef = useRef(null);
    const transcriptRef = useRef(null);
    const followTail = useRef(true);
    const modalReturnFocusRef = useRef(null);
    const open = overlay.panelOpen;
    const active = snapshot.active;
    const canAsk = snapshot.phase === 'ready' || snapshot.phase === 'stopped' || snapshot.phase === 'error';
    const floating = overlay.presentation === 'floating';
    const dock = useHostDock(panelRef, open && !floating, widthPercent);
    const docked = !floating && dock?.mode === 'columns';
    const showRoute = routeExpanded[draftKey] ?? docked;
    const composerFolded = !floating && dock?.mode === 'rows' && view !== 'explain' && !composerExpanded[draftKey];
    useEffect(() => open ? companion.retainVisible() : undefined, [companion, open]);
    useEffect(() => {
        if (!open || !floating)
            return;
        const contain = () => {
            floatDrag.current = null;
            const rect = panelRef.current?.getBoundingClientRect();
            if (rect === undefined)
                return;
            setFloatPosition(current => current === null ? null : { left: Math.max(8, Math.min(current.left, window.innerWidth - rect.width - 8)), top: Math.max(48, Math.min(current.top, window.innerHeight - rect.height - 8)) });
        };
        contain();
        window.addEventListener('resize', contain);
        return () => window.removeEventListener('resize', contain);
    }, [open, floating]);
    useEffect(() => { followTail.current = true; }, [active?.topic.sessionId, view, open]);
    useEffect(() => {
        if (followTail.current && transcriptRef.current !== null) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, [active?.messages, view, open]);
    useEffect(() => setWidthPercent(snapshot.settings.panelWidthPercent), [snapshot.settings.panelWidthPercent]);
    useEffect(() => {
        setTitle(active?.topic.title ?? '');
        setTitleDirty(false);
    }, [active?.topic.sessionId]);
    useEffect(() => {
        setNewTopicOpen(false);
        setNewTopicQuestion('');
        setNewTopicSubmitting(false);
        setNewTopicError(null);
        setDeleteTarget(null);
        setDeleteConfirmation('');
        setDeleteError(null);
    }, [snapshot.sourceSessionId]);
    useEffect(() => {
        if (deleteTarget !== null && deleteTarget.sessionId !== active?.topic.sessionId) {
            setDeleteTarget(null);
            setDeleteConfirmation('');
        }
    }, [active?.topic.sessionId, deleteTarget]);
    useEffect(() => {
        if (!titleDirty)
            setTitle(active?.topic.title ?? '');
    }, [active?.topic.title, titleDirty]);
    useEffect(() => {
        const citation = overlay.boardCitation;
        if (citation === null || active?.topic.sessionId !== citation.topicSessionId)
            return;
        setQuestion((current) => appendBoardCitation(current, citation.prompt));
        setViews(current => ({ ...current, [citation.topicSessionId]: 'explain' }));
        bus.clearBoardCitation(citation.id);
        requestAnimationFrame(() => composerRef.current?.focus());
    }, [active?.topic.sessionId, bus, overlay.boardCitation, setQuestion]);
    const modalTitle = newTopicOpen ? '新建自由 Topic' : deleteTarget === null ? null : '永久删除 Topic';
    useEffect(() => {
        if (modalTitle === null)
            return;
        const dialog = [...document.querySelectorAll('[role="dialog"]')]
            .find((element) => element.getAttribute('aria-label') === modalTitle);
        if (dialog === undefined)
            return;
        const appRoot = document.getElementById('root');
        const rootWasInert = appRoot?.hasAttribute('inert') ?? false;
        const rootAriaHidden = appRoot?.getAttribute('aria-hidden') ?? null;
        appRoot?.setAttribute('inert', '');
        appRoot?.setAttribute('aria-hidden', 'true');
        const focusable = () => [...dialog.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((element) => element.offsetParent !== null);
        const frame = requestAnimationFrame(() => {
            if (!dialog.contains(document.activeElement))
                focusable()[0]?.focus();
        });
        const trapFocus = (event) => {
            if (event.key !== 'Tab')
                return;
            const candidates = focusable();
            const first = candidates[0];
            const last = candidates.at(-1);
            if (first === undefined || last === undefined)
                return;
            if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
                event.preventDefault();
                last.focus();
            }
            else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
                event.preventDefault();
                first.focus();
            }
        };
        dialog.addEventListener('keydown', trapFocus);
        const returnFocus = modalReturnFocusRef.current;
        return () => {
            cancelAnimationFrame(frame);
            dialog.removeEventListener('keydown', trapFocus);
            if (appRoot !== null) {
                appRoot.toggleAttribute('inert', rootWasInert);
                if (rootAriaHidden === null)
                    appRoot.removeAttribute('aria-hidden');
                else
                    appRoot.setAttribute('aria-hidden', rootAriaHidden);
            }
            requestAnimationFrame(() => {
                if (returnFocus?.isConnected === true)
                    returnFocus.focus();
                else
                    panelRef.current?.querySelector('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])')?.focus();
            });
        };
    }, [modalTitle]);
    const selectedProvider = snapshot.providers.find((provider) => provider.id === active?.topic.modelConfig.provider);
    const selectedModel = selectedProvider?.models.find((model) => model.id === active?.topic.modelConfig.model);
    const visibleMessages = active?.messages.filter((message) => isTopicMessageVisible(message, active.messages)) ?? [];
    if (!open)
        return null;
    const submit = (event) => {
        event.preventDefault();
        if (!canAsk)
            return;
        const value = question.trim();
        if (value === '' && stageId === null)
            return;
        const submitted = question;
        void companion.ask(stageId === null ? value : learningQuestion(stageId, value)).then((sent) => {
            if (sent)
                setQuestion((current) => current === submitted ? '' : current);
        });
    };
    const openNewTopic = () => {
        modalReturnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setNewTopicQuestion('');
        setNewTopicScenario('present');
        setNewTopicError(null);
        setNewTopicOpen(true);
    };
    const submitNewTopic = async () => {
        const value = newTopicQuestion.trim();
        if (value === '' || newTopicSubmitting || snapshot.sourceSessionId === null)
            return;
        setNewTopicSubmitting(true);
        setNewTopicError(null);
        try {
            if (await companion.createFree(newTopicScenario === 'present' ? learningQuestion('logic', value) : value, newTopicScenario)) {
                setNewTopicOpen(false);
                setNewTopicQuestion('');
            }
            else {
                setNewTopicError('Topic 未创建，请重试。');
            }
        }
        finally {
            setNewTopicSubmitting(false);
        }
    };
    const confirmDelete = async () => {
        if (deleteTarget === null
            || deleteConfirmation !== deleteTarget.sessionId
            || snapshot.deleting)
            return;
        setDeleteError(null);
        if (await companion.deleteTopic(deleteConfirmation) === false) {
            setDeleteError('Topic 未删除，请重试。');
        }
    };
    const updateWidth = (next) => {
        const value = Math.max(28, Math.min(55, Math.round(next)));
        setWidthPercent(value);
        void companion.setSetting('panelWidthPercent', value);
    };
    const startResize = (event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        resizeOrigin.current = {
            x: event.clientX,
            width: widthPercent,
            frameWidth: findContainingFrame(panelRef.current)?.getBoundingClientRect().width ?? window.innerWidth,
        };
    };
    const moveResize = (event) => {
        const origin = resizeOrigin.current;
        if (origin === null || !event.currentTarget.hasPointerCapture(event.pointerId))
            return;
        setWidthPercent(Math.max(28, Math.min(55, Math.round(origin.width + (origin.x - event.clientX) / origin.frameWidth * 100))));
    };
    const endResize = (event) => {
        const origin = resizeOrigin.current;
        if (origin === null || !event.currentTarget.hasPointerCapture(event.pointerId))
            return;
        resizeOrigin.current = null;
        event.currentTarget.releasePointerCapture(event.pointerId);
        updateWidth(origin.width + (origin.x - event.clientX) / origin.frameWidth * 100);
    };
    const resizeKey = (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')
            return;
        event.preventDefault();
        updateWidth(widthPercent + (event.key === 'ArrowLeft' ? 1 : -1));
    };
    return (_jsxs(_Fragment, { children: [_jsx(OverlayPortal, { inline: !floating, children: _jsxs("aside", { ref: panelRef, className: `${css.dock} ${floating ? css.floating : ''}`, style: {
                        width: floating ? undefined : dock?.width,
                        height: floating ? undefined : dock?.height,
                        top: floating ? undefined : dock?.top,
                        ...(floating && floatPosition !== null ? { left: floatPosition.left, top: floatPosition.top, right: 'auto' } : {}),
                        '--citeciter-panel-width': `${dockWidthPercent}vw`,
                    }, "data-citeciter-panel": true, "data-arrangement": floating ? 'floating' : dock?.mode ?? 'unsupported', "aria-label": "CiteCiter \u5B66\u4E60\u4F34\u4FA3", children: [docked && !floating && (_jsx("div", { className: css.resizeHandle, role: "separator", "aria-label": "\u8C03\u6574 CiteCiter \u5BBD\u5EA6", "aria-orientation": "vertical", "aria-valuemin": 28, "aria-valuemax": 55, "aria-valuenow": widthPercent, tabIndex: 0, onPointerDown: startResize, onPointerMove: moveResize, onPointerUp: endResize, onPointerCancel: () => { resizeOrigin.current = null; }, onKeyDown: resizeKey })), _jsx("button", { className: css.closeButton, type: "button", onClick: closePanel, "aria-label": "\u5173\u95ED CiteCiter", children: _jsx("img", { src: collapseArrowUrl, alt: "" }) }), !floating && dock === null && _jsx("p", { className: css.layoutNotice, role: "status", children: "\u5F53\u524D\u5BBF\u4E3B\u5E03\u5C40\u6682\u4E0D\u652F\u6301\u5B66\u4E60\u680F\u3002\u8BF7\u5207\u6362\u5230\u6807\u51C6 Web \u5E03\u5C40\u6216 Desktop \u517C\u5BB9\u6A21\u5F0F\u3002" }), _jsx("div", { className: css.dockBody, children: _jsxs("section", { className: css.learningWorkspace, children: [_jsxs("header", { className: css.dockHeader, "data-floating": floating || undefined, onPointerDown: event => {
                                            if (!floating || event.button !== 0 || event.target.closest('button, input, select, textarea') !== null)
                                                return;
                                            const rect = panelRef.current?.getBoundingClientRect();
                                            if (rect === undefined)
                                                return;
                                            floatDrag.current = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
                                            event.currentTarget.setPointerCapture(event.pointerId);
                                            event.preventDefault();
                                        }, onPointerMove: event => {
                                            const origin = floatDrag.current, rect = panelRef.current?.getBoundingClientRect();
                                            if (origin === null || rect === undefined)
                                                return;
                                            setFloatPosition({ left: Math.max(8, Math.min(origin.left + event.clientX - origin.x, window.innerWidth - rect.width - 8)), top: Math.max(48, Math.min(origin.top + event.clientY - origin.y, window.innerHeight - rect.height - 8)) });
                                        }, onPointerUp: () => { floatDrag.current = null; }, onPointerCancel: () => { floatDrag.current = null; }, children: [_jsxs("div", { className: css.dockHeading, children: [_jsx("span", { className: css.modeBadge, children: active === null
                                                            ? snapshot.phase === 'creating' ? '待确认' : '学习栏'
                                                            : active.topic.mode === 'exact-fork' ? 'Exact Fork' : 'Observer' }), _jsx("strong", { children: active?.topic.title ?? '新的学习讨论' }), _jsx("span", { children: !floating && dock?.mode === 'rows' ? '窗口较窄，学习栏已移至下方' : PHASE_LABEL[snapshot.phase] })] }), _jsxs("select", { className: css.compactTopicSelect, "aria-label": "\u9009\u62E9 Topic", value: active?.topic.sessionId ?? '', disabled: snapshot.topics.length === 0, onChange: (event) => {
                                                    if (event.currentTarget.value !== '')
                                                        void companion.openTopic(event.currentTarget.value);
                                                }, children: [_jsx("option", { value: "", children: snapshot.topicsStatus === 'loading' ? '正在读取…' : snapshot.includeArchived ? '归档 Topic' : '选择 Topic' }), snapshot.topics.map((topic) => (_jsx("option", { value: topic.sessionId, children: topic.title }, topic.sessionId)))] }), _jsxs("div", { className: css.compactHeaderActions, children: [_jsx("button", { type: "button", onClick: () => bus.setPresentation(floating ? 'side' : 'floating'), children: floating ? '切为侧边' : '切为悬浮' }), _jsx("button", { className: css.compactNewTopic, type: "button", onClick: openNewTopic, children: "+ \u65B0 Topic" }), _jsx("button", { type: "button", onClick: () => companion.setIncludeArchived(!snapshot.includeArchived), children: snapshot.includeArchived ? '返回活动' : '查看归档' })] })] }), snapshot.topicsStatus === 'error' && _jsxs("p", { className: css.panelError, role: "alert", children: ["Topic \u8BFB\u53D6\u5931\u8D25\uFF1A", snapshot.topicsError] }), snapshot.notice !== null && _jsx("div", { className: css.panelNotice, role: "status", children: snapshot.notice }), active === null && snapshot.draftQuote === null ? (_jsxs("div", { className: css.emptyState, children: [_jsx("div", { className: css.emptyWhale, "aria-hidden": "true", children: _jsx("img", { src: mascotUrl, alt: "" }) }), _jsx("h2", { children: "\u628A\u6CA1\u61C2\u7684\u5730\u65B9\uFF0C\u6162\u6162\u8BB2\u660E\u767D" }), _jsx("p", { children: "\u65B0\u5EFA\u4E00\u4E2A\u5B66\u4E60 Topic\uFF0C\u6216\u9009\u4E2D\u4E3B\u5BF9\u8BDD\u4E2D\u7684\u6587\u5B57\uFF0C\u4ECE\u95EE\u9898\u672C\u8EAB\u5F00\u59CB\u3002" }), _jsx("button", { className: learningCss.action, type: "button", onClick: openNewTopic, children: "\u5F00\u59CB\u5B66\u4E60" }), snapshot.phase === 'creating' && _jsx("div", { className: css.loadingCard, children: "\u6B63\u5728\u521B\u5EFA Topic\u2026" }), snapshot.error !== null && _jsx("p", { className: css.panelError, role: "alert", children: friendlyFailure(snapshot.error) })] })) : (_jsxs(_Fragment, { children: [_jsxs("details", { className: `${css.contextBar} ${learningCss.source}`, children: [_jsx("summary", { children: active?.topic.citation == null ? '自由讨论 · 查看上下文' : `引用来源 · ${compactPreview(active.topic.citation.displayText, 70)}` }), _jsx("blockquote", { children: active?.topic.citation === null
                                                            ? '无引用 · 自由讨论'
                                                            : '“' + (active?.topic.citation?.displayText ?? snapshot.draftQuote) + '”' }), active !== null && (_jsxs("div", { className: css.contextMeta, children: [_jsx("span", { "data-ok": active.topic.sourceAvailable || undefined, children: active.topic.sourceAvailable ? '来源在线' : '来源不可用' }), _jsx("span", { children: active.topic.observedThroughSeq === null
                                                                    ? '等待按需读取来源'
                                                                    : '来源已同步' })] }))] }), _jsxs("div", { className: learningCss.route, children: [_jsxs("div", { className: learningCss.routeTop, children: [_jsxs("button", { className: learningCss.action, type: "button", "aria-expanded": showRoute, onClick: () => setRouteExpanded(current => ({ ...current, [draftKey]: !showRoute })), children: [showRoute ? '收起学习路线' : `学习路线 · ${stage?.label ?? '选择阶段'}`, " ", showRoute ? '⌃' : '⌄'] }), _jsx("button", { className: learningCss.action, type: "button", "aria-pressed": stageId === null, onClick: () => selectStage(null), children: "\u81EA\u7531\u8FFD\u95EE" })] }), showRoute && _jsxs(_Fragment, { children: [_jsx("div", { className: learningCss.stages, "aria-label": "\u9009\u62E9\u5B66\u4E60\u9636\u6BB5", children: LEARNING_STAGES.map((item, index) => _jsxs("button", { type: "button", "aria-label": item.label, "aria-pressed": stageId === item.id, title: item.label, onClick: () => selectStage(item.id), children: [_jsx("span", { children: String(index + 1).padStart(2, '0') }), item.shortLabel] }, item.id)) }), _jsx("p", { className: learningCss.hint, children: stage === undefined ? '围绕当前问题继续聊，或选择一个阶段。选择后点击发送才会开始。' : `${stage.label} · ${stage.hint} 点击发送开始。` })] })] }), _jsxs("div", { className: learningCss.views, "aria-label": "\u5B66\u4E60\u5185\u5BB9\u89C6\u56FE", children: [_jsx("button", { type: "button", "aria-pressed": view === 'explain', onClick: () => setView('explain'), children: "\u8BB2\u89E3" }), _jsxs("button", { type: "button", "aria-pressed": view === 'board', onClick: () => setView('board'), children: ["\u677F\u4E66", _jsx("span", { className: learningCss.count, children: active?.board?.elements.length ?? 0 })] }), _jsxs("button", { type: "button", "aria-pressed": view === 'cards', onClick: () => setView('cards'), children: ["\u5B66\u4E60\u5361", _jsx("span", { className: learningCss.count, children: cards.cards.length })] })] }), view === 'explain' && _jsxs("div", { ref: transcriptRef, className: css.transcript, "aria-live": "polite", onScroll: event => {
                                                    const element = event.currentTarget;
                                                    followTail.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
                                                }, children: [visibleMessages.map((message) => {
                                                        if (message.role === 'tool')
                                                            return _jsx(ToolRow, { message: message }, message.id);
                                                        if (message.role === 'user')
                                                            return (_jsxs("article", { className: css.userTurn, children: [_jsx("div", { className: css.turnRole, children: "\u4F60" }), message.text.startsWith('【学习阶段：') ? _jsxs("details", { className: learningCss.questionDetails, children: [_jsxs("summary", { children: [message.text.split('\n')[0], message.text.includes('\n\n我的问题：') ? ` · ${message.text.split('\n\n我的问题：').slice(1).join('\n\n我的问题：')}` : ''] }), _jsx("p", { children: message.text })] }) : _jsx("p", { children: message.text })] }, message.id));
                                                        if (message.role === 'error')
                                                            return _jsx(ErrorTurn, { message: message }, message.id);
                                                        if (message.role === 'context')
                                                            return null;
                                                        return (_jsx(AssistantTurn, { message: message, disabled: !canAsk, onQuestion: (value) => {
                                                                setQuestion(current => current.trim() === '' ? value : `${current}\n${value}`);
                                                                requestAnimationFrame(() => composerRef.current?.focus());
                                                            }, reportParseError: reportParseError }, message.id));
                                                    }), snapshot.phase === 'creating' && _jsx("div", { className: css.loadingCard, children: "\u6B63\u5728\u9A8C\u8BC1\u5F15\u7528\u5E76\u5EFA\u7ACB Topic\u2026" }), snapshot.error !== null && !visibleMessages.some((message) => message.role === 'error' || message.role === 'tool' && message.isError) && (_jsx("p", { className: css.panelError, "data-citeciter-error": true, role: "alert", children: friendlyFailure(snapshot.error) }))] }), view === 'board' && _jsx("div", { className: learningCss.content, children: _jsx(BoardView, { snapshot: active?.board, animations: snapshot.settings.boardAnimations ?? true, compact: true, onQuoteElement: element => {
                                                        setQuestion(current => appendBoardCitation(current, `请解释板书“${element.id}”：\n${element.content.slice(0, 2000)}`));
                                                        setView('explain');
                                                        requestAnimationFrame(() => composerRef.current?.focus());
                                                    } }) }), view === 'cards' && active !== null && _jsx("div", { className: learningCss.content, children: _jsx(LearningCards, { projection: cards, recall: snapshot.settings.activeRecall ?? false, setRecall: value => { void companion.setSetting('activeRecall', value); }, disabled: snapshot.settingsSaveStatus === 'saving', topicTitle: active.topic.title, topicId: active.topic.sessionId, source: active.topic.citation?.displayText ?? '无引用 · 自由讨论', onRevise: () => {
                                                        selectStage('summary');
                                                        setComposerExpanded(current => ({ ...current, [draftKey]: true }));
                                                    } }, active.topic.sessionId) }), view !== 'explain' && snapshot.error !== null && _jsx("p", { className: css.panelError, role: "alert", children: friendlyFailure(snapshot.error) }), active !== null && (_jsxs("details", { className: learningCss.settings, children: [_jsxs("summary", { children: ["Topic \u8BBE\u7F6E \u00B7 ", selectedModel?.name ?? active.topic.modelConfig.model] }), _jsxs("div", { className: css.topicToolbar, "aria-label": "Topic \u8BBE\u7F6E", children: [_jsxs("form", { onSubmit: (event) => {
                                                                    event.preventDefault();
                                                                    void companion.rename(title).then((saved) => {
                                                                        if (saved)
                                                                            setTitleDirty(false);
                                                                    });
                                                                }, children: [_jsx("input", { value: title, "aria-label": "Topic \u6807\u9898", onChange: (event) => {
                                                                            setTitle(event.currentTarget.value);
                                                                            setTitleDirty(true);
                                                                        } }), _jsx("button", { type: "submit", disabled: title.trim() === '' || !titleDirty || snapshot.renaming, children: snapshot.renaming ? '保存中…' : titleDirty ? '保存' : '已保存' })] }), _jsxs("select", { "aria-label": "CiteCiter \u6A21\u578B", value: modelValue(active.topic.modelConfig.provider, active.topic.modelConfig.model), disabled: snapshot.modelRouteSaving, onChange: (event) => {
                                                                    const [provider, model] = parseModelValue(event.currentTarget.value);
                                                                    void companion.setModelRoute(provider, model);
                                                                }, children: [!snapshot.providers.some((provider) => provider.id === active.topic.modelConfig.provider
                                                                        && provider.models.some((model) => model.id === active.topic.modelConfig.model)) && (_jsxs("option", { value: modelValue(active.topic.modelConfig.provider, active.topic.modelConfig.model), children: [active.topic.modelConfig.provider, " / ", active.topic.modelConfig.model] })), snapshot.providers.map((provider) => (_jsx("optgroup", { label: provider.name, children: provider.models.map((model) => (_jsx("option", { value: modelValue(provider.id, model.id), children: model.name }, model.id))) }, provider.id)))] }), selectedModel !== undefined && selectedModel.reasoningEfforts.length > 0 && (_jsxs("select", { "aria-label": "\u601D\u8003\u5F3A\u5EA6", value: active.topic.modelConfig.reasoningEffort ?? '', disabled: snapshot.reasoningEffortSaving || snapshot.modelRouteSaving, onChange: (event) => {
                                                                    void companion.setReasoningEffort(event.currentTarget.value === '' ? null : event.currentTarget.value);
                                                                }, children: [_jsx("option", { value: "", children: "\u6A21\u578B\u9ED8\u8BA4\u601D\u8003" }), selectedModel.reasoningEfforts.map((effort) => (_jsx("option", { value: effort.id, children: effort.name }, effort.id)))] })), _jsxs("button", { type: "button", className: css.archiveButton, "aria-label": active.topic.archived ? '恢复当前 Topic' : '归档当前 Topic', disabled: snapshot.archiving, onClick: () => { void companion.archive(!active.topic.archived); }, children: [_jsx(IconArchiveOutline20, { size: 14 }), snapshot.archiving ? '处理中…' : active.topic.archived ? '恢复' : '归档'] }), _jsx("button", { type: "button", className: css.deleteButton, disabled: snapshot.deleting, onClick: () => {
                                                                    modalReturnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
                                                                    setDeleteTarget({ sessionId: active.topic.sessionId, title: active.topic.title });
                                                                    setDeleteConfirmation('');
                                                                    setDeleteError(null);
                                                                }, children: "\u6C38\u4E45\u5220\u9664" })] })] })), active?.pendingQuestion !== null && active?.pendingQuestion !== undefined
                                                ? _jsx(QuestionCard, { pending: active.pendingQuestion, companion: companion }, active.pendingQuestion.key)
                                                : (_jsxs("form", { className: css.composer, "data-folded": composerFolded || undefined, onSubmit: submit, children: [composerFolded && _jsx("button", { type: "button", className: learningCss.action, onClick: () => {
                                                                setComposerExpanded(current => ({ ...current, [draftKey]: true }));
                                                                requestAnimationFrame(() => composerRef.current?.focus());
                                                            }, children: question.trim() === '' ? '补充问题' : '编辑草稿' }), _jsx("textarea", { hidden: composerFolded, ref: composerRef, rows: 2, maxLength: 11_000, "aria-label": "\u7EE7\u7EED\u5411 CiteCiter \u63D0\u95EE", value: question, disabled: active === null, onChange: (event) => setQuestion(event.currentTarget.value), onKeyDown: (event) => {
                                                                if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.nativeEvent.isComposing) {
                                                                    event.preventDefault();
                                                                    event.currentTarget.form?.requestSubmit();
                                                                }
                                                            }, placeholder: active === null ? 'Topic 创建后可继续追问' : stage === undefined ? '继续问，或写下你卡住的地方…' : `补充你的问题，或直接发送“${stage.label}”` }), _jsxs("div", { className: css.composerActions, children: [_jsxs("span", { children: [stage === undefined ? '自由追问' : stage.label, " \u00B7 Ctrl/\u2318 + Enter \u53D1\u9001"] }), _jsx("button", { className: css.sendButton, type: snapshot.phase === 'running' ? 'button' : 'submit', disabled: snapshot.phase === 'stopping'
                                                                        || snapshot.phase !== 'running' && (!canAsk || active === null || question.trim() === '' && stageId === null), "aria-label": snapshot.phase === 'running' ? '停止回答' : snapshot.phase === 'stopping' ? '正在停止' : '发送', onClick: snapshot.phase === 'running' ? () => { void companion.stop(); } : undefined, children: snapshot.phase === 'running' || snapshot.phase === 'stopping'
                                                                        ? _jsx(IconStopFill16, { size: 16 })
                                                                        : _jsx(IconSendOutline16, { size: 16 }) })] })] }))] }))] }) })] }) }), !floating && _jsx(OverlayPortal, { children: _jsxs("div", { className: css.fullscreenNotice, role: "status", children: ["\u5B66\u4E60\u680F\u5DF2\u6253\u5F00\u3002\u9000\u51FA\u6587\u4EF6\u5168\u5C4F\u67E5\u770B\uFF0C\u6216 ", _jsx("button", { type: "button", onClick: () => bus.setPresentation('floating'), children: "\u60AC\u6D6E\u67E5\u770B" })] }) }), _jsx(Modal, { open: newTopicOpen, onClose: () => {
                    if (!newTopicSubmitting) {
                        setNewTopicOpen(false);
                        setNewTopicError(null);
                        companion.dismissError();
                    }
                }, closeLabel: "\u5173\u95ED", title: "\u65B0\u5EFA\u81EA\u7531 Topic", description: "\u9996\u6761\u95EE\u9898\u53D1\u51FA\u540E\u624D\u4F1A\u521B\u5EFA Topic\uFF1B\u65B0\u4E3B\u4F1A\u8BDD\u8BF7\u5148\u53D1\u9001\u4E00\u6761\u4E3B\u5BF9\u8BDD\u6D88\u606F\uFF0C\u8BA9\u6A21\u578B\u8DEF\u7531\u5C31\u7EEA\u3002", footer: (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "outline", disabled: newTopicSubmitting, onClick: () => {
                                setNewTopicOpen(false);
                                setNewTopicError(null);
                                companion.dismissError();
                            }, children: "\u53D6\u6D88" }), _jsx(Button, { variant: "primary", disabled: newTopicQuestion.trim() === '' || newTopicSubmitting || snapshot.sourceSessionId === null, onClick: () => { void submitNewTopic(); }, children: newTopicSubmitting ? '创建中…' : newTopicScenario === 'present' ? '开始讲解' : '开始问答' })] })), children: _jsxs("div", { className: css.newTopicForm, children: [_jsxs("fieldset", { className: css.scenarioPicker, children: [_jsx("legend", { children: "Topic \u5F62\u6001" }), _jsxs("button", { type: "button", "data-active": newTopicScenario === 'qa' || undefined, "aria-pressed": newTopicScenario === 'qa', onClick: () => {
                                        setNewTopicScenario('qa');
                                        setNewTopicError(null);
                                    }, children: [_jsx("strong", { children: "\u95EE\u7B54" }), _jsx("span", { children: "\u56F4\u7ED5\u95EE\u9898\u76F4\u63A5\u5206\u6790" })] }), _jsxs("button", { type: "button", "data-active": newTopicScenario === 'present' || undefined, "aria-pressed": newTopicScenario === 'present', onClick: () => {
                                        setNewTopicScenario('present');
                                        setNewTopicError(null);
                                    }, children: [_jsx("strong", { children: "\u5B66\u4E60\u8BB2\u89E3" }), _jsx("span", { children: "\u4ECE\u5E95\u5C42\u903B\u8F91\u5F00\u59CB\uFF0C\u6309\u9700\u5C55\u5F00\u4E94\u4E2A\u9636\u6BB5" })] })] }), _jsx("textarea", { autoFocus: true, rows: 5, maxLength: 11_000, value: newTopicQuestion, disabled: newTopicSubmitting, "aria-label": "\u81EA\u7531 Topic \u7684\u9996\u4E2A\u95EE\u9898", placeholder: newTopicScenario === 'present' ? '想让 CiteCiter 讲解什么？' : '想和 CiteCiter 讨论什么？', onChange: (event) => {
                                setNewTopicQuestion(event.currentTarget.value);
                                setNewTopicError(null);
                            } }), newTopicError !== null && (_jsx("div", { className: css.modalError, role: "alert", children: friendlyFailure(snapshot.error ?? newTopicError) }))] }) }), _jsx(Modal, { open: deleteTarget !== null, onClose: () => {
                    if (!snapshot.deleting)
                        setDeleteTarget(null);
                }, closeLabel: "\u5173\u95ED", title: "\u6C38\u4E45\u5220\u9664 Topic", ...deleteTarget === null ? {} : {
                    description: `这会永久删除“${deleteTarget.title}”。请输入完整 Topic Session ID 确认。`,
                }, footer: (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "outline", disabled: snapshot.deleting, onClick: () => setDeleteTarget(null), children: "\u53D6\u6D88" }), _jsx(Button, { variant: "outline", className: css.deleteAction, disabled: deleteTarget === null || deleteConfirmation !== deleteTarget.sessionId || snapshot.deleting, onClick: () => { void confirmDelete(); }, children: snapshot.deleting ? '删除中…' : '永久删除' })] })), children: deleteTarget !== null && (_jsxs("div", { className: css.deleteForm, children: [_jsx("code", { children: deleteTarget.sessionId }), _jsx("input", { autoFocus: true, value: deleteConfirmation, disabled: snapshot.deleting, "aria-label": "\u8F93\u5165 Topic Session ID \u4EE5\u786E\u8BA4\u6C38\u4E45\u5220\u9664", placeholder: "\u7C98\u8D34\u4E0A\u65B9 Session ID", onChange: (event) => setDeleteConfirmation(event.currentTarget.value) }), deleteError !== null && _jsx("div", { className: css.modalError, role: "alert", children: friendlyFailure(snapshot.error ?? deleteError) })] })) })] }));
}

import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useCompactNavigation } from "../compact-navigation.js";
import { useTranscriptPosition } from "../transcript-position.js";
import { TopicHeader } from "./TopicHeader.js";
import { UserMessageBody } from "./UserMessageBody.js";
import { MessageAttachments } from "./MessageAttachments.js";
import { BoardCaptureSurface } from "./BoardCaptureSurface.js";
import { FileAttachments } from "./FileAttachments.js";
import { FileDropHint } from "./FileDropHint.js";
import { useFileDrop } from "../file-drop.js";
import { NativeQueue } from "./NativeQueue.js";
import { NativeInteraction } from "./NativeInteraction.js";
import { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { Button, DisclosureRow, IconQuestionOutline14, IconSparkle16, JsonTree, Modal, } from '@deepseek-ai/dsh-client-ui-primitives';
import { parseNextQuestions } from "../prompt.js";
import { isTopicMessageVisible } from "../topic-presentation.js";
import collapseArrowUrl from '../assets/collapse-arrow.svg';
import mascotUrl from '../assets/citeciter-mascot.png';
import { QuestionCard } from "./QuestionCard.js";
import { OverlayPortal } from "./OverlayPortal.js";
import { RichAnswer } from "./RichAnswer.js";
import { ReasoningDisclosure } from "./ReasoningDisclosure.js";
import css from './CiteCiter.module.css';
import { jsonTreeLabels } from "../copy.js";
import { usePanelDrag } from "../panel-drag.js";
import { findContainingFrame, useHostDock } from "../host-dock.js";
import { projectLearningCards } from "../../learning.js";
import { topicDraftReferences, serializeDraftReferences } from "../draft-references.js";
import { withLearningRoute } from "../learning-route.js";
import { ReferenceAttachments } from "./ReferenceAttachments.js";
import { LearningRoute } from "./LearningRoute.js";
import { LearningCards } from "./LearningCards.js";
import { TopicComposer } from "./TopicComposer.js";
import { TopicSettingsDialog } from "./TopicSettingsDialog.js";
import { TopicNavigation } from "./TopicNavigation.js";
import { TopicTitle } from "./TopicTitle.js";
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
function ToolRow({ message, sessionId, load }) {
    const args = jsonObject(message.arguments);
    const result = message.result === null ? null : jsonObject(message.result);
    const summary = message.running
        ? compactPreview(message.arguments)
        : message.isError
            ? '调用失败'
            : compactPreview(message.result || ((message.attachments?.length ?? 0) > 0 ? '图片已返回' : '完成'));
    return (_jsx("div", { "data-citeciter-message": message.id, children: _jsx(FlowDisclosure, { icon: message.name === 'ask_user_question' ? _jsx(IconQuestionOutline14, {}) : _jsx(IconSparkle16, {}), title: message.name, summary: summary, running: message.running, children: _jsxs("div", { className: css.toolPreview, children: [_jsx(MessageAttachments, { sessionId: sessionId, attachments: message.attachments ?? [], load: load }), _jsx("strong", { children: "\u53C2\u6570" }), args === null ? _jsx("pre", { children: message.arguments }) : _jsx(JsonTree, { data: args, label: "\u5DE5\u5177\u53C2\u6570", copyable: false, labels: jsonTreeLabels }), message.result !== null && (_jsxs(_Fragment, { children: [_jsx("strong", { children: message.isError ? '错误' : '结果' }), result === null
                                ? _jsx("pre", { children: message.result })
                                : _jsx(JsonTree, { data: result, label: "\u5DE5\u5177\u7ED3\u679C", copyable: false, labels: jsonTreeLabels })] }))] }) }) }));
}
function ErrorTurn({ message }) {
    const summary = friendlyFailure(message.text);
    return (_jsxs("article", { className: css.errorTurn, "data-citeciter-message": message.id, "data-status": message.status, role: message.status === 'failed' ? 'alert' : undefined, children: [_jsx("div", { className: css.turnRole, children: message.status === 'stopped' ? '已停止' : '请求失败' }), _jsx("p", { children: summary }), _jsxs("div", { className: css.errorMeta, children: [_jsxs("span", { children: ["\u7B2C ", message.attempt, " \u6B21\u8BF7\u6C42"] }), _jsx("span", { children: message.bodyRetained ? '已保留已生成正文' : '未产生可保留正文' }), _jsx("span", { children: message.status === 'stopped' ? '可继续追问' : '可修改问题后重试' })] }), summary !== message.text && _jsxs("details", { children: [_jsx("summary", { children: "\u6280\u672F\u8BE6\u60C5" }), _jsx("pre", { children: message.text })] })] }));
}
function AssistantTurn({ message, disabled, onQuestion, reportParseError, }) {
    const parsed = useMemo(() => parseNextQuestions(message.text, message.streaming), [message.streaming, message.text]);
    useEffect(() => {
        if (!message.streaming && parsed.invalid)
            reportParseError(message.id);
    }, [message.id, message.streaming, parsed.invalid, reportParseError]);
    return (_jsxs("article", { className: css.assistantTurn, "data-citeciter-message": message.renderKey ?? message.id, children: [_jsx("div", { className: css.turnRole, children: "CiteCiter" }), message.reasoning !== null && message.reasoning.trim() !== '' && (_jsx(ReasoningDisclosure, { text: message.reasoning, active: message.streaming && message.text === '' })), parsed.text !== '' && _jsx(RichAnswer, { text: parsed.text, streaming: message.streaming }), !message.streaming && parsed.questions.length === 3 && (_jsxs("fieldset", { className: css.nextQuestions, children: [_jsx("legend", { children: "\u63A5\u4E0B\u6765\u53EF\u80FD\u60F3\u95EE" }), parsed.questions.map((question) => (_jsx("button", { type: "button", disabled: disabled, onClick: () => onQuestion(question), children: question }, question)))] }))] }));
}
/**
 * Render the independent Topic workspace on the right edge of the shell.
 * @param props - shared panel bus, Topic controller, and host callbacks.
 * @returns the responsive Topic dock and its dialogs, or null while closed.
 */
export function CitePanel({ nativeComposer, useCompanion, useOverlay, useInteractions, useSubmission, bus, companion, closePanel, openReader, reportParseError }) {
    const overlay = useOverlay(value => value);
    const snapshot = useCompanion(value => value);
    const pendingInteraction = useInteractions(value => snapshot.active?.topic.hosted === true ? value.get(snapshot.active.topic.sessionId) : undefined);
    const draftKey = snapshot.active?.topic.sessionId ?? snapshot.sourceSessionId ?? 'new';
    const [drafts, setDrafts] = useState({});
    const question = drafts[draftKey] ?? '';
    const setQuestion = useCallback((value) => {
        setDrafts(current => ({ ...current, [draftKey]: typeof value === 'string' ? value : value(current[draftKey] ?? '') }));
    }, [draftKey]);
    const [files, setFiles] = useState({});
    const defaultDelivery = useSubmission(value => value);
    const [deliveryOverride, setDeliveryOverride] = useState(null);
    const delivery = deliveryOverride?.key === draftKey && deliveryOverride.base === defaultDelivery ? deliveryOverride.mode : defaultDelivery;
    const setDelivery = (mode) => setDeliveryOverride({ key: draftKey, base: defaultDelivery, mode });
    const [attachmentError, setAttachmentError] = useState(null);
    const [references, setReferences] = useState({});
    const consumedSeeds = useRef(new Set());
    const [views, setViews] = useState({});
    const view = views[draftKey] ?? 'explain';
    const setView = (next) => setViews(current => ({ ...current, [draftKey]: next }));
    const cards = useMemo(() => projectLearningCards(snapshot.active?.messages ?? []), [snapshot.active?.messages]);
    const [topicSettingsOpen, setTopicSettingsOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [deleteError, setDeleteError] = useState(null);
    const [widthPercent, setWidthPercent] = useState(snapshot.settings.panelWidthPercent);
    const dockWidthPercent = widthPercent;
    const resizeOrigin = useRef(null);
    const panelRef = useRef(null);
    const composerRef = useRef(null);
    const transcript = useTranscriptPosition(draftKey, snapshot.active?.messages);
    const modalReturnFocusRef = useRef(null);
    const open = overlay.panelOpen;
    const active = snapshot.active;
    const addFiles = (batch) => {
        if (active === null)
            return;
        const key = active.topic.sessionId;
        void nativeComposer.add(key, batch).then(added => {
            setFiles(current => ({ ...current, [key]: [...(current[key] ?? []), ...added] }));
            setAttachmentError(null);
        }).catch(error => setAttachmentError(String(error)));
    };
    const canDropFiles = active !== null && active.topic.modelConfig !== undefined;
    const fileDrop = useFileDrop(open, canDropFiles, addFiles);
    const canAsk = snapshot.phase === 'ready' || snapshot.phase === 'stopped' || snapshot.phase === 'error' || snapshot.phase === 'running';
    const dock = useHostDock(panelRef, open, widthPercent, overlay.presentation === 'floating');
    const compact = dock?.mode === 'page';
    const floating = overlay.presentation === 'floating' && !compact;
    useCompactNavigation(panelRef, open && compact);
    const drag = usePanelDrag(panelRef, floating, bus.setPresentation);
    const floatPosition = drag.position;
    const docked = !floating && dock?.mode === 'columns';
    const composerFolded = false;
    useEffect(() => open ? companion.retainVisible() : undefined, [companion, open]);
    useEffect(() => setWidthPercent(snapshot.settings.panelWidthPercent), [snapshot.settings.panelWidthPercent]);
    useEffect(() => {
        setTopicSettingsOpen(false);
    }, [active?.topic.sessionId]);
    useEffect(() => {
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
        const citation = overlay.boardCitation;
        if (citation === null || active?.topic.sessionId !== citation.topicSessionId)
            return;
        setReferences(current => ({ ...current, [citation.topicSessionId]: [...(current[citation.topicSessionId] ?? []), { id: `board-${citation.id}`, kind: 'board', label: '板书引用', content: citation.prompt }] }));
        setViews(current => ({ ...current, [citation.topicSessionId]: 'explain' }));
        bus.clearBoardCitation(citation.id);
        requestAnimationFrame(() => composerRef.current?.focus());
    }, [active?.topic.sessionId, bus, overlay.boardCitation, setQuestion]);
    useEffect(() => {
        const seed = snapshot.composeSeed;
        if (seed === null || active?.topic.sessionId !== seed.sessionId || consumedSeeds.current.has(seed.id))
            return;
        consumedSeeds.current.add(seed.id);
        setDrafts(current => ({ ...current, [seed.sessionId]: seed.question }));
        setReferences(current => ({ ...current, [seed.sessionId]: topicDraftReferences(active.topic, active.documentTitle) }));
        requestAnimationFrame(() => composerRef.current?.focus());
    }, [snapshot.composeSeed, active]);
    const modalTitle = deleteTarget !== null ? '永久删除 Topic' : topicSettingsOpen ? 'Topic 设置' : null;
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
    const visibleMessages = active?.messages.filter((message) => isTopicMessageVisible(message, active.messages)) ?? [];
    if (!open)
        return null;
    const submit = (event, mode = delivery) => {
        event.preventDefault();
        if (!canAsk || snapshot.modelRouteSaving || snapshot.reasoningEffortSaving)
            return;
        const value = question.trim();
        if (value === '' && (references[draftKey]?.length ?? 0) === 0 && (files[draftKey]?.length ?? 0) === 0)
            return;
        const submitted = question;
        const selectedReferences = references[draftKey] ?? [];
        const payload = withLearningRoute(serializeDraftReferences(value, selectedReferences), snapshot.settings.learningRoute ?? false);
        const sentFiles = files[draftKey] ?? [];
        void companion.ask(payload, sentFiles.map(file => file.id), mode).then((sent) => {
            if (sent) {
                setQuestion((current) => current === submitted ? '' : current);
                setFiles(current => ({ ...current, [draftKey]: (current[draftKey] ?? []).filter(file => !sentFiles.some(sent => sent.id === file.id)) }));
                const sentIds = new Set(selectedReferences.map(item => item.id));
                setReferences(current => ({ ...current, [draftKey]: (current[draftKey] ?? []).filter(item => !sentIds.has(item.id)) }));
            }
        });
    };
    const openNewTopic = () => { void companion.createFree('', 'qa'); };
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
    return (_jsxs(_Fragment, { children: [active?.captureId && _jsx(BoardCaptureSurface, { id: active.captureId, sessionId: active.topic.sessionId, board: active.board, reply: companion.boardCaptureReply }, active.captureId), drag.dockTarget && _jsx(OverlayPortal, { children: _jsx("div", { className: css.dockTarget, "aria-label": "\u677E\u5F00\u4EE5\u505C\u9760" }) }), _jsx(OverlayPortal, { inline: !floating, children: _jsxs("aside", { ref: panelRef, className: `${css.dock} ${floating ? css.floating : ''}`, style: {
                        width: floating ? undefined : dock?.width,
                        height: floating ? undefined : dock?.height,
                        top: floating ? undefined : dock?.top,
                        ...(floating && floatPosition !== null ? { left: floatPosition.left, top: floatPosition.top, right: 'auto' } : {}),
                        '--citeciter-panel-width': `${dockWidthPercent}vw`,
                    }, "data-citeciter-panel": true, ...fileDrop.handlers, "data-arrangement": floating ? 'floating' : dock?.mode ?? 'unsupported', "aria-label": "CiteCiter \u5B66\u4E60\u4F34\u4FA3", children: [fileDrop.active && _jsx(FileDropHint, { enabled: canDropFiles, title: active?.topic.title }), docked && !floating && (_jsx("div", { className: css.resizeHandle, role: "separator", "aria-label": "\u8C03\u6574 CiteCiter \u5BBD\u5EA6", "aria-orientation": "vertical", "aria-valuemin": 28, "aria-valuemax": 55, "aria-valuenow": widthPercent, tabIndex: 0, onPointerDown: startResize, onPointerMove: moveResize, onPointerUp: endResize, onPointerCancel: () => { resizeOrigin.current = null; }, onKeyDown: resizeKey })), !compact && _jsx("button", { className: css.closeButton, type: "button", onClick: closePanel, "aria-label": "\u5173\u95ED CiteCiter", children: _jsx("img", { src: collapseArrowUrl, alt: "" }) }), !floating && dock === null && _jsx("p", { className: css.layoutNotice, role: "status", children: "\u5F53\u524D\u5BBF\u4E3B\u5E03\u5C40\u6682\u4E0D\u652F\u6301\u5B66\u4E60\u680F\u3002\u8BF7\u5207\u6362\u5230\u6807\u51C6 Web \u5E03\u5C40\u6216 Desktop \u517C\u5BB9\u6A21\u5F0F\u3002" }), _jsx("div", { className: css.dockBody, children: _jsxs("section", { className: css.learningWorkspace, children: [_jsx(TopicHeader, { compact: compact, onBack: closePanel, onDrag: drag.start, status: PHASE_LABEL[snapshot.phase], title: active === null ? _jsx("strong", { children: "Citer" }) : _jsx(TopicTitle, { id: active.topic.sessionId, title: active.topic.title, onRename: companion.rename }), children: _jsx(TopicNavigation, { topics: snapshot.topics, activeId: active?.topic.sessionId, archived: snapshot.includeArchived, onOpen: id => { void companion.openTopic(id); }, onNew: openNewTopic, onArchiveView: companion.setIncludeArchived, onReader: openReader, onSettings: () => { modalReturnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setTopicSettingsOpen(true); } }) }), snapshot.topicsStatus === 'error' && _jsxs("p", { className: css.panelError, role: "alert", children: ["Topic \u8BFB\u53D6\u5931\u8D25\uFF1A", snapshot.topicsError] }), snapshot.notice !== null && _jsx("div", { className: css.panelNotice, role: "status", children: snapshot.notice }), active === null && snapshot.draftQuote === null ? (_jsxs("div", { className: css.emptyState, children: [_jsx("div", { className: css.emptyWhale, "aria-hidden": "true", children: _jsx("img", { src: mascotUrl, alt: "" }) }), _jsx("h2", { children: "\u628A\u6CA1\u61C2\u7684\u5730\u65B9\uFF0C\u6162\u6162\u8BB2\u660E\u767D" }), _jsx("p", { children: "\u65B0\u5EFA\u4E00\u4E2A\u5B66\u4E60 Topic\uFF0C\u6216\u9009\u4E2D\u4E3B\u5BF9\u8BDD\u4E2D\u7684\u6587\u5B57\uFF0C\u4ECE\u95EE\u9898\u672C\u8EAB\u5F00\u59CB\u3002" }), _jsx("button", { className: learningCss.action, type: "button", onClick: openNewTopic, children: "\u5F00\u59CB\u5B66\u4E60" }), snapshot.phase === 'creating' && _jsx("div", { className: css.loadingCard, children: "\u6B63\u5728\u521B\u5EFA Topic\u2026" }), snapshot.error !== null && _jsx("p", { className: css.panelError, role: "alert", children: friendlyFailure(snapshot.error) })] })) : (_jsxs(_Fragment, { children: [_jsxs("details", { className: `${css.contextBar} ${learningCss.source}`, children: [_jsx("summary", { children: active?.topic.citation == null ? '自由讨论 · 查看上下文' : `引用来源 · ${compactPreview(active.topic.citation.displayText, 70)}` }), _jsx("blockquote", { children: active?.topic.citation === null
                                                            ? '无引用 · 自由讨论'
                                                            : '“' + (active?.topic.citation?.displayText ?? snapshot.draftQuote) + '”' }), active !== null && (_jsxs("div", { className: css.contextMeta, children: [_jsx("span", { "data-ok": active.topic.sourceAvailable || undefined, children: active.topic.sourceAvailable ? '来源在线' : '来源不可用' }), _jsx("span", { children: active.topic.observedThroughSeq === null
                                                                    ? '等待按需读取来源'
                                                                    : '来源已同步' })] }))] }), _jsx(LearningRoute, { enabled: snapshot.settings.learningRoute ?? false, messages: active?.messages ?? [], onChange: value => { void companion.setSetting('learningRoute', value); } }), _jsxs("div", { className: learningCss.views, "aria-label": "\u5B66\u4E60\u5185\u5BB9\u89C6\u56FE", children: [_jsx("button", { type: "button", "aria-pressed": view === 'explain', onClick: () => setView('explain'), children: "\u8BB2\u89E3" }), _jsxs("button", { type: "button", "aria-pressed": view === 'cards', onClick: () => setView('cards'), children: ["\u5B66\u4E60\u5361", _jsx("span", { className: learningCss.count, children: cards.cards.length })] })] }), view === 'explain' && _jsxs("div", { ref: transcript.ref, className: css.transcript, "aria-live": "polite", onScroll: transcript.onScroll, children: [visibleMessages.map((message) => {
                                                        if (message.role === 'tool')
                                                            return _jsx(ToolRow, { message: message, sessionId: active.topic.sessionId, load: nativeComposer.attachment }, message.id);
                                                        if (message.role === 'user')
                                                            return (_jsxs("article", { className: css.userTurn, "data-citeciter-message": message.id, "aria-label": "\u7528\u6237\u6D88\u606F", children: [_jsx(MessageAttachments, { sessionId: active.topic.sessionId, attachments: message.attachments ?? [], load: nativeComposer.attachment }), message.text.startsWith('【学习阶段：') ? _jsxs("details", { className: learningCss.questionDetails, children: [_jsxs("summary", { children: [message.text.split('\n')[0], message.text.includes('\n\n我的问题：') ? ` · ${message.text.split('\n\n我的问题：').slice(1).join('\n\n我的问题：')}` : ''] }), _jsx("p", { children: message.text })] }) : _jsx(UserMessageBody, { text: message.text })] }, message.id));
                                                        if (message.role === 'error')
                                                            return _jsx(ErrorTurn, { message: message }, message.id);
                                                        if (message.role === 'context')
                                                            return null;
                                                        return (_jsx(AssistantTurn, { message: message, disabled: !canAsk, onQuestion: (value) => {
                                                                setQuestion(current => current.trim() === '' ? value : `${current}\n${value}`);
                                                                requestAnimationFrame(() => composerRef.current?.focus());
                                                            }, reportParseError: reportParseError }, message.renderKey ?? message.id));
                                                    }), snapshot.phase === 'creating' && _jsx("div", { className: css.loadingCard, children: "\u6B63\u5728\u9A8C\u8BC1\u5F15\u7528\u5E76\u5EFA\u7ACB Topic\u2026" }), snapshot.error !== null && (_jsx("p", { className: css.panelError, "data-citeciter-error": true, role: "alert", children: friendlyFailure(snapshot.error) }))] }), view === 'cards' && active !== null && _jsx("div", { className: learningCss.content, children: _jsx(LearningCards, { projection: cards, recall: snapshot.settings.activeRecall ?? false, setRecall: value => { void companion.setSetting('activeRecall', value); }, disabled: snapshot.settingsSaveStatus === 'saving', topicTitle: active.topic.title, topicId: active.topic.sessionId, source: active.topic.citation?.displayText ?? '无引用 · 自由讨论', onRevise: () => {
                                                        setQuestion('请先核对本 Topic 的结论，纠正错误并标明未核实内容，再生成总结学习卡片。');
                                                        setView('explain');
                                                        requestAnimationFrame(() => composerRef.current?.focus());
                                                    } }, active.topic.sessionId) }), view !== 'explain' && snapshot.error !== null && _jsx("p", { className: css.panelError, role: "alert", children: friendlyFailure(snapshot.error) }), active?.topic.hosted === true && _jsx(NativeQueue, { sessionId: active.topic.sessionId, native: nativeComposer }), pendingInteraction !== undefined && _jsx(NativeInteraction, { pending: pendingInteraction, messages: active?.messages ?? [] }, pendingInteraction.key), active?.pendingQuestion !== null && active?.pendingQuestion !== undefined
                                                ? _jsx(QuestionCard, { pending: active.pendingQuestion, onAnswer: answer => companion.answerQuestion(active.pendingQuestion.key, answer), onCancel: () => companion.cancelQuestion(active.pendingQuestion.key) }, active.pendingQuestion.key)
                                                : (_jsx(TopicComposer, { sources: active === null ? [] : topicDraftReferences(active.topic, active.documentTitle).filter(reference => !(references[draftKey] ?? []).some(current => current.label === reference.label)), onReference: reference => setReferences(current => ({ ...current, [draftKey]: [...(current[draftKey] ?? []), reference] })), permission: active?.topic.permission ?? 'read-only', onPermission: mode => { void companion.setPermission(mode); }, delivery: delivery, onDelivery: setDelivery, onFiles: addFiles, question: question, route: active?.topic.modelConfig, providers: snapshot.providers, phase: snapshot.phase, canSend: canAsk && active !== null && (question.trim() !== '' || (references[draftKey]?.length ?? 0) > 0 || (files[draftKey]?.length ?? 0) > 0), routeSaving: snapshot.modelRouteSaving || snapshot.reasoningEffortSaving, folded: composerFolded, inputRef: composerRef, onQuestion: setQuestion, onSubmit: submit, placeholder: "\u8F93\u5165\u95EE\u9898 \u00B7 Enter \u53D1\u9001\uFF0CShift + Enter \u6362\u884C", attachments: _jsxs(_Fragment, { children: [attachmentError && _jsx("p", { role: "alert", children: attachmentError }), _jsx(FileAttachments, { native: nativeComposer, sessionId: draftKey, files: files[draftKey] ?? [], remove: id => { nativeComposer.remove(id); setFiles(current => ({ ...current, [draftKey]: (current[draftKey] ?? []).filter(file => file.id !== id) })); } }), _jsx(ReferenceAttachments, { references: references[draftKey] ?? [], onRemove: id => setReferences(current => ({ ...current, [draftKey]: (current[draftKey] ?? []).filter(item => item.id !== id) })) })] }), onExpand: () => {
                                                        requestAnimationFrame(() => composerRef.current?.focus());
                                                    }, onStop: () => { void companion.stop(); }, onModel: (provider, model) => { void companion.setModelRoute(provider, model); }, onReasoning: effort => { void companion.setReasoningEffort(effort); } }))] }))] }) })] }) }), !floating && _jsx(OverlayPortal, { children: _jsxs("div", { className: css.fullscreenNotice, role: "status", children: ["\u5B66\u4E60\u680F\u5DF2\u6253\u5F00\u3002\u9000\u51FA\u6587\u4EF6\u5168\u5C4F\u67E5\u770B\uFF0C\u6216 ", _jsx("button", { type: "button", onClick: () => bus.setPresentation('floating'), children: "\u60AC\u6D6E\u67E5\u770B" })] }) }), _jsx(TopicSettingsDialog, { open: topicSettingsOpen, topic: active?.topic, archiving: snapshot.archiving, deleting: snapshot.deleting, error: snapshot.error === null ? null : friendlyFailure(snapshot.error), onClose: () => setTopicSettingsOpen(false), onArchive: companion.archive, onDelete: () => {
                    if (active === null)
                        return;
                    setTopicSettingsOpen(false);
                    setDeleteTarget({ sessionId: active.topic.sessionId, title: active.topic.title });
                    setDeleteConfirmation('');
                    setDeleteError(null);
                } }), _jsx(Modal, { open: deleteTarget !== null, onClose: () => {
                    if (!snapshot.deleting)
                        setDeleteTarget(null);
                }, closeLabel: "\u5173\u95ED", title: "\u6C38\u4E45\u5220\u9664 Topic", ...deleteTarget === null ? {} : {
                    description: `这会永久删除“${deleteTarget.title}”。请输入完整 Topic Session ID 确认。`,
                }, footer: (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "outline", disabled: snapshot.deleting, onClick: () => setDeleteTarget(null), children: "\u53D6\u6D88" }), _jsx(Button, { variant: "outline", className: css.deleteAction, disabled: deleteTarget === null || deleteConfirmation !== deleteTarget.sessionId || snapshot.deleting, onClick: () => { void confirmDelete(); }, children: snapshot.deleting ? '删除中…' : '永久删除' })] })), children: deleteTarget !== null && (_jsxs("div", { className: css.deleteForm, children: [_jsx("code", { children: deleteTarget.sessionId }), _jsx("input", { autoFocus: true, value: deleteConfirmation, disabled: snapshot.deleting, "aria-label": "\u8F93\u5165 Topic Session ID \u4EE5\u786E\u8BA4\u6C38\u4E45\u5220\u9664", placeholder: "\u7C98\u8D34\u4E0A\u65B9 Session ID", onChange: (event) => setDeleteConfirmation(event.currentTarget.value) }), deleteError !== null && _jsx("div", { className: css.modalError, role: "alert", children: friendlyFailure(snapshot.error ?? deleteError) })] })) })] }));
}

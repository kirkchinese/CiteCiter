import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useSyncExternalStore } from 'react';
import { RichAnswer } from "./RichAnswer.js";
import css from './CiteCiter.module.css';
const PHASE_LABEL = {
    idle: '空闲',
    creating: '正在创建解释会话…',
    ready: '解释会话已就绪',
    running: '正在解释…',
    settled: '解释完成',
    error: '解释失败',
};
/**
 * Render the right details-column explanation panel.
 * @param props - selection state, close action, and explainer face.
 * @returns panel element with current status and response.
 */
export function CitePanel({ bus, close, explainer }) {
    const subscribeBus = useCallback((onStoreChange) => bus.subscribe(onStoreChange), [bus]);
    const subscribeExplainer = useCallback((onStoreChange) => explainer.subscribe(onStoreChange), [explainer]);
    const selection = useSyncExternalStore(subscribeBus, () => bus.getPanelSelection());
    const snapshot = useSyncExternalStore(subscribeExplainer, () => explainer.getSnapshot());
    return (_jsxs("div", { className: css.panel, "data-citeciter-panel": true, children: [_jsxs("header", { className: css.panelHeader, children: [_jsx("span", { className: css.panelTitle, children: "CiteCiter" }), _jsx("button", { className: css.closeButton, type: "button", "aria-label": "Close", onClick: close, children: "\u00D7" })] }), selection === null && snapshot.selection === null ? (_jsx("p", { className: css.panelHint, children: "\u9009\u4E2D\u52A9\u624B\u56DE\u590D\u4E2D\u7684\u4E00\u6BB5\u6587\u5B57\uFF0C\u53F3\u952E\u9009\u62E9 Citer!\u3002" })) : (_jsxs("div", { className: css.panelBody, children: [_jsx("blockquote", { className: css.quote, children: (selection ?? snapshot.selection)?.text }), _jsxs("dl", { className: css.meta, children: [_jsx("dt", { children: "anchor" }), _jsx("dd", { children: (selection ?? snapshot.selection)?.anchorKey }), _jsx("dt", { children: "child" }), _jsx("dd", { children: snapshot.childId ?? '—' }), _jsx("dt", { children: "status" }), _jsx("dd", { children: PHASE_LABEL[snapshot.phase] })] }), snapshot.error !== null && (_jsx("p", { className: css.panelError, "data-citeciter-error": true, children: snapshot.error })), snapshot.answerText !== null && snapshot.answerText !== '' && (_jsx("div", { className: css.panelAnswer, children: _jsx(RichAnswer, { text: snapshot.answerText, streaming: snapshot.phase === 'running' }) })), _jsxs("div", { className: css.panelActions, children: [snapshot.phase === 'running' && (_jsx("button", { className: css.actionButton, type: "button", onClick: () => { void explainer.stop(); }, children: "\u505C\u6B62" })), _jsx("span", { className: css.panelNote, children: "\u89E3\u91CA\u4F1A\u8BDD\u72EC\u7ACB\u8FD0\u884C\uFF0C\u4E0D\u5199\u5165\u4E3B\u4F1A\u8BDD\u3002" })] })] }))] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { BoardView } from "./BoardView.js";
import css from './BoardView.module.css';
function citationPrompt(element) {
    if (element.kind === 'math')
        return `$$\n${element.content}\n$$`;
    if (['text', 'markdown', 'table'].includes(element.kind))
        return element.content;
    const compact = element.content.replaceAll(/\s+/gu, ' ').trim();
    const label = ['text', 'markdown', 'math', 'table'].includes(element.kind) && compact !== ''
        ? compact.slice(0, 80)
        : `黑板元素 ${element.id}`;
    return `关于黑板上的「${label}」：`;
}
/**
 * Render the session-scoped blackboard registered through conversation.view.
 * @param props - active DSH conversation identity and CiteCiter browser faces.
 * @returns the matching Topic board or a source-specific empty state.
 */
export function BlackboardWorkspace({ useCompanion, sessionId, companion, bus, openPanel }) {
    const snapshot = useCompanion(value => value);
    useEffect(() => companion.retainVisible(), [companion]);
    const active = snapshot.sourceSessionId === sessionId
        && snapshot.active?.topic.sourceSessionId === sessionId
        ? snapshot.active
        : null;
    const quote = (element) => {
        if (active === null)
            return;
        bus.requestBoardCitation(active.topic.sessionId, citationPrompt(element));
        openPanel();
    };
    if (active === null) {
        return (_jsxs("section", { className: css.workspaceEmpty, "aria-label": "CiteCiter \u5C0F\u9ED1\u677F", children: [_jsx("strong", { children: "\u5C0F\u9ED1\u677F" }), _jsx("p", { children: "\u5728 Citer \u4E2D\u53D1\u9001\u7ED8\u56FE\u6216\u6559\u5B66\u95EE\u9898\uFF0C\u677F\u4E66\u4F1A\u663E\u793A\u5728\u8FD9\u91CC\u3002" })] }));
    }
    return (_jsx(BoardView, { sessionId: active.topic.sessionId, snapshot: active.board, animations: snapshot.settings.boardAnimations ?? true, onQuoteElement: quote }));
}

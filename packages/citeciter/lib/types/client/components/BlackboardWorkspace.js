import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { boardCitationPrompt } from "../board-citation.js";
import { BoardView } from "./BoardView.js";
import css from './BoardView.module.css';
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
        bus.requestBoardCitation(active.topic.sessionId, boardCitationPrompt(element));
        openPanel();
    };
    if (active === null) {
        return (_jsxs("section", { className: css.workspaceEmpty, "aria-label": "CiteCiter \u5C0F\u9ED1\u677F", children: [_jsx("strong", { children: "\u5C0F\u9ED1\u677F" }), _jsx("p", { children: "\u5728 Citer \u4E2D\u53D1\u9001\u7ED8\u56FE\u6216\u6559\u5B66\u95EE\u9898\uFF0C\u677F\u4E66\u4F1A\u663E\u793A\u5728\u8FD9\u91CC\u3002" })] }));
    }
    return (_jsx(BoardView, { sessionId: active.topic.sessionId, snapshot: active.board, animations: snapshot.settings.boardAnimations ?? true, onQuoteElement: quote }));
}

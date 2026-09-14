import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import css from './TopicNavigation.module.css';
import { TopicActions } from "./TopicActions.js";
/** Session-list navigation with search. Receives domain rows and callbacks, without service discovery. */
export function TopicNavigation({ topics, activeId, archived, onOpen, onNew, onArchiveView, onSettings, onReader }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const ref = useRef(null);
    useEffect(() => {
        if (!open)
            return;
        const outside = (event) => { if (event.target instanceof Node && !ref.current?.contains(event.target))
            setOpen(false); };
        document.addEventListener('pointerdown', outside);
        return () => document.removeEventListener('pointerdown', outside);
    }, [open]);
    const rows = topics.filter(topic => topic.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
    return _jsxs("div", { ref: ref, className: css.navigation, children: [_jsxs("div", { className: css.actions, children: [_jsx("button", { type: "button", title: "Topic \u5217\u8868", "aria-label": "Topic \u5217\u8868", "aria-expanded": open, onClick: () => setOpen(!open), children: _jsx("svg", { viewBox: "0 0 20 20", "aria-hidden": "true", children: _jsx("path", { d: "M6 5h11M6 10h11M6 15h11M2 5h.1M2 10h.1M2 15h.1" }) }) }), _jsx("button", { type: "button", title: "\u65B0\u5EFA Topic", "aria-label": "\u65B0\u5EFA Topic", onClick: () => { setOpen(false); onNew(); }, children: _jsx("svg", { viewBox: "0 0 20 20", "aria-hidden": "true", children: _jsx("path", { d: "M10 3v14M3 10h14" }) }) }), _jsx(TopicActions, { hasTopic: activeId !== undefined, onSettings: onSettings, onReader: onReader })] }), open && _jsxs("section", { className: css.list, "aria-label": "Topic \u4F1A\u8BDD\u5217\u8868", onKeyDown: event => { if (event.key === 'Escape')
                    setOpen(false); }, children: [_jsxs("div", { className: css.search, children: [_jsx("input", { autoFocus: true, placeholder: "\u641C\u7D22 Topic", "aria-label": "\u641C\u7D22 Topic", value: query, onChange: event => setQuery(event.currentTarget.value) }), _jsx("button", { type: "button", title: archived ? '活动 Topic' : '归档 Topic', "aria-label": archived ? '活动 Topic' : '归档 Topic', "aria-pressed": archived, onClick: () => onArchiveView(!archived), children: "\u25A3" })] }), _jsxs("div", { className: css.rows, children: [rows.length === 0 && _jsx("p", { children: query ? '没有匹配的 Topic' : '暂无 Topic' }), rows.map(topic => _jsxs("button", { className: css.row, type: "button", "aria-current": activeId === topic.sessionId ? 'page' : undefined, onClick: () => { onOpen(topic.sessionId); setOpen(false); }, children: [_jsx("span", { className: css.dot, "data-running": topic.running || undefined }), _jsxs("span", { className: css.rowText, children: [_jsx("strong", { children: topic.title }), _jsx("small", { children: new Date(topic.updatedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) })] })] }, topic.sessionId))] })] })] });
}

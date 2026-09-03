import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useSyncExternalStore } from 'react';
import { readTextareaSelection } from "../reader-selection.js";
import css from './DocumentReader.module.css';
/** Reader shell-overlay entry: compact trigger plus the document library panel. */
export function DocumentReader({ reader }) {
    const snapshot = useSyncExternalStore(reader.subscribe, reader.getSnapshot);
    const textareaRef = useRef(null);
    const syncSelection = () => {
        const textarea = textareaRef.current;
        reader.setSelection(textarea === null ? null : readTextareaSelection(textarea));
    };
    const onImport = async (event) => {
        const file = event.target.files?.[0];
        if (file === undefined)
            return;
        const content = await file.text();
        await reader.importFile(file.name, content);
        event.target.value = '';
    };
    const onCreate = (event) => {
        event.preventDefault();
        void reader.createTopic();
    };
    return (_jsx("div", { className: css.root, children: !snapshot.open ? (_jsx("button", { type: "button", className: css.trigger, onClick: () => reader.setOpen(true), title: "\u6253\u5F00 CiteCiter \u8BFB\u4E66", children: "\uD83D\uDCD6" })) : (_jsxs("section", { className: css.panel, "data-citeciter-reader": true, children: [_jsxs("header", { className: css.header, children: [_jsx("h2", { children: "\u8BFB\u4E66 \u00B7 \u8BBA\u6587" }), _jsx("button", { type: "button", onClick: () => reader.setOpen(false), "aria-label": "\u5173\u95ED\u8BFB\u4E66\u9762\u677F", children: "\u00D7" })] }), snapshot.error !== null ? _jsx("p", { className: css.error, children: snapshot.error }) : null, _jsxs("label", { className: css.import, children: ["\u5BFC\u5165\u6587\u672C / Markdown", _jsx("input", { type: "file", accept: ".txt,.md,.markdown,text/plain,text/markdown", onChange: (event) => void onImport(event) })] }), _jsxs("ul", { className: css.documents, children: [snapshot.documents.map((document) => (_jsx("li", { children: _jsxs("button", { type: "button", onClick: () => void reader.openDocument(document.documentId), className: snapshot.active?.documentId === document.documentId ? css.activeDocument : undefined, children: [document.title, _jsxs("span", { children: [document.format, " \u00B7 ", document.size, " B"] })] }) }, document.documentId))), snapshot.documentsStatus === 'ready' && snapshot.documents.length === 0 ? _jsx("li", { className: css.empty, children: "\u8FD8\u6CA1\u6709\u6587\u6863" }) : null] }), _jsx("textarea", { ref: textareaRef, className: css.content, readOnly: true, value: snapshot.active?.content ?? '', placeholder: "\u9009\u62E9\u6587\u6863\u5F00\u59CB\u9605\u8BFB", onSelect: syncSelection, onMouseUp: syncSelection, onKeyUp: syncSelection }), _jsxs("form", { className: css.ask, onSubmit: onCreate, children: [_jsx("input", { value: snapshot.question, maxLength: 12_000, onChange: (event) => reader.setQuestion(event.target.value), placeholder: "\u5C31\u9009\u4E2D\u5185\u5BB9\u95EE CiteCiter\u2026", "aria-label": "\u8BFB\u4E66\u9762\u677F\u7684\u95EE\u9898" }), _jsx("button", { type: "submit", disabled: snapshot.creating || snapshot.selection === null || snapshot.question.trim() === '', children: snapshot.creating ? '创建中…' : 'Citer!' })] })] })) }));
}

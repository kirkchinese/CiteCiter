import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect } from 'react';
import { readTextareaSelection } from "../reader-selection.js";
import css from './DocumentReader.module.css';
/** Reader shell-overlay entry: compact trigger plus the document library panel. */
export function DocumentReader({ reader, useReader, registerSurface, sourceSessionId }) {
    const snapshot = useReader(value => value);
    const textareaRef = useRef(null);
    useEffect(() => {
        const element = textareaRef.current;
        const active = snapshot.active;
        if (element === null || active === null || snapshot.loading)
            return;
        return registerSurface(element, () => {
            const selected = readTextareaSelection(element);
            const source = sourceSessionId();
            return selected === null || source === null ? null : { kind: 'document', sourceSessionId: source, title: active.title, documentId: active.documentId, ...selected };
        });
    }, [registerSurface, sourceSessionId, snapshot.active, snapshot.open, snapshot.loading]);
    const syncSelection = () => {
        const textarea = textareaRef.current;
        reader.setSelection(textarea === null ? null : readTextareaSelection(textarea));
    };
    const onImport = async (event) => {
        const input = event.currentTarget;
        const file = input.files?.[0];
        if (file === undefined)
            return;
        await reader.importLocalFile(file);
        input.value = '';
    };
    const onCreate = (event) => {
        event.preventDefault();
        void reader.createTopic();
    };
    return (_jsx("div", { className: css.root, children: !snapshot.open ? (_jsx("button", { type: "button", className: css.trigger, onClick: () => reader.setOpen(true), title: "\u6253\u5F00 CiteCiter \u8BFB\u4E66", children: "\uD83D\uDCD6" })) : (_jsxs("section", { className: css.panel, "data-citeciter-reader": true, children: [_jsxs("header", { className: css.header, children: [_jsx("h2", { children: "\u6587\u6863\u9605\u8BFB" }), _jsx("button", { type: "button", onClick: () => reader.setOpen(false), "aria-label": "\u5173\u95ED\u8BFB\u4E66\u9762\u677F", children: "\u00D7" })] }), snapshot.error !== null ? _jsx("p", { className: css.error, children: snapshot.error }) : null, _jsxs("label", { className: css.import, children: [snapshot.importing ? '正在导入…' : '导入文本 / Markdown', _jsx("input", { type: "file", disabled: snapshot.importing, accept: ".txt,.md,.markdown,text/plain,text/markdown", onChange: (event) => void onImport(event) })] }), _jsxs("ul", { className: css.documents, children: [snapshot.documents.map((document) => (_jsx("li", { children: _jsxs("button", { type: "button", onClick: () => void reader.openDocument(document.documentId), className: snapshot.active?.documentId === document.documentId ? css.activeDocument : undefined, children: [document.title, _jsxs("span", { children: [document.format, " \u00B7 ", document.size, " B"] })] }) }, document.documentId))), snapshot.documentsStatus === 'ready' && snapshot.documents.length === 0 ? _jsx("li", { className: css.empty, children: "\u8FD8\u6CA1\u6709\u6587\u6863" }) : null] }), _jsx("textarea", { "aria-label": "\u6587\u6863\u6B63\u6587", "aria-busy": snapshot.loading, ref: textareaRef, className: css.content, readOnly: true, value: snapshot.active?.content ?? '', placeholder: "\u9009\u62E9\u6587\u6863\u5F00\u59CB\u9605\u8BFB", onSelect: snapshot.loading ? undefined : syncSelection, onMouseUp: snapshot.loading ? undefined : syncSelection, onKeyUp: snapshot.loading ? undefined : syncSelection }), snapshot.active !== null ? (_jsxs("nav", { className: css.pagination, "aria-label": "\u6587\u6863\u5206\u9875", children: [_jsx("button", { type: "button", disabled: snapshot.loading || snapshot.active.page === 0, onClick: () => void reader.openPage(snapshot.active.page - 1), children: "\u4E0A\u4E00\u9875" }), _jsx("span", { role: "status", children: snapshot.loading ? '加载中…' : `第 ${snapshot.active.page + 1} / ${snapshot.active.pageCount} 页` }), _jsx("button", { type: "button", disabled: snapshot.loading || snapshot.active.page + 1 >= snapshot.active.pageCount, onClick: () => void reader.openPage(snapshot.active.page + 1), children: "\u4E0B\u4E00\u9875" })] })) : null, _jsxs("form", { className: css.ask, onSubmit: onCreate, children: [_jsx("input", { value: snapshot.question, maxLength: 12_000, onChange: (event) => reader.setQuestion(event.target.value), placeholder: "\u5C31\u9009\u4E2D\u5185\u5BB9\u95EE CiteCiter\u2026", "aria-label": "\u8BFB\u4E66\u9762\u677F\u7684\u95EE\u9898" }), _jsx("button", { type: "submit", disabled: snapshot.creating || snapshot.loading || snapshot.selection === null || snapshot.question.trim() === '', children: snapshot.creating ? '创建中…' : 'Citer!' })] })] })) }));
}

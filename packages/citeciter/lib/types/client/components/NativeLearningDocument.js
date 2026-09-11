import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { decodeNativeText, nativeDocumentSource } from "../native-document.js";
import { readTextareaSelection } from "../reader-selection.js";
import css from './NativeLearningDocument.module.css';
import { documentPages } from "../../document-pages.js";
/** Alternate native document renderer. DSH owns loading, reload and file navigation. */
export function NativeLearningDocument({ content, resourceAddress, wrap, scrollportRef, registerSurface, openActions }) {
    const field = useRef(null);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const decoded = useMemo(() => { try {
        return { text: decodeNativeText(content), error: null };
    }
    catch (error) {
        return { text: '', error: error instanceof Error ? error.message : String(error) };
    } }, [content]);
    const pages = useMemo(() => documentPages(decoded.text), [decoded.text]);
    const currentPage = Math.min(page, pages.length - 1);
    const read = () => {
        const selected = field.current === null ? null : readTextareaSelection(field.current);
        if (selected === null || decoded.error !== null)
            return null;
        try {
            return nativeDocumentSource(resourceAddress, decoded.text, selected);
        }
        catch (error) {
            setError(error instanceof Error ? error.message : String(error));
            return null;
        }
    };
    useEffect(() => { const element = field.current; if (element === null)
        return; return registerSurface(element, read); }, [registerSurface, resourceAddress, decoded.text, currentPage]);
    useEffect(() => { setError(null); setPage(0); }, [content, resourceAddress]);
    useEffect(() => { field.current?.setSelectionRange(0, 0); if (field.current !== null)
        field.current.scrollTop = 0; }, [currentPage, decoded.text]);
    return _jsxs("section", { className: css.document, children: [_jsxs("header", { children: [_jsxs("div", { children: [_jsx("strong", { children: "CiteCiter \u5B66\u4E60" }), _jsx("small", { children: "\u9009\u6587 \u2192 \u6309\u4F4F\u89E6\u53D1\u952E \u2192 \u79FB\u5411\u52A8\u4F5C \u2192 \u677E\u5F00" })] }), _jsx("button", { type: "button", onClick: event => { try {
                            const source = read();
                            if (source === null) {
                                setError('请先在正文中选中文字');
                                return;
                            }
                            ;
                            setError(null);
                            const rect = event.currentTarget.getBoundingClientRect();
                            openActions(source, rect.left, rect.bottom);
                        }
                        catch (error) {
                            setError(String(error));
                        } }, children: "\u9009\u6587\u52A8\u4F5C" })] }), _jsx("p", { children: "\u4F7F\u7528\u539F\u751F\u6587\u4EF6\u4E0E\u5237\u65B0\u529F\u80FD\uFF1B\u5F00\u59CB\u5B66\u4E60\u65F6\u4FDD\u5B58\u5168\u6587\u5FEB\u7167\u3002Markdown \u548C\u4EE3\u7801\u4EE5\u6E90\u6587\u672C\u663E\u793A\u3002" }), (decoded.error ?? error) !== null && _jsx("p", { role: "alert", children: decoded.error ?? error }), pages.length > 1 && _jsxs("nav", { "aria-label": "\u5B66\u4E60\u6587\u6863\u5206\u9875", children: [_jsx("button", { type: "button", disabled: currentPage === 0, onClick: () => setPage(currentPage - 1), children: "\u4E0A\u4E00\u9875" }), _jsxs("span", { children: [currentPage + 1, " / ", pages.length] }), _jsx("button", { type: "button", disabled: currentPage === pages.length - 1, onClick: () => setPage(currentPage + 1), children: "\u4E0B\u4E00\u9875" })] }), _jsx("textarea", { ref: element => { field.current = element; scrollportRef(element); }, readOnly: true, "aria-label": "\u539F\u751F\u6587\u4EF6\u5B66\u4E60\u6B63\u6587", value: pages[currentPage] ?? '', wrap: wrap ? 'soft' : 'off', spellCheck: false })] });
}

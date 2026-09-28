import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from 'react';
import { HostImagePreview } from "../host-image-preview.js";
import css from './MessageAttachments.module.css';
/** Own an authorized image URL and its preview for exactly one mounted attachment. */
export function MessageImage({ sessionId, attachment, load }) {
    const [url, setUrl] = useState();
    const [error, setError] = useState(false);
    const [open, setOpen] = useState(false);
    const close = useCallback(() => setOpen(false), []);
    useEffect(() => {
        let disposed = false;
        let owned;
        setUrl(undefined);
        setError(false);
        setOpen(false);
        void load(sessionId, attachment.id).then(blob => {
            if (disposed)
                return;
            owned = URL.createObjectURL(blob);
            setUrl(owned);
        }).catch(() => { if (!disposed)
            setError(true); });
        return () => { disposed = true; if (owned !== undefined)
            URL.revokeObjectURL(owned); };
    }, [sessionId, attachment.id, load]);
    if (error)
        return _jsxs("span", { role: "status", children: ["\u56FE\u7247\u6682\u4E0D\u53EF\u7528\uFF1A", attachment.name] });
    if (url === undefined)
        return _jsx("span", { children: "\u52A0\u8F7D\u56FE\u7247\u2026" });
    return _jsxs(_Fragment, { children: [_jsx("button", { type: "button", className: css.imageButton, "aria-label": `预览图片 ${attachment.name}`, "aria-haspopup": "dialog", onClick: () => setOpen(true), children: _jsx("img", { src: url, alt: attachment.name, onError: () => { setError(true); setOpen(false); } }) }), open && _jsx(HostImagePreview, { src: url, alt: attachment.name, onClose: close })] });
}

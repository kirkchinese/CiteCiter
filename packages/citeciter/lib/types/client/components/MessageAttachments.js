import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
function MessageImage({ sessionId, attachment, load }) {
    const [url, setUrl] = useState();
    const [error, setError] = useState(false);
    useEffect(() => {
        let disposed = false;
        let owned;
        setUrl(undefined);
        setError(false);
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
    return error ? _jsxs("span", { children: ["\u56FE\u7247\u6682\u4E0D\u53EF\u7528\uFF1A", attachment.name] }) : url === undefined ? _jsx("span", { children: "\u52A0\u8F7D\u56FE\u7247\u2026" }) : _jsx("a", { href: url, target: "_blank", rel: "noreferrer", title: "\u6253\u5F00\u56FE\u7247", children: _jsx("img", { src: url, alt: attachment.name, style: { display: 'block', maxWidth: '100%', maxHeight: 320, objectFit: 'contain', borderRadius: 12 } }) });
}
/** Render durable native attachments with a session-authorized loader and owned object URLs. */
export function MessageAttachments({ sessionId, attachments, load }) {
    return _jsx("div", { children: attachments.map(item => item.kind === 'image' ? _jsx(MessageImage, { sessionId: sessionId, attachment: item, load: load }, item.id) : _jsxs("span", { title: item.id, children: ["\uD83D\uDCCE ", item.name] }, item.id)) });
}

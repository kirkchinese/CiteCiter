import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import css from './ReferenceAttachments.module.css';
import { useState, useSyncExternalStore } from 'react';
/** Report a failed local preview without dropping the original file or changing its upload state. */
function DraftImagePreview({ url }) {
    const [failedUrl, setFailedUrl] = useState();
    return failedUrl === url
        ? _jsx("small", { className: css.unavailable, role: "alert", title: "\u56FE\u7247\u65E0\u6CD5\u9884\u89C8\uFF0C\u53EF\u79FB\u9664\u540E\u91CD\u65B0\u6DFB\u52A0\uFF1B\u539F\u6587\u4EF6\u4ECD\u4FDD\u7559\u3002", children: "\u65E0\u6CD5\u9884\u89C8" })
        : _jsx("img", { src: url, width: "28", height: "28", alt: "", onError: () => setFailedUrl(url), style: { objectFit: 'cover', borderRadius: 5 } }, url);
}
/** Native Conversation-owned file drafts. The owning controller handles upload and lifetime. */
export function FileAttachments({ files, remove, native, sessionId }) {
    const uploads = useSyncExternalStore(native.uploads.subscribe, native.uploads.getSnapshot);
    return _jsx("div", { className: css.rail, children: files.map(item => _jsxs("span", { className: css.chip, title: item.file.name, children: [item.kind === 'image' && _jsx(DraftImagePreview, { url: item.previewUrl }), _jsx("span", { children: item.file.name }), uploads[item.id]?.status === 'uploading' && _jsx("small", { role: "status", children: "\u4E0A\u4F20\u4E2D" }), uploads[item.id]?.status === 'error' && _jsx("button", { type: "button", title: "\u4E0A\u4F20\u5931\u8D25\uFF0C\u70B9\u51FB\u91CD\u8BD5", onClick: () => native.retry(sessionId, item.id), children: "\u91CD\u8BD5" }), _jsx("button", { type: "button", "aria-label": `移除附件 ${item.file.name}`, onClick: () => remove(item.id), children: "\u00D7" })] }, item.id)) });
}

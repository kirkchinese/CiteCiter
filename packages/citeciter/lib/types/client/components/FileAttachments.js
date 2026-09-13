import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import css from './ReferenceAttachments.module.css';
import { useSyncExternalStore } from 'react';
/** Native Conversation-owned file drafts. The owning controller handles upload and lifetime. */
export function FileAttachments({ files, remove, native, sessionId }) {
    const uploads = useSyncExternalStore(native.uploads.subscribe, native.uploads.getSnapshot);
    return _jsx("div", { className: css.rail, children: files.map(item => _jsxs("span", { className: css.chip, title: item.file.name, children: [item.kind === 'image' && _jsx("img", { src: item.previewUrl, width: "28", height: "28", alt: "", style: { objectFit: 'cover', borderRadius: 5 } }), _jsx("span", { children: item.file.name }), uploads[item.id]?.status === 'uploading' && _jsx("small", { role: "status", children: "\u4E0A\u4F20\u4E2D" }), uploads[item.id]?.status === 'error' && _jsx("button", { type: "button", title: "\u4E0A\u4F20\u5931\u8D25\uFF0C\u70B9\u51FB\u91CD\u8BD5", onClick: () => native.retry(sessionId, item.id), children: "\u91CD\u8BD5" }), _jsx("button", { type: "button", "aria-label": `移除附件 ${item.file.name}`, onClick: () => remove(item.id), children: "\u00D7" })] }, item.id)) });
}

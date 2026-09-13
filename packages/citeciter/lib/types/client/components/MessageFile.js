import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconDownloadOutline16 } from '@deepseek-ai/dsh-client-ui-primitives';
import { useFileDownload } from "../file-download.js";
import css from './MessageAttachments.module.css';
/** Accessible file chip. The download hook owns requests and object URLs. */
export function MessageFile({ sessionId, attachment, load }) {
    const { download, busy, error } = useFileDownload(sessionId, attachment.id, attachment.name, load);
    return _jsxs("div", { className: css.file, children: [_jsxs("button", { type: "button", className: css.download, onClick: () => { void download(); }, disabled: busy, "aria-busy": busy, "aria-label": `${busy ? '正在读取' : error === undefined ? '下载' : '重试下载'}附件 ${attachment.name}`, title: attachment.name, children: [_jsx(IconDownloadOutline16, { size: 16 }), _jsx("span", { children: attachment.name })] }), error !== undefined && _jsxs("span", { className: css.error, role: "alert", children: ["\u4E0B\u8F7D\u5931\u8D25\uFF0C\u70B9\u51FB\u91CD\u8BD5\uFF1A", error] })] });
}

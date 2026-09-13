import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconArchiveOutline20, Modal } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './TopicSettingsDialog.module.css';
/**
 * Render infrequent Topic management separately from the learning composer.
 * @param props - current identity, operation status and management callbacks.
 * @returns a controlled dialog; deletion is enabled only for legacy private logs or verified Citer-owned source storage.
 */
export function TopicSettingsDialog({ open, topic, archiving, deleting, error, onClose, onArchive, onDelete }) {
    return _jsx(Modal, { open: open && topic !== undefined, onClose: onClose, closeLabel: "\u5173\u95ED", title: "Topic \u8BBE\u7F6E", children: topic !== undefined && _jsxs("div", { className: css.settings, children: [_jsxs("div", { className: css.actions, children: [_jsxs("button", { type: "button", "aria-label": topic.archived ? '恢复当前 Topic' : '归档当前 Topic', disabled: archiving, onClick: () => { void onArchive(!topic.archived).then(saved => { if (saved)
                                onClose(); }); }, children: [_jsx(IconArchiveOutline20, { size: 16 }), archiving ? '处理中…' : topic.archived ? '恢复' : '归档'] }), _jsx("button", { type: "button", className: css.danger, disabled: deleting || topic.hosted === true && topic.storage !== 'source', onClick: onDelete, title: topic.hosted === true && topic.storage !== 'source' ? '重启 DSH 后迁移至 Citer 自有目录' : undefined, children: "\u6C38\u4E45\u5220\u9664" })] }), topic.hosted === true && topic.storage !== 'source' && _jsx("p", { className: css.hint, children: "\u6B64 Topic \u5C1A\u672A\u8FC1\u79FB\uFF0C\u76EE\u524D\u53EF\u5F52\u6863\u4E0E\u6062\u590D\u3002" }), error !== null && _jsx("p", { role: "alert", className: css.error, children: error })] }) });
}

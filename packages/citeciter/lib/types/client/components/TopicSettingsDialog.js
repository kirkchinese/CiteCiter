import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { IconArchiveOutline20, Modal } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './TopicSettingsDialog.module.css';
/**
 * Render infrequent Topic management separately from the learning composer.
 * @param props - current identity, operation status and management callbacks.
 * @returns a controlled dialog; renaming keeps its draft until this Topic changes.
 */
export function TopicSettingsDialog({ open, topic, renaming, archiving, deleting, error, onClose, onRename, onArchive, onDelete }) {
    const [title, setTitle] = useState(topic?.title ?? '');
    const [dirty, setDirty] = useState(false);
    useEffect(() => { setTitle(topic?.title ?? ''); setDirty(false); }, [topic?.sessionId]);
    useEffect(() => { if (!dirty)
        setTitle(topic?.title ?? ''); }, [topic?.title, dirty]);
    return _jsx(Modal, { open: open && topic !== undefined, onClose: onClose, closeLabel: "\u5173\u95ED", title: "Topic \u8BBE\u7F6E", children: topic !== undefined && _jsxs("div", { className: css.settings, children: [_jsxs("form", { onSubmit: event => {
                        event.preventDefault();
                        if (title.trim() !== '' && dirty && !renaming)
                            void onRename(title).then(saved => { if (saved)
                                setDirty(false); });
                    }, children: [_jsxs("label", { children: ["Topic \u6807\u9898", _jsx("input", { "aria-label": "Topic \u6807\u9898", value: title, onChange: event => { setTitle(event.currentTarget.value); setDirty(true); } })] }), _jsx("button", { type: "submit", disabled: title.trim() === '' || !dirty || renaming, children: renaming ? '保存中…' : dirty ? '保存' : '已保存' })] }), _jsxs("div", { className: css.actions, children: [_jsxs("button", { type: "button", "aria-label": topic.archived ? '恢复当前 Topic' : '归档当前 Topic', disabled: archiving, onClick: () => { void onArchive(!topic.archived).then(saved => { if (saved)
                                onClose(); }); }, children: [_jsx(IconArchiveOutline20, { size: 16 }), archiving ? '处理中…' : topic.archived ? '恢复' : '归档'] }), _jsx("button", { type: "button", className: css.danger, disabled: deleting, onClick: onDelete, children: "\u6C38\u4E45\u5220\u9664" })] }), error !== null && _jsx("p", { role: "alert", className: css.error, children: error })] }) });
}

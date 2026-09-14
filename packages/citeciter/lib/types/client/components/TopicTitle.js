import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import css from './TopicNavigation.module.css';
/** Inline rename committed by Enter or blur, cancelled by Escape. Double-click and F2 start editing. */
export function TopicTitle({ id, title, onRename }) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(title);
    const [error, setError] = useState(false);
    const saving = useRef(false);
    const cancelled = useRef(false);
    useEffect(() => { setEditing(false); setValue(title); setError(false); }, [id]);
    const start = () => { cancelled.current = false; setValue(title); setError(false); setEditing(true); };
    const save = async () => {
        if (saving.current || cancelled.current)
            return;
        if (!value.trim() || value.trim() === title) {
            setEditing(false);
            return;
        }
        saving.current = true;
        try {
            if (await onRename(value.trim()))
                setEditing(false);
            else
                setError(true);
        }
        finally {
            saving.current = false;
        }
    };
    return editing ? _jsx("input", { className: css.rename, "aria-label": "Topic \u540D\u79F0", "aria-invalid": error, title: error ? '保存失败，可重试或按 Escape 取消' : undefined, autoFocus: true, value: value, maxLength: 120, onFocus: event => event.currentTarget.select(), onChange: event => setValue(event.currentTarget.value), onBlur: () => { void save(); }, onKeyDown: event => {
            if (event.key === 'Escape') {
                cancelled.current = true;
                setEditing(false);
                event.stopPropagation();
            }
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                event.preventDefault();
                void save();
            }
        } }) : _jsx("strong", { "data-topic-title": true, className: css.title, tabIndex: 0, title: "\u53CC\u51FB\u91CD\u547D\u540D \u00B7 F2", onDoubleClick: start, onKeyDown: event => { if (event.key === 'F2') {
            event.preventDefault();
            start();
        } }, children: title });
}

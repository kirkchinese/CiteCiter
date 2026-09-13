import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { IconStopFill16 } from '@deepseek-ai/dsh-client-ui-primitives';
import { TopicModelControls } from "./TopicModelControls.js";
import { PermissionControl } from "./PermissionControl.js";
import css from './TopicComposer.module.css';
import { ChoicePopover } from "./ChoicePopover.js";
/**
 * Render the Topic draft and its submission controls without accessing services.
 * @param props - controlled draft, model route, request state and user-action callbacks.
 * @returns one form; model changes and sending remain owned by the Topic controller.
 */
export function TopicComposer({ question, placeholder, route, providers, phase, canSend, routeSaving, folded, inputRef, onExpand, onQuestion, onSubmit, onStop, onModel, onReasoning, attachments, permission, onPermission, onFiles, delivery, onDelivery, sources, onReference }) {
    const fileInput = useRef(null);
    const attachButton = useRef(null);
    const [attachOpen, setAttachOpen] = useState(false);
    const running = phase === 'running';
    const stopping = phase === 'stopping';
    return _jsxs("form", { className: css.composer, "data-folded": folded || undefined, onSubmit: onSubmit, onDragOver: event => { if (event.dataTransfer.types.includes('Files'))
            event.preventDefault(); }, onDrop: event => { if (event.dataTransfer.files.length > 0) {
            event.preventDefault();
            onFiles([...event.dataTransfer.files]);
        } }, children: [_jsx("input", { hidden: true, ref: fileInput, type: "file", multiple: true, onChange: event => { onFiles([...(event.currentTarget.files ?? [])]); event.currentTarget.value = ''; } }), attachments, folded && _jsx("button", { type: "button", className: css.expandButton, onClick: onExpand, children: question.trim() === '' ? '补充问题' : '编辑草稿' }), _jsx("textarea", { hidden: folded, ref: inputRef, rows: 2, maxLength: 11_000, "aria-label": "\u7EE7\u7EED\u5411 CiteCiter \u63D0\u95EE", value: question, disabled: route === undefined, onChange: event => onQuestion(event.currentTarget.value), placeholder: placeholder, onPaste: event => { if (event.clipboardData.files.length > 0) {
                    event.preventDefault();
                    onFiles([...event.clipboardData.files]);
                } }, onKeyDown: event => {
                    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
                        event.preventDefault();
                        if (running && (event.ctrlKey || event.metaKey))
                            onSubmit(event, delivery === 'queue' ? 'steer' : 'queue');
                        else
                            event.currentTarget.form?.requestSubmit();
                    }
                } }), _jsxs("div", { className: css.composerActions, children: [_jsx("button", { ref: attachButton, type: "button", className: css.attachButton, "aria-label": "\u6DFB\u52A0\u9644\u4EF6", title: "\u6DFB\u52A0\u6587\u4EF6\u6216\u6765\u6E90\u5F15\u7528", disabled: route === undefined, "aria-expanded": attachOpen, onClick: () => setAttachOpen(!attachOpen), children: "+" }), attachOpen && _jsxs(ChoicePopover, { anchor: attachButton, label: "\u6DFB\u52A0\u5F15\u7528\u6216\u6587\u4EF6", onClose: () => setAttachOpen(false), children: [_jsxs("button", { type: "button", role: "menuitem", onClick: () => { setAttachOpen(false); fileInput.current?.click(); }, children: ["\u56FE\u7247\u6216\u6587\u4EF6 ", _jsx("span", { children: "\u2197" })] }), sources.map(reference => _jsxs("button", { type: "button", role: "menuitem", onClick: () => { setAttachOpen(false); onReference(reference); }, children: [reference.label, _jsx("span", { children: "\uFF0B" })] }, reference.id))] }), _jsx(PermissionControl, { value: permission, onChange: onPermission }), route !== undefined && _jsx(TopicModelControls, { providers: providers, route: route, saving: routeSaving, onModel: onModel, onReasoning: onReasoning }), (running || stopping) && _jsx("button", { type: "button", className: css.attachButton, "aria-label": "\u505C\u6B62\u56DE\u7B54", title: "\u505C\u6B62\u56DE\u7B54", disabled: stopping, onClick: onStop, children: _jsx(IconStopFill16, { size: 16 }) }), running && _jsx("button", { className: css.attachButton, type: "button", title: delivery === 'queue' ? '当前：排队发送；点击切换为插话' : '当前：插话；点击切换为排队', "aria-label": delivery === 'queue' ? '排队发送' : '插话发送', onClick: () => onDelivery(delivery === 'queue' ? 'steer' : 'queue'), children: delivery === 'queue' ? '☷' : '↗' }), _jsx("button", { className: css.sendButton, type: "submit", disabled: stopping || !canSend || routeSaving, title: running ? `Enter：${delivery === 'queue' ? '排队' : '插话'}；Ctrl + Enter：${delivery === 'queue' ? '插话' : '排队'}；Shift + Enter：换行` : '发送 · Enter（Shift + Enter 换行）', "aria-label": "\u53D1\u9001", children: _jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: _jsx("path", { d: "M12 20V4m-7 7 7-7 7 7", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }) })] })] });
}

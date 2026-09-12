import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconStopFill16 } from '@deepseek-ai/dsh-client-ui-primitives';
import { TopicModelControls } from "./TopicModelControls.js";
import css from './TopicComposer.module.css';
/**
 * Render the Topic draft and its submission controls without accessing services.
 * @param props - controlled draft, model route, request state and user-action callbacks.
 * @returns one form; model changes and sending remain owned by the Topic controller.
 */
export function TopicComposer({ question, placeholder, route, providers, phase, canSend, routeSaving, folded, inputRef, onExpand, onQuestion, onSubmit, onStop, onModel, onReasoning }) {
    const running = phase === 'running';
    const stopping = phase === 'stopping';
    return _jsxs("form", { className: css.composer, "data-folded": folded || undefined, onSubmit: onSubmit, children: [folded && _jsx("button", { type: "button", className: css.expandButton, onClick: onExpand, children: question.trim() === '' ? '补充问题' : '编辑草稿' }), _jsx("textarea", { hidden: folded, ref: inputRef, rows: 2, maxLength: 11_000, "aria-label": "\u7EE7\u7EED\u5411 CiteCiter \u63D0\u95EE", value: question, disabled: route === undefined, onChange: event => onQuestion(event.currentTarget.value), placeholder: placeholder, onKeyDown: event => {
                    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.nativeEvent.isComposing) {
                        event.preventDefault();
                        event.currentTarget.form?.requestSubmit();
                    }
                } }), _jsxs("div", { className: css.composerActions, children: [route !== undefined && _jsx(TopicModelControls, { providers: providers, route: route, saving: routeSaving, onModel: onModel, onReasoning: onReasoning }), _jsx("button", { className: css.sendButton, type: running ? 'button' : 'submit', disabled: stopping || !running && (!canSend || routeSaving), title: running ? '停止回答' : '发送 · Ctrl / ⌘ + Enter', "aria-label": running ? '停止回答' : stopping ? '正在停止' : '发送', onClick: running ? onStop : undefined, children: running || stopping ? _jsx(IconStopFill16, { size: 16 }) : _jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: _jsx("path", { d: "M12 20V4m-7 7 7-7 7 7", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }) })] })] });
}

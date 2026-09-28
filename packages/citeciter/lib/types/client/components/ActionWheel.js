import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { OverlayPortal } from "./OverlayPortal.js";
import { actionSourceQuote } from "../action-controller.js";
import css from './ActionWheel.module.css';
import { actionTarget } from "../../actions.js";
/** Public wheel and creation-error retry. Questions and models are edited only in the Topic composer. */
export function ActionWheel({ useActions, actions, companion }) {
    const state = useActions(value => value);
    const menu = useRef(null);
    const wheel = state.wheel;
    const active = wheel?.active == null ? null : wheel.slots[wheel.active];
    const pending = state.pending;
    const visible = wheel !== null || pending !== null;
    useEffect(() => visible ? companion.retainVisible() : undefined, [companion, visible]);
    useEffect(() => { if (wheel !== null && !wheel.held)
        menu.current?.focus(); }, [wheel?.held]);
    return _jsxs(OverlayPortal, { children: [wheel !== null && _jsxs("div", { className: css.wheel, style: { left: wheel.x, top: wheel.y, '--wheel-scale': wheel.scale }, "data-citeciter-menu": true, "data-citeciter-wheel": true, ref: menu, tabIndex: -1, role: "menu", "aria-label": "CiteCiter \u9009\u6587\u52A8\u4F5C", onKeyDown: event => {
                    if (event.key === 'Escape')
                        actions.cancel();
                    else if (/^[1-8]$/u.test(event.key)) {
                        event.preventDefault();
                        actions.choose(Number(event.key) - 1);
                    }
                    else if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        actions.choose(wheel.active);
                    }
                    else if (event.key.startsWith('Arrow')) {
                        event.preventDefault();
                        actions.focus(((wheel.active ?? 0) + (['ArrowLeft', 'ArrowUp'].includes(event.key) ? 7 : 1)) % 8);
                    }
                }, children: [_jsx("svg", { viewBox: "-180 -180 360 360", "aria-hidden": "true", className: css.ring, children: wheel.slots.map((slot, index) => {
                            const a = (index * 45 - 112.5) * Math.PI / 180, b = a + Math.PI / 4;
                            const p = (r, angle) => `${r * Math.cos(angle)} ${r * Math.sin(angle)}`;
                            return _jsx("path", { "data-active": wheel.active === index && slot !== null || undefined, "data-empty": slot === null || undefined, d: `M ${p(43, a)} L ${p(178, a)} A 178 178 0 0 1 ${p(178, b)} L ${p(43, b)} A 43 43 0 0 0 ${p(43, a)}` }, index);
                        }) }), wheel.slots.map((slot, index) => {
                        const angle = (index * 45 - 90) * Math.PI / 180;
                        return _jsxs("button", { className: css.slot, type: "button", role: "menuitem", "aria-disabled": slot === null, "data-active": wheel.active === index || undefined, style: { left: 180 + Math.cos(angle) * 114, top: 180 + Math.sin(angle) * 114 }, onMouseEnter: () => { if (!wheel.held)
                                actions.focus(index); }, onFocus: () => actions.focus(index), onClick: () => actions.choose(index), title: slot?.prompt, children: [_jsx("span", { className: css.slotNumber, children: index + 1 }), _jsx("strong", { children: slot?.label ?? '空槽' }), _jsx("small", { children: slot === null ? '在设置中添加' : `${actionTarget(slot) === 'current' ? '加入 Topic' : '新建 Topic'}${slot.ask ? ' · 输入问题' : ''}` })] }, index);
                    }), _jsxs("button", { type: "button", className: css.center, onClick: actions.cancel, "aria-label": "\u53D6\u6D88\u8F6E\u76D8", children: ["\u53D6\u6D88", _jsx("small", { children: "Esc" })] }), _jsx("div", { className: css.caption, role: "status", children: active == null ? '移向动作 · 回到中心取消' : `${active.label} · ${active.ask ? '在 Citer 中输入并发送' : '松开后准备草稿'}` })] }), pending !== null && state.error !== null && _jsxs("form", { className: css.prompt, "data-citeciter-menu": true, role: "dialog", "aria-label": `${pending.action.label}：创建失败`, style: { '--prompt-x': `${pending.x - 210}px`, '--prompt-y': `${pending.y - 100}px` }, onSubmit: event => { event.preventDefault(); void actions.submit(); }, children: [_jsxs("header", { children: [_jsx("strong", { children: pending.action.label }), _jsx("button", { type: "button", onClick: actions.cancel, "aria-label": "\u5173\u95ED\u63D0\u95EE", children: "\u00D7" })] }), _jsx("blockquote", { children: actionSourceQuote(pending.source).slice(0, 180) }), state.error !== null && _jsx("p", { role: "alert", className: css.error, children: state.error }), _jsxs("footer", { children: [_jsx("span", { children: "\u5F15\u7528\u5DF2\u4FDD\u7559" }), _jsx("button", { type: "submit", disabled: state.submitting, children: "\u91CD\u8BD5" })] })] })] });
}

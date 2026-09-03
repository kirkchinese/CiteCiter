import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useId, useRef, useSyncExternalStore } from 'react';
import { Button } from '@deepseek-ai/dsh-client-ui-primitives';
import { citeCiterUpdateCommand } from "../update-controller.js";
import css from './UpdateNotice.module.css';
/**
 * Render the non-modal Web update notice in the frame-wide overlay.
 * @param props - root-scoped update actions and observable state.
 * @returns the available-version card, or no surface while current or suppressed.
 */
export function UpdateNotice({ updateController }) {
    const snapshot = useSyncExternalStore(updateController.subscribe, updateController.getSnapshot);
    const titleId = useId();
    const descriptionId = useId();
    const previousFocus = useRef(null);
    const available = snapshot.available;
    useEffect(() => {
        if (available === null)
            return;
        const active = document.activeElement;
        if (active instanceof HTMLElement && active.closest('[data-citeciter-update-notice]') === null) {
            previousFocus.current = active;
        }
    }, [available]);
    if (available === null)
        return null;
    const busy = snapshot.copyStatus === 'copying' || snapshot.preferenceStatus === 'saving';
    const restoreFocus = () => {
        const target = previousFocus.current;
        requestAnimationFrame(() => {
            if (target?.isConnected === true)
                target.focus();
        });
    };
    const rememberFocus = () => {
        const active = document.activeElement;
        if (active instanceof HTMLElement && active.closest('[data-citeciter-update-notice]') === null) {
            previousFocus.current = active;
        }
    };
    const disableNotifications = async () => {
        const hidden = await updateController.setNotificationsEnabled(false);
        if (hidden)
            restoreFocus();
    };
    return (_jsxs("section", { className: css.notice, "data-citeciter-update-notice": true, role: "region", "aria-labelledby": titleId, "aria-describedby": descriptionId, "aria-busy": busy, onPointerDownCapture: rememberFocus, onFocusCapture: rememberFocus, children: [_jsxs("p", { className: css.announcement, role: "status", "aria-live": "polite", children: ["CiteCiter \u6709\u65B0\u7248\u672C ", available.latestVersion] }), _jsxs("div", { className: css.heading, children: [_jsx("span", { className: css.badge, "aria-hidden": "true", children: "\u2191" }), _jsxs("div", { children: [_jsx("h2", { id: titleId, children: "CiteCiter \u6709\u65B0\u7248\u672C" }), _jsxs("p", { className: css.version, children: [_jsxs("span", { children: ["v", available.currentVersion] }), _jsx("span", { "aria-hidden": "true", children: "\u2192" }), _jsxs("strong", { children: ["v", available.latestVersion] })] })] })] }), _jsx("p", { id: descriptionId, className: css.description, children: "\u201C\u66F4\u65B0\u201D\u53EA\u4F1A\u590D\u5236\u5B98\u65B9\u5B89\u88C5\u547D\u4EE4\uFF0C\u4E0D\u4F1A\u81EA\u52A8\u6267\u884C\u3002\u81EA\u5B9A\u4E49 Web Profile \u8BF7\u66FF\u6362\u547D\u4EE4\u4E2D\u7684 web\uFF1B\u6267\u884C\u524D\u8BF7\u6838\u5BF9\u65B0\u7248 DSH \u8981\u6C42\uFF0C\u8FD0\u884C\u540E\u8BF7\u91CD\u542F DSH Web\u3002" }), _jsx("code", { className: css.command, children: citeCiterUpdateCommand(available.latestVersion) }), snapshot.copyMessage !== null && (_jsx("p", { className: css.feedback, "data-status": snapshot.copyStatus, role: snapshot.copyStatus === 'error' ? 'alert' : 'status', children: snapshot.copyMessage })), snapshot.preferenceStatus === 'error' && snapshot.preferenceMessage !== null && (_jsx("p", { className: css.feedback, "data-status": "error", role: "alert", children: snapshot.preferenceMessage })), _jsxs("div", { className: css.actions, children: [_jsx(Button, { variant: "primary", className: `${css.action} ${css.updateAction}`, "aria-label": "\u66F4\u65B0", disabled: busy, onClick: () => { void updateController.copyUpdateCommand(); }, children: "\u66F4\u65B0" }), _jsx(Button, { variant: "outline", className: css.action, "aria-label": "\u4E0B\u6B21\u4E00\u5B9A", disabled: busy, onClick: () => {
                            updateController.defer();
                            restoreFocus();
                        }, children: "\u4E0B\u6B21\u4E00\u5B9A" }), _jsx(Button, { variant: "ghost", className: css.action, "aria-label": "\u4E0D\u518D\u63D0\u793A", disabled: busy, onClick: () => { void disableNotifications(); }, children: "\u4E0D\u518D\u63D0\u793A" })] })] }));
}

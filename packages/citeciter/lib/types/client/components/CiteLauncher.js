import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import mascotUrl from '../assets/citeciter-mascot.png';
import css from './CiteCiter.module.css';
/** Independent entry back to the current learning workspace; owns no selection state. */
export function CiteLauncher({ useCompanion, useOverlay, openPanel }) {
    const snapshot = useCompanion(value => value);
    const open = useOverlay(value => value.panelOpen);
    if (snapshot.sourceSessionId === null || open)
        return null;
    return _jsxs("button", { className: css.topicLauncher, type: "button", onClick: openPanel, "aria-label": snapshot.topics.length === 0 ? '打开 CiteCiter' : `打开 CiteCiter，共 ${snapshot.topics.length} 个讨论`, title: "\u6253\u5F00 CiteCiter", children: [_jsx("img", { src: mascotUrl, alt: "", "aria-hidden": "true" }), snapshot.topics.length > 0 && _jsx("span", { className: css.launcherCount, children: snapshot.topics.length })] });
}

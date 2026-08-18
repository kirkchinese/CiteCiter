import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import css from './CiteCiter.module.css';
const PREVIEW_LIMIT = 64;
/**
 * Render the contextual `Citer!` action and a persistent Thread launcher.
 * @param props - shared selection bus, explainer state, and panel opener.
 * @returns shell-overlay controls.
 */
export function SelectionMenu({ bus, explainer, openPanel }) {
    const [selection, setSelection] = useState(() => bus.getMenuSelection());
    const subscribeExplainer = useCallback((listener) => explainer.subscribe(listener), [explainer]);
    const snapshot = useSyncExternalStore(subscribeExplainer, explainer.getSnapshot);
    useEffect(() => bus.subscribe(() => {
        setSelection(bus.getMenuSelection());
    }), [bus]);
    const preview = selection === null
        ? ''
        : selection.text.length > PREVIEW_LIMIT
            ? `${selection.text.slice(0, PREVIEW_LIMIT)}…`
            : selection.text;
    return (_jsxs(_Fragment, { children: [selection !== null && (_jsxs("div", { className: css.menu, "data-citeciter-menu": true, style: { left: selection.x, top: selection.y }, role: "menu", children: [_jsx("span", { className: css.menuPreview, title: selection.text, children: preview }), _jsx("button", { className: css.menuButton, type: "button", role: "menuitem", onClick: () => {
                            openPanel(selection);
                            bus.setMenuSelection(null);
                        }, children: "Citer!" })] })), snapshot.threads.length > 0 && (_jsxs("button", { className: css.threadLauncher, type: "button", onClick: () => openPanel(), "aria-label": `打开 ${snapshot.threads.length} 个 Citation Threads`, title: "Citation Threads", children: [_jsx("span", { "aria-hidden": "true", children: "\u2726" }), _jsx("span", { children: snapshot.threads.length })] }))] }));
}

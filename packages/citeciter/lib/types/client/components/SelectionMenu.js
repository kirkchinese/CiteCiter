import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import css from './CiteCiter.module.css';
const PREVIEW_LIMIT = 64;
/**
 * Render the floating `Citer!` menu in the shell overlay.
 * @param props - shared selection bus and panel opener.
 * @returns menu element while a valid selection exists, otherwise null.
 */
export function SelectionMenu({ bus, openPanel }) {
    const [selection, setSelection] = useState(() => bus.getMenuSelection());
    useEffect(() => bus.subscribe(() => {
        setSelection(bus.getMenuSelection());
    }), [bus]);
    if (selection === null)
        return null;
    const preview = selection.text.length > PREVIEW_LIMIT
        ? `${selection.text.slice(0, PREVIEW_LIMIT)}…`
        : selection.text;
    return (_jsxs("div", { className: css.menu, "data-citeciter-menu": true, style: { left: selection.x, top: selection.y }, role: "menu", children: [_jsx("span", { className: css.menuPreview, title: selection.text, children: preview }), _jsx("button", { className: css.menuButton, type: "button", role: "menuitem", onClick: () => {
                    openPanel(selection);
                    bus.setMenuSelection(null);
                }, children: "Citer!" })] }));
}

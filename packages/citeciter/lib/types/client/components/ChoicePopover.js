import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { OverlayPortal } from "./OverlayPortal.js";
import css from './ChoicePopover.module.css';
/** Anchored menu surface. Owns positioning, focus and dismissal, not selection state. */
export function ChoicePopover({ anchor, label, onClose, children }) {
    const surface = useRef(null);
    const close = useRef(onClose);
    close.current = onClose;
    const [position, setPosition] = useState({ left: 8, top: 8, maxHeight: 400 });
    useLayoutEffect(() => {
        const place = () => {
            const button = anchor.current?.getBoundingClientRect();
            const menu = surface.current;
            if (button === undefined || menu === null)
                return;
            const available = Math.max(100, window.innerHeight - 16);
            const height = Math.min(menu.scrollHeight, available, 420);
            const top = button.top >= height + 16 ? button.top - height - 8 : Math.min(button.bottom + 8, window.innerHeight - height - 8);
            setPosition({ left: Math.max(8, Math.min(button.right - menu.offsetWidth, window.innerWidth - menu.offsetWidth - 8)), top: Math.max(8, top), maxHeight: available });
        };
        place();
        const observer = new ResizeObserver(place);
        if (surface.current !== null)
            observer.observe(surface.current);
        window.addEventListener('resize', place);
        return () => { observer.disconnect(); window.removeEventListener('resize', place); };
    }, [anchor]);
    useEffect(() => {
        const dismiss = (event) => {
            if (event.target instanceof Node && !surface.current?.contains(event.target) && !anchor.current?.contains(event.target))
                close.current();
        };
        document.addEventListener('pointerdown', dismiss, true);
        surface.current?.querySelector('[role^="menuitem"]')?.focus();
        return () => document.removeEventListener('pointerdown', dismiss, true);
    }, [anchor]);
    return _jsx(OverlayPortal, { children: _jsx("div", { ref: surface, className: css.menu, role: "menu", "aria-label": label, style: position, onKeyDown: event => {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    event.stopPropagation();
                    onClose();
                    anchor.current?.focus();
                    return;
                }
                if (event.key === 'Tab') {
                    onClose();
                    return;
                }
                if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key))
                    return;
                event.preventDefault();
                const items = [...event.currentTarget.querySelectorAll('[role^="menuitem"]:not([disabled])')];
                const index = items.indexOf(document.activeElement);
                const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
                items[next]?.focus();
            }, children: children }) });
}

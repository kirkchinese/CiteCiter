import { useEffect, useRef, useState } from 'react';
/** Pointer lifecycle survives reparenting between the host slot and the floating portal. */
export function usePanelDrag(panel, floating, setPresentation) {
    const [position, setPosition] = useState(null);
    const [dockTarget, setDockTarget] = useState(false);
    const cleanup = useRef(null);
    useEffect(() => () => cleanup.current?.(), []);
    useEffect(() => {
        const fit = () => {
            const box = panel.current?.getBoundingClientRect();
            if (box === undefined)
                return;
            setPosition(current => current === null ? null : { left: Math.max(8, Math.min(current.left, window.innerWidth - box.width - 8)), top: Math.max(40, Math.min(current.top, window.innerHeight - box.height - 8)) });
        };
        window.addEventListener('resize', fit);
        return () => window.removeEventListener('resize', fit);
    }, [panel]);
    const start = (event) => {
        if (event.button !== 0 || event.target.closest('button,input,textarea,select,[data-topic-title]'))
            return;
        const rect = panel.current?.getBoundingClientRect();
        if (rect === undefined)
            return;
        const origin = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
        let moved = false;
        const move = (next) => {
            if (next.pointerId !== event.pointerId)
                return;
            if (!moved && Math.hypot(next.clientX - origin.x, next.clientY - origin.y) < 8)
                return;
            if (!moved) {
                moved = true;
                if (!floating)
                    setPresentation('floating');
            }
            const box = panel.current?.getBoundingClientRect() ?? rect;
            setPosition({ left: Math.max(8, Math.min(origin.left + next.clientX - origin.x, window.innerWidth - box.width - 8)), top: Math.max(40, Math.min(origin.top + next.clientY - origin.y, window.innerHeight - box.height - 8)) });
            setDockTarget(next.clientX > window.innerWidth - 80);
            next.preventDefault();
        };
        const release = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', end); document.removeEventListener('pointercancel', cancel); window.removeEventListener('blur', cancel); setDockTarget(false); cleanup.current = null; };
        const end = (next) => { if (next.pointerId !== event.pointerId)
            return; if (moved && next.clientX > window.innerWidth - 80) {
            setPresentation('side');
            setPosition(null);
        } ; release(); };
        const cancel = () => release();
        cleanup.current?.();
        cleanup.current = release;
        document.addEventListener('pointermove', move, { passive: false });
        document.addEventListener('pointerup', end);
        document.addEventListener('pointercancel', cancel);
        window.addEventListener('blur', cancel);
    };
    return { position, dockTarget, start };
}

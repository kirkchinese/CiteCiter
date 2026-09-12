import { DEFAULT_WHEEL_SLOTS } from "../actions.js";
/** Owned reading surfaces provide captures without probing other plugins' private DOM. */
export function createSelectionSurfaces() {
    const readers = new Map();
    return {
        register(element, read) { readers.set(element, read); return () => { readers.delete(element); }; },
        read(target) { for (const [element, read] of readers)
            if (target instanceof Node && element.contains(target))
                return read(); return null; },
    };
}
/** Install hold/move/release gestures; returns a disposer removing every global listener. */
export function installWheelGesture(controller, read, preferences) {
    let held = null;
    let suppressContextUntil = 0;
    let pointer = { x: 0, y: 0, target: null };
    const blocked = (target) => target instanceof Element && target.closest('[data-citeciter-menu], [role="dialog"][aria-modal="true"]') !== null;
    const capture = (event, key) => {
        if (blocked(event.target) || controller.getSnapshot().pending !== null)
            return;
        const source = read(event);
        if (source === null)
            return;
        event.preventDefault();
        held = { key, time: Date.now() };
        controller.open(source, event.clientX, event.clientY, preferences().wheelSlots ?? DEFAULT_WHEEL_SLOTS, true);
    };
    const down = (event) => {
        if (event.button === 2 && (preferences().wheelTrigger ?? 'right-button') === 'right-button' && !event.shiftKey)
            capture(event, 'right-button');
        else if (!blocked(event.target) && event.button === 0)
            controller.dismissWheel();
    };
    const move = (event) => {
        pointer = { x: event.clientX, y: event.clientY, target: event.target };
        if (held !== null)
            controller.move(event.clientX, event.clientY);
    };
    const release = (key) => {
        if (held?.key !== key)
            return;
        const quick = Date.now() - held.time < 220;
        held = null;
        suppressContextUntil = Date.now() + 800;
        controller.release(quick);
    };
    const up = (event) => { if (event.button === 2)
        release('right-button'); };
    const menu = (event) => {
        if (held !== null || Date.now() < suppressContextUntil) {
            event.preventDefault();
            return;
        }
        if ((preferences().wheelTrigger ?? 'right-button') !== 'right-button' || event.shiftKey || blocked(event.target))
            return;
        const source = read(event);
        if (source === null)
            return;
        event.preventDefault();
        controller.open(source, event.clientX, event.clientY, preferences().wheelSlots ?? DEFAULT_WHEEL_SLOTS, false);
    };
    const keydown = (event) => {
        if (event.key === 'Escape') {
            held = null;
            controller.cancel();
            return;
        }
        if (held !== null && held.key !== 'right-button' && event.key !== held.key) {
            held = null;
            controller.cancel();
            return;
        }
        if (event.repeat || event.isComposing || held !== null)
            return;
        if (event.key !== preferences().wheelTrigger)
            return;
        // Preserve typing, composition and editor shortcuts. Read-only registered viewers are allowed.
        if (event.target instanceof Element && event.target.closest('input, textarea:not([readonly]), [contenteditable="true"]'))
            return;
        const target = document.elementFromPoint(pointer.x, pointer.y) ?? pointer.target;
        const synthetic = { target, clientX: pointer.x, clientY: pointer.y, preventDefault: () => event.preventDefault() };
        capture(synthetic, event.key);
    };
    const keyup = (event) => release(event.key);
    const cancelGesture = () => { held = null; controller.dismissWheel(); };
    document.addEventListener('pointerdown', down);
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    document.addEventListener('contextmenu', menu);
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
    document.addEventListener('pointercancel', cancelGesture);
    window.addEventListener('blur', cancelGesture);
    window.addEventListener('resize', cancelGesture);
    return () => {
        held = null;
        controller.cancel();
        document.removeEventListener('pointerdown', down);
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        document.removeEventListener('contextmenu', menu);
        document.removeEventListener('keydown', keydown);
        document.removeEventListener('keyup', keyup);
        document.removeEventListener('pointercancel', cancelGesture);
        window.removeEventListener('blur', cancelGesture);
        window.removeEventListener('resize', cancelGesture);
    };
}

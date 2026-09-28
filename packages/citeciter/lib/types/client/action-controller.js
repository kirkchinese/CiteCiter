import { createSnapshotStore } from '@deepseek-ai/dsh-client-store';
import { actionQuestion } from "../actions.js";
export const actionSourceSession = (source) => source.kind === 'conversation' ? source.selection.sourceSessionId : source.sourceSessionId;
export const actionSourceQuote = (source) => source.kind === 'conversation' ? source.selection.displayText : source.displayText;
/** Direction around the actual displayed centre; no action inside the dead zone or outside the wheel. */
export function wheelSector(dx, dy) {
    const radius = Math.hypot(dx, dy);
    if (radius < 42 || radius > 180)
        return null;
    return Math.floor(((Math.atan2(dy, dx) + Math.PI / 2 + Math.PI * 2 + Math.PI / 8) % (Math.PI * 2)) / (Math.PI / 4));
}
/** Prepare a draft through the action's destination policy; the Topic composer owns input and submission. */
export function createActionController(execute, defaultModel = () => undefined) {
    const store = createSnapshotStore({ wheel: null, pending: null, submitting: false, error: null, model: undefined });
    let disposed = false;
    let generation = 0;
    const update = (fn) => { if (!disposed)
        store.update(fn); };
    const cancel = () => { generation++; update(d => { d.wheel = null; d.pending = null; d.error = null; }); };
    const submit = async () => {
        const snapshot = store.getSnapshot();
        if (disposed || snapshot.submitting || snapshot.pending === null)
            return;
        const { source, action } = snapshot.pending;
        const question = actionQuestion(action, '');
        const ticket = generation;
        update(d => { d.submitting = true; d.error = null; });
        try {
            await execute(source, action, question, snapshot.model);
            if (ticket === generation)
                update(d => { d.pending = null; });
        }
        catch (error) {
            if (ticket === generation)
                update(d => { d.error = error instanceof Error ? error.message : String(error); });
        }
        finally {
            update(d => { d.submitting = false; });
        }
    };
    const choose = (index) => {
        const { wheel, submitting } = store.getSnapshot();
        if (disposed || submitting || wheel === null)
            return;
        const action = index === null ? null : wheel.slots[index];
        if (action == null) {
            cancel();
            return;
        }
        update(d => { d.wheel = null; d.pending = { source: wheel.source, action, x: wheel.x, y: wheel.y }; d.error = null; });
        void submit();
    };
    return {
        getSnapshot: store.getSnapshot,
        subscribe: store.subscribe,
        open(source, x, y, slots, held) {
            if (disposed || store.getSnapshot().submitting || store.getSnapshot().pending !== null)
                return;
            generation++;
            const scale = Math.min(1, (window.innerWidth - 16) / 360, (window.innerHeight - 16) / 400);
            const horizontal = 180 * scale + 8, above = 180 * scale + 8, below = 220 * scale + 8;
            update(d => { d.pending = null; d.error = null; d.model = defaultModel(); d.wheel = { source, x: Math.max(horizontal, Math.min(x, window.innerWidth - horizontal)), y: Math.max(above, Math.min(y, window.innerHeight - below)), slots, active: null, held, scale }; });
        },
        move(x, y) {
            const wheel = store.getSnapshot().wheel;
            if (wheel === null)
                return;
            const active = wheelSector((x - wheel.x) / wheel.scale, (y - wheel.y) / wheel.scale);
            if (active !== wheel.active)
                update(d => { d.wheel = { ...wheel, active }; });
        },
        focus(index) { const wheel = store.getSnapshot().wheel; if (wheel !== null)
            update(d => { d.wheel = { ...wheel, active: index }; }); },
        release(quick) {
            const wheel = store.getSnapshot().wheel;
            if (wheel === null)
                return;
            if (quick && wheel.active === null)
                update(d => { d.wheel = { ...wheel, held: false }; });
            else
                choose(wheel.active);
        },
        /** Focus loss cancels only the transient gesture; the Topic composer retains its draft. */
        dismissWheel() { update(d => { d.wheel = null; }); },
        choose, cancel, submit,
        async dispose() { cancel(); disposed = true; },
    };
}

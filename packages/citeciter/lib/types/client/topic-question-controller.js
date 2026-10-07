/**
 * Private Topic presentation of the Host's foreground question protocol.
 * This controller outlives its React card: hidden cards keep counting, and a
 * disconnected Client releases its public Host claim instead of pinning a run.
 */
export class TopicQuestionController {
    channel;
    review = undefined;
    dismissal;
    pending;
    lifetime = new AbortController();
    listeners = new Set();
    timer;
    claim;
    started = false;
    ended = false;
    deadline;
    remaining;
    focused = false;
    edited = false;
    held = false;
    closed = false;
    hidden = false;
    failure;
    draft = {};
    snapshot;
    constructor(pending, channel) {
        this.channel = channel;
        this.pending = pending;
        this.dismissal = pending.callId === undefined ? 'cancel' : 'hide';
        this.snapshot = this.read();
    }
    subscribe = (listener) => {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    };
    getSnapshot = () => this.snapshot;
    get callId() { return this.pending.callId; }
    getDraft() { return this.draft; }
    setDraft(draft) { this.draft = draft; }
    /** Reconcile the private Host snapshot; an older open frame cannot undo continuation. */
    sync(pending) {
        if (this.closed || this.lifetime.signal.aborted)
            return;
        this.pending = this.pending.state === 'continued' ? { ...pending, state: 'continued' } : pending;
        if (this.pending.state === 'continued') {
            this.deadline = undefined;
            this.ended = true;
        }
        else if (!this.started && pending.timed === true && pending.callId !== undefined) {
            this.started = true;
            void this.attach(pending.callId);
        }
        this.publish();
    }
    async attach(callId) {
        try {
            const claim = this.channel.claim(callId, this.lifetime.signal);
            this.claim = claim;
            for await (const frame of claim) {
                if (this.closed || this.lifetime.signal.aborted)
                    break;
                this.remaining = Math.max(0, frame.remainingMs);
                if (!this.focused && !this.edited && !this.held)
                    this.deadline = Date.now() + this.remaining;
                this.publish();
            }
        }
        catch (error) {
            if (!this.closed && !this.lifetime.signal.aborted) {
                this.failure = `无法接管等待：${String(error)}。宿主将按原定时限继续。`;
            }
        }
        finally {
            this.ended = true;
            this.deadline = undefined;
            this.claim = undefined;
            this.publish();
        }
    }
    read() {
        const continued = this.pending.state === 'continued';
        const waiting = this.pending.timed === true && !continued && !this.ended;
        return {
            state: continued ? 'continued' : 'open',
            channel: this.closed ? 'none' : continued ? 'rpc' : this.ended ? 'none' : 'waterfall',
            closed: this.closed, hidden: this.hidden, error: this.failure,
            waitState: continued ? 'continued' : this.held ? 'waiting' : this.edited ? 'editing' : this.focused ? 'focused' : 'counting',
            countdown: waiting && this.remaining !== undefined ? {
                remainingMs: this.deadline === undefined ? this.remaining : Math.max(0, this.deadline - Date.now()),
                running: this.deadline !== undefined,
            } : undefined,
        };
    }
    publish() {
        this.snapshot = this.read();
        const ticking = this.deadline !== undefined && !this.closed;
        if (ticking && this.timer === undefined)
            this.timer = setInterval(() => {
                if (this.deadline !== undefined && Date.now() >= this.deadline)
                    void this.timeout();
                else
                    this.publish();
            }, 1000);
        if (!ticking && this.timer !== undefined) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
        for (const listener of this.listeners)
            listener();
    }
    /** Focus freezes only an untouched countdown; blur resumes the remaining duration. */
    holdFocus() {
        if (this.held || this.edited || this.focused)
            return;
        if (this.deadline !== undefined)
            this.remaining = Math.max(0, this.deadline - Date.now());
        this.deadline = undefined;
        this.focused = true;
        this.publish();
    }
    releaseFocus() {
        if (!this.focused)
            return;
        this.focused = false;
        if (!this.ended && this.pending.timed === true && this.remaining !== undefined)
            this.deadline = Date.now() + this.remaining;
        this.publish();
    }
    /** The first actual edit keeps this Client's answerable foreground wait open. */
    engage() {
        if (this.edited || this.held)
            return;
        if (this.deadline !== undefined)
            this.remaining = Math.max(0, this.deadline - Date.now());
        this.edited = true;
        this.focused = false;
        this.deadline = undefined;
        this.publish();
    }
    takeTime() {
        this.held = true;
        this.focused = false;
        this.deadline = undefined;
        this.publish();
    }
    async timeout() {
        if (this.deadline === undefined || this.held || this.edited || this.focused || this.ended)
            return;
        this.deadline = undefined;
        this.publish();
        try {
            await this.channel.timeout(this.pending.key);
        }
        catch (error) {
            this.failure = `等待状态更新失败：${String(error)}`;
            // Do not leave a failed Client timeout claim holding the Host indefinitely.
            this.claim?.dispose();
        }
        this.publish();
    }
    async answer(answer) {
        await this.channel.answer(this.pending.key, answer);
        this.close();
    }
    async dismiss() {
        if (this.dismissal === 'hide') {
            this.hidden = true;
            this.releaseFocus();
            this.publish();
            return;
        }
        await this.channel.cancel(this.pending.key);
        this.close();
    }
    reveal() { this.hidden = false; this.publish(); }
    close() {
        this.closed = true;
        this.deadline = undefined;
        this.draft = {};
        this.publish();
        // The Host closes the claim after accepting the answer; do not release it
        // ahead of the RPC and accidentally turn an on-time answer into a timeout.
        this.claim?.dispose();
    }
    /** Called when the native composer is disposed or a fresh Host snapshot drops this call. */
    dispose() {
        this.lifetime.abort();
        this.close();
        this.listeners.clear();
    }
}

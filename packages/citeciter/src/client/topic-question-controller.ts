import type { AskUserQuestionAnswer } from '@deepseek-ai/dsh-user-questions'
import type { PendingQuestion as HostQuestion } from '@deepseek-ai/dsh-client-ui-user-questions/client'
import type { PendingQuestion } from '../topic.ts'

export interface QuestionDraftAnswer { readonly selected: readonly string[]; readonly custom: string }
export type QuestionDraft = Readonly<Record<string, QuestionDraftAnswer>>
type HostSnapshot = ReturnType<HostQuestion['getSnapshot']>
export type TopicQuestionSnapshot = HostSnapshot & { readonly hidden: boolean; readonly error: string | undefined }
interface WaitClaim extends AsyncIterable<{ remainingMs: number }> { dispose(): void }
export interface TopicQuestionChannel {
  claim(callId: string, signal: AbortSignal): WaitClaim
  answer(key: string, answer: AskUserQuestionAnswer): Promise<void>
  cancel(key: string): Promise<void>
  timeout(key: string): Promise<void>
}

/**
 * Private Topic presentation of the Host's foreground question protocol.
 * This controller outlives its React card: hidden cards keep counting, and a
 * disconnected Client releases its public Host claim instead of pinning a run.
 */
export class TopicQuestionController {
  readonly review = undefined
  readonly dismissal: 'hide' | 'cancel'
  private pending: PendingQuestion
  private readonly lifetime = new AbortController()
  private readonly listeners = new Set<() => void>()
  private timer: ReturnType<typeof setInterval> | undefined
  private claim: WaitClaim | undefined
  private started = false
  private ended = false
  private deadline: number | undefined
  private remaining: number | undefined
  private focused = false
  private edited = false
  private held = false
  private closed = false
  private hidden = false
  private failure: string | undefined
  private draft: QuestionDraft = {}
  private snapshot: TopicQuestionSnapshot

  constructor(pending: PendingQuestion, private readonly channel: TopicQuestionChannel) {
    this.pending = pending
    this.dismissal = pending.callId === undefined ? 'cancel' : 'hide'
    this.snapshot = this.read()
  }

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }
  readonly getSnapshot = (): TopicQuestionSnapshot => this.snapshot
  get callId(): string | undefined { return this.pending.callId }
  getDraft(): QuestionDraft { return this.draft }
  setDraft(draft: QuestionDraft): void { this.draft = draft }

  /** Reconcile the private Host snapshot; an older open frame cannot undo continuation. */
  sync(pending: PendingQuestion): void {
    if (this.closed || this.lifetime.signal.aborted) return
    this.pending = this.pending.state === 'continued' ? { ...pending, state: 'continued' } : pending
    if (this.pending.state === 'continued') {
      this.deadline = undefined
      this.ended = true
    } else if (!this.started && pending.timed === true && pending.callId !== undefined) {
      this.started = true
      void this.attach(pending.callId)
    }
    this.publish()
  }

  private async attach(callId: string): Promise<void> {
    try {
      const claim = this.channel.claim(callId, this.lifetime.signal)
      this.claim = claim
      for await (const frame of claim) {
        if (this.closed || this.lifetime.signal.aborted) break
        this.remaining = Math.max(0, frame.remainingMs)
        if (!this.focused && !this.edited && !this.held) this.deadline = Date.now() + this.remaining
        this.publish()
      }
    } catch (error) {
      if (!this.closed && !this.lifetime.signal.aborted) {
        this.failure = `无法接管等待：${String(error)}。宿主将按原定时限继续。`
      }
    } finally {
      this.ended = true
      this.deadline = undefined
      this.claim = undefined
      this.publish()
    }
  }

  private read(): typeof this.snapshot {
    const continued = this.pending.state === 'continued'
    const waiting = this.pending.timed === true && !continued && !this.ended
    return {
      state: continued ? 'continued' : 'open',
      channel: this.closed ? 'none' : continued ? 'rpc' : this.ended ? 'none' : 'waterfall',
      closed: this.closed, hidden: this.hidden, error: this.failure,
      waitState: continued ? 'continued' : this.held ? 'waiting' : this.edited ? 'editing' : this.focused ? 'focused' : 'counting',
      countdown: waiting && this.remaining !== undefined ? {
        remainingMs: this.deadline === undefined ? this.remaining : Math.max(0, this.deadline - Date.now()),
        running: this.deadline !== undefined,
      } : undefined,
    }
  }

  private publish(): void {
    this.snapshot = this.read()
    const ticking = this.deadline !== undefined && !this.closed
    if (ticking && this.timer === undefined) this.timer = setInterval(() => {
      if (this.deadline !== undefined && Date.now() >= this.deadline) void this.timeout()
      else this.publish()
    }, 1000)
    if (!ticking && this.timer !== undefined) { clearInterval(this.timer); this.timer = undefined }
    for (const listener of this.listeners) listener()
  }

  /** Focus freezes only an untouched countdown; blur resumes the remaining duration. */
  holdFocus(): void {
    if (this.held || this.edited || this.focused) return
    if (this.deadline !== undefined) this.remaining = Math.max(0, this.deadline - Date.now())
    this.deadline = undefined
    this.focused = true
    this.publish()
  }
  releaseFocus(): void {
    if (!this.focused) return
    this.focused = false
    if (!this.ended && this.pending.timed === true && this.remaining !== undefined) this.deadline = Date.now() + this.remaining
    this.publish()
  }
  /** The first actual edit keeps this Client's answerable foreground wait open. */
  engage(): void {
    if (this.edited || this.held) return
    if (this.deadline !== undefined) this.remaining = Math.max(0, this.deadline - Date.now())
    this.edited = true
    this.focused = false
    this.deadline = undefined
    this.publish()
  }
  takeTime(): void {
    this.held = true
    this.focused = false
    this.deadline = undefined
    this.publish()
  }

  private async timeout(): Promise<void> {
    if (this.deadline === undefined || this.held || this.edited || this.focused || this.ended) return
    this.deadline = undefined
    this.publish()
    try { await this.channel.timeout(this.pending.key) }
    catch (error) {
      this.failure = `等待状态更新失败：${String(error)}`
      // Do not leave a failed Client timeout claim holding the Host indefinitely.
      this.claim?.dispose()
    }
    this.publish()
  }

  async answer(answer: AskUserQuestionAnswer): Promise<void> {
    await this.channel.answer(this.pending.key, answer)
    this.close()
  }
  async dismiss(): Promise<void> {
    if (this.dismissal === 'hide') { this.hidden = true; this.releaseFocus(); this.publish(); return }
    await this.channel.cancel(this.pending.key)
    this.close()
  }
  reveal(): void { this.hidden = false; this.publish() }

  private close(): void {
    this.closed = true
    this.deadline = undefined
    this.draft = {}
    this.publish()
    // The Host closes the claim after accepting the answer; do not release it
    // ahead of the RPC and accidentally turn an on-time answer into a timeout.
    this.claim?.dispose()
  }
  /** Called when the native composer is disposed or a fresh Host snapshot drops this call. */
  dispose(): void {
    this.lifetime.abort()
    this.close()
    this.listeners.clear()
  }
}

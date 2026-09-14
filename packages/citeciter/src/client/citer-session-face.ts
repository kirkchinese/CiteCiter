import type { Context } from '@deepseek-ai/cordis'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { SessionFace, SessionSnapshot } from '@deepseek-ai/dsh-api-session-controller/client'
import { SessionSeq, type SessionId } from '@deepseek-ai/dsh-session/types'
import type { MessageId } from '@deepseek-ai/dsh-llm/brand'
import type { SessionRequestId } from '@deepseek-ai/dsh-api-session-controller/types'
import type {} from '../typert.remote-client.ts'
import type {} from '@deepseek-ai/dsh-api-session-controller/remote'
import type {} from '@deepseek-ai/dsh-commands/remote'

type Submission = Parameters<SessionFace['beginSubmission']>[0]
type Retirement = Parameters<NonNullable<Submission['onRetire']>>[0]

/** Own the published SessionFace contract for Citer navigation. Sending, uploads and inbox mutations remain native DSH operations. */
export class CiterSessionFace implements SessionFace {
  private readonly store
  private readonly pending = new Map<SessionRequestId, Submission>()
  private readonly lifetime = new AbortController()
  private readonly emptyProjection = createSnapshotStore<unknown>(undefined)
  readonly projections = { faceOf: (_key: string) => this.emptyProjection }
  private observers = 0
  private timer: ReturnType<typeof setTimeout> | undefined
  private refreshing: Promise<void> | undefined

  constructor(private readonly ctx: Context, readonly sessionId: SessionId) {
    this.store = createSnapshotStore<SessionSnapshot>({
      sessionId, queue: [], pendingSubmissions: [], running: false, subagent: null, removed: false,
      openState: 'cold', openError: null, hasMore: false, loadingOlder: false, promptError: null,
      blank: true, lastAgentError: null, promptAttempted: false, awaitingFirstTurn: false,
    })
  }

  getSnapshot = (): SessionSnapshot => this.store.getSnapshot()
  subscribe = (listener: () => void): (() => void) => {
    this.observers++
    const release = this.store.subscribe(listener)
    this.schedule(0)
    return () => { release(); this.observers--; this.schedule() }
  }

  /** Establish ownership and obtain a real baseline before accepting composer work. */
  async ready(): Promise<void> { await this.refresh(); this.lifetime.signal.throwIfAborted() }

  private patch(patch: Partial<SessionSnapshot>): void { this.store.set({ ...this.getSnapshot(), ...patch }) }

  private retire(id: SessionRequestId, outcome: Retirement): void {
    const input = this.pending.get(id)
    if (input === undefined) return
    this.pending.delete(id)
    this.patch({ pendingSubmissions: this.getSnapshot().pendingSubmissions.filter(row => row.requestId !== id) })
    input.onRetire?.(outcome)
    this.schedule()
  }

  beginSubmission(input: Submission) {
    this.lifetime.signal.throwIfAborted()
    const requestId = crypto.randomUUID() as SessionRequestId
    this.pending.set(requestId, input)
    const current = this.getSnapshot()
    this.patch({ promptAttempted: true, pendingSubmissions: [...current.pendingSubmissions, {
      requestId, placement: current.running ? input.mode === 'steer' ? 'steering' : 'queued' : 'transcript',
      time: Date.now(), text: input.text, attachments: input.attachments,
    }] })
    this.schedule(0)
    return { requestId, abandon: () => this.retire(requestId, { reason: 'failed' }) }
  }

  prompt: SessionFace['prompt'] = async (content, mode, signal, requestId) => {
    const id = requestId ?? crypto.randomUUID() as SessionRequestId
    this.patch({ promptError: null, lastAgentError: null, promptAttempted: true })
    try {
      const result = await this.ctx.remote.session.prompt({ sessionId: this.sessionId, requestId: id, content, mode,
        clientTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }, AbortSignal.any([this.lifetime.signal, ...(signal === undefined ? [] : [signal])]))
      if (!result.ok) {
        this.retire(id, { reason: 'failed' })
        this.patch({ promptError: { op: 'send', error: result.error } })
      } else {
        this.patch({ blank: false })
        // Admission and observation are separate. A temporary read failure must
        // not turn an accepted send into a retry and duplicate the user's prompt.
        this.schedule(0)
      }
      return result
    } catch (error) { this.retire(id, { reason: 'failed' }); throw error }
  }

  /** Generic Citer attachment read; the installed SessionFace verb only supports images. */
  readCiterAttachment = async (attachmentId: string) => {
    const result = await this.ctx.remote.citeciter.request({ action: 'native-attachment', topicSessionId: this.sessionId, attachmentId }, this.lifetime.signal)
    if (!result.ok) return result
    if (result.value.kind !== 'native-attachment') throw new Error('Citer 附件响应类型不匹配')
    return { ok: true as const, value: { attachment: result.value.attachment, data: Uint8Array.from(atob(result.value.data), char => char.charCodeAt(0)) } }
  }

  readAttachment: SessionFace['readAttachment'] = async attachmentId => {
    const result = await this.readCiterAttachment(attachmentId)
    if (!result.ok) return result
    if (!('mediaType' in result.value.attachment)) throw new Error('此附件是普通文件，请使用文件下载入口')
    return { ok: true, value: { attachment: result.value.attachment, data: result.value.data } }
  }

  updateQueue: SessionFace['updateQueue'] = async (itemId, action) => {
    const result = await this.ctx.remote.session.updateQueue({ sessionId: this.sessionId, itemId, action })
    this.schedule(0)
    return result
  }
  cancel: SessionFace['cancel'] = async () => {
    const result = await this.ctx.remote.session.cancel({ sessionId: this.sessionId })
    if (!result.ok) this.patch({ promptError: { op: 'stop', error: result.error } })
    this.schedule(0)
    return result
  }
  rename: SessionFace['rename'] = async title => {
    const result = await this.ctx.remote.session.rename({ sessionId: this.sessionId, title })
    return result.ok ? { ok: true, value: { title: result.value.title, seq: SessionSeq(result.value.seq) } } : result
  }
  command: SessionFace['command'] = async line => {
    const result = await this.ctx.remote.commands.execute(this.sessionId, line, [])
    return result.ok ? { ok: true, value: { matched: result.value !== undefined } } : result
  }
  // Transcript history is already owned and fully materialized by Citer's
  // Topic reader. These native face verbs do not open the Host's history stage.
  loadOlder = async (): Promise<void> => {}
  loadThrough = async (): Promise<void> => {}

  private schedule(delay = 350): void {
    clearTimeout(this.timer)
    this.timer = undefined
    if (this.lifetime.signal.aborted || (this.observers === 0 && this.pending.size === 0)) return
    this.timer = setTimeout(() => {
      this.timer = undefined
      void this.refresh().catch(error => {
        if (!this.lifetime.signal.aborted) this.patch({ openState: 'error', lastAgentError: String(error) })
      }).finally(() => this.schedule())
    }, delay)
  }

  private refresh(): Promise<void> {
    if (this.refreshing !== undefined) return this.refreshing
    const operation = (async () => {
      const result = await this.ctx.remote.citeciter.request({ action: 'native-state', topicSessionId: this.sessionId, requestIds: [...this.pending.keys()].slice(0, 32) }, this.lifetime.signal)
      if (!result.ok) throw new Error(result.error.message)
      if (result.value.kind !== 'native-state') throw new Error('Citer 会话状态响应类型不匹配')
      if (this.lifetime.signal.aborted) return
      const state = result.value.state
      this.patch({ openState: 'open', openError: null, running: state.running, blank: state.blank, lastAgentError: state.error,
        queue: state.queue.map(row => ({
          id: row.id as MessageId, messageId: row.id as MessageId, placement: row.placement,
          ...(row.rpcId === undefined ? {} : { rpcId: row.rpcId as SessionRequestId }),
          text: row.text || null, preview: row.text || '附件', content: [{ type: 'text', text: row.text }, ...row.attachments],
        })),
      })
      for (const receipt of state.receipts) this.retire(receipt.requestId as SessionRequestId, { reason: 'observed', attachments: receipt.attachments.map(block => block.attachment) })
    })()
    this.refreshing = operation
    void operation.finally(() => { if (this.refreshing === operation) this.refreshing = undefined }).catch(() => { /* The caller surfaces the same read failure. */ })
    return operation
  }

  /** Stop polling and settle each owned submission exactly once when its plugin closes. */
  dispose(): void {
    this.lifetime.abort()
    clearTimeout(this.timer)
    for (const id of this.pending.keys()) this.retire(id, { reason: 'failed' })
  }
}

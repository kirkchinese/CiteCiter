import type { Context } from '@deepseek-ai/cordis'
import type SessionStore from '@deepseek-ai/dsh-session'
import type { Session, SessionId } from '@deepseek-ai/dsh-session'

/** Bridge native checkpoints and identity lookups to owned stores without adding their members to Host enumeration. */
export class CiterSessionAccess {
  private readonly owners = new Map<SessionId, { session: Session; store: SessionStore }>()

  /** Install one reversible adapter for this plugin's lifetime. No Host files or Agent Loop methods change. */
  constructor(ctx: Context, drain: () => Promise<void>) {
    const host = ctx.sessions
    const get = host.get
    const flush = host.flush
    const getDescriptor = Object.getOwnPropertyDescriptor(host, 'get')
    const flushDescriptor = Object.getOwnPropertyDescriptor(host, 'flush')
    const owners = this.owners
    const lookup: SessionStore['get'] = function (this: SessionStore, id) { return get.call(this, id) ?? owners.get(id)?.session }
    const checkpoint: SessionStore['flush'] = function (this: SessionStore, session) {
      const owner = owners.get(session.id)
      return owner?.session === session ? owner.store.flush(session) : flush.call(this, session)
    }
    ctx.effect(() => {
      host.get = lookup
      host.flush = checkpoint
      return async () => {
        // Cordis tears sibling effects down concurrently. Keep checkpoint
        // routing alive until owned Agents have completed their final flush.
        try { await drain() } finally {
          // Cordis creates a fresh callable proxy on property reads. Compare the
          // actual own descriptor, then restore the exact previous shape.
          if (Object.getOwnPropertyDescriptor(host, 'get')?.value === lookup) {
            if (getDescriptor === undefined) Reflect.deleteProperty(host, 'get')
            else Object.defineProperty(host, 'get', getDescriptor)
          }
          if (Object.getOwnPropertyDescriptor(host, 'flush')?.value === checkpoint) {
            if (flushDescriptor === undefined) Reflect.deleteProperty(host, 'flush')
            else Object.defineProperty(host, 'flush', flushDescriptor)
          }
          owners.clear()
        }
      }
    }, 'citeciter: owned Session identity and checkpoint adapter')
  }

  /** Register after native enter; unregister after native detach, including failed publication. */
  enter(session: Session, store: SessionStore): () => void {
    if (this.owners.has(session.id)) throw new Error(`Citer session ${session.id} already has an owner`)
    const owner = { session, store }
    this.owners.set(session.id, owner)
    return () => { if (this.owners.get(session.id) === owner) this.owners.delete(session.id) }
  }
}

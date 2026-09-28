import type { Context } from '@deepseek-ai/cordis'
import type SessionStore from '@deepseek-ai/dsh-session'
import type { Session, SessionId } from '@deepseek-ai/dsh-session'

/** Route durability checkpoints to owned stores without publishing Topic identities in the Host store. */
export class CiterSessionAccess {
  private readonly owners = new Map<SessionId, { session: Session; store: SessionStore }>()

  /** Install one reversible adapter for this plugin's lifetime. No Host files or Agent Loop methods change. */
  constructor(ctx: Context, drain: () => Promise<void>) {
    const host = ctx.sessions
    const flush = host.flush
    const flushDescriptor = Object.getOwnPropertyDescriptor(host, 'flush')
    const owners = this.owners
    // Native model checkpoint policy only resolves Host members. Checkpoint our
    // exact owned identity through the public stream boundary instead of making
    // get() advertise it to unrelated consumers (including Session navigation).
    ctx.on('llm/stream', (options, next) => {
      const owner = options.sessionId === undefined ? undefined : owners.get(options.sessionId)
      if (owner === undefined) return next()
      return (async function* () {
        await owner.store.flush(owner.session)
        yield* next()
      })()
    })
    const checkpoint: SessionStore['flush'] = function (this: SessionStore, session) {
      const owner = owners.get(session.id)
      return owner?.session === session ? owner.store.flush(session) : flush.call(this, session)
    }
    ctx.effect(() => {
      host.flush = checkpoint
      return async () => {
        // Cordis tears sibling effects down concurrently. Keep checkpoint
        // routing alive until owned Agents have completed their final flush.
        try { await drain() } finally {
          // Cordis creates a fresh callable proxy on property reads. Compare the
          // actual own descriptor, then restore the exact previous shape.
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

import { AsyncLocalStorage } from 'node:async_hooks'
import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type SessionStore from '@deepseek-ai/dsh-session'
import type { Session, SessionId } from '@deepseek-ai/dsh-session'

/**
 * Route durability checkpoints to owned stores, and answer the Host store's id lookups for a Topic while its
 * Agent prepares a model request, without publishing Topic identities to the rest of the Host.
 */
export class CiterSessionAccess {
  private readonly owners = new Map<SessionId, { session: Session; store: SessionStore }>()
  /** The Topic whose Agent is inside its `agent/request` waterfall in this asynchronous chain. */
  private readonly requesting = new AsyncLocalStorage<SessionId>()

  /** Install one reversible adapter for this plugin's lifetime. No Host files or Agent Loop methods change. */
  constructor(ctx: Context, drain: () => Promise<void>) {
    const host = ctx.sessions
    const flush = host.flush
    const get = host.get
    const descriptors = { flush: Object.getOwnPropertyDescriptor(host, 'flush'), get: Object.getOwnPropertyDescriptor(host, 'get') }
    const owners = this.owners
    const requesting = this.requesting
    // Native model checkpoint policy only resolves Host members. Checkpoint our
    // exact owned identity through the public stream boundary as well.
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
    // Plugins hooking `agent/request` may check that a live Agent's Session is the one the Host store returns
    // for its id (dsh-codex-connect does on every request since DSH 0.2.2-rc.2, failing with
    // TASK_LIVE_ROOT_REQUIRED). Inside a Topic's own request waterfall the Host store answers for that Topic.
    // Everywhere else it does not, so the session list, title service and log upload keep ignoring Topics.
    const lookup: SessionStore['get'] = function (this: SessionStore, id) {
      const own = get.call(this, id)
      if (own !== undefined || requesting.getStore() !== id) return own
      return owners.get(id)?.session
    }
    ctx.effect(() => {
      host.flush = checkpoint
      host.get = lookup
      return async () => {
        // Cordis tears sibling effects down concurrently. Keep checkpoint
        // routing alive until owned Agents have completed their final flush.
        try { await drain() } finally {
          // Cordis creates a fresh callable proxy on property reads. Compare the
          // actual own descriptor, then restore the exact previous shape.
          for (const [name, installed] of [['flush', checkpoint], ['get', lookup]] as const) {
            if (Object.getOwnPropertyDescriptor(host, name)?.value !== installed) continue
            const previous = descriptors[name]
            if (previous === undefined) Reflect.deleteProperty(host, name)
            else Object.defineProperty(host, name, previous)
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

  /**
   * Mark one Topic Agent's request waterfall. Registered on the Agent's own context after the Host plugins
   * started, with `prepend`, so it runs before their listeners and they see the Topic while it is marked.
   * @param agentCtx - the Topic Agent's contribution context; the listener leaves with it.
   */
  attach(agentCtx: Context, agent: Agent): void {
    agentCtx.on('agent/request', (_payload, next) => this.requesting.run(agent.id, next), { prepend: true })
  }
}

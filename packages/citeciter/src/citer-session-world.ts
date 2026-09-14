import type { Context, Fiber } from '@deepseek-ai/cordis'
import type { AgentHandle } from '@deepseek-ai/dsh-agent'
import JsonlSessionPersistence from '@deepseek-ai/dsh-session-persistence-jsonl'
import { CiterAgentRegistry } from './citer-agent-registry.ts'
import { createCiterSessionStore } from './citer-session-store.ts'
import { loadHostAgentModules } from './host-agent-modules.ts'
import type { CiterSessionAccess } from './citer-session-access.ts'

/** A Topic-owned DSH factory and JSONL backend; live conversation APIs stay shared, disk ownership does not. */
export class CiterSessionWorld {
  private fiber: Fiber | undefined
  private readonly started: Promise<Context>
  private disposal: Promise<void> | undefined
  private readonly handles = new Set<AgentHandle>()
  private release: (() => Promise<void>) | undefined
  private closing = false

  /** @param host - owning plugin context. @param root - verified Topic-owned JSONL directory. */
  constructor(host: Context, root: string, access: CiterSessionAccess) {
    this.started = this.start(host, root, access)
  }

  /** Wait for the isolated factory before creating or restoring a Topic. */
  context(): Promise<Context> { return this.started }

  /** Retain the native handle so Agents settle while their persistence listeners are still mounted. */
  async own(handle: AgentHandle): Promise<AgentHandle> {
    if (this.closing) {
      await handle.dispose()
      throw new Error('Citer Session world is closing')
    }
    let disposal: Promise<void> | undefined
    const owned: AgentHandle = {
      agent: handle.agent,
      dispose: () => disposal ??= handle.dispose().finally(() => { this.handles.delete(owned) }),
    }
    this.handles.add(owned)
    return owned
  }

  private async start(host: Context, root: string, access: CiterSessionAccess): Promise<Context> {
    const modules = await loadHostAgentModules()
    const ready = Promise.withResolvers<Context>()
    const base = host.isolate('agents').isolate('sessions').isolate('agentLoop').isolate('sessionPersistence').isolate('settings').isolate('typert')
    const world = this
    this.release = host.effect(function* () {
      const fiber = world.fiber = base.plugin({
        name: 'citeciter-session-world',
        apply: async (ctx: Context) => {
          await ctx.plugin(CiterAgentRegistry, { registry: host.agents })
          await ctx.plugin(createCiterSessionStore(modules.SessionStore, access), { store: host.sessions })
          await ctx.plugin(JsonlSessionPersistence, { root, compression: 'none' })
          await ctx.plugin({
            name: 'citeciter-session-factory',
            inject: ['agents', 'sessionPersistence', 'llm', 'sessions', 'systemPrompt', 'tools', 'sessionProjections'],
            apply: async (services: Context) => {
              // Factory variables receive their own registration scope. Agents still
              // join the Host's standing preset and inherit its global variables.
              const scope = modules.createScope(services, {})
              services.effect(() => () => scope.dispose(), 'citeciter: factory registration scope')
              // The native Agent creates a child scope with no inject map. Carry
              // the explicitly injected owned store in that context view so its
              // publication boundary cannot fall back to a root Session API.
              await scope.ctx.extend({ sessions: services.sessions }).plugin(modules.AgentLoop, { agents: [] })
              ready.resolve(services)
            },
          })
        },
      })
      // Yielding the child's disposer transfers it into this ordered effect.
      // Sibling teardown must not remove persistence before the final end-frame.
      let failure: unknown
      yield () => { if (failure !== undefined) throw failure }
      yield fiber.dispose
      yield async () => {
        world.closing = true
        const results = await Promise.allSettled([...world.handles].map(handle => handle.dispose()))
        const errors = results.flatMap(result => result.status === 'rejected' ? [result.reason] : [])
        if (errors.length > 0) failure = new AggregateError(errors, 'Citer Agent drain failed')
      }
    }, 'citeciter: drain Agents before Session services')
    try { await this.fiber; return await ready.promise }
    catch (error) { await this.release?.(); throw error }
  }

  /** Stop and drain all factory-owned Agents before the caller can delete this Topic's files. */
  dispose(): Promise<void> {
    return this.disposal ??= (async () => {
      await this.started.catch(() => undefined)
      await this.release?.()
      while (this.fiber?.inertia !== undefined) await this.fiber.inertia
    })()
  }
}

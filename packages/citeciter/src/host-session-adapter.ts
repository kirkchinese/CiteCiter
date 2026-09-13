import type { Context } from '@deepseek-ai/cordis'
import type { Agent, AgentHandle } from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-agent-presets'
import type {} from '@deepseek-ai/dsh-api-session-controller'
import { SessionId, SessionLogOffset, type SessionEvent } from '@deepseek-ai/dsh-session'
import { setSandboxMode } from '@deepseek-ai/dsh-sandbox-policy'
import type { CiteCiterSettings, TopicMetadata } from './topic.ts'
import { CiterSessionWorld } from './citer-session-world.ts'
import { CiterSessionAccess } from './citer-session-access.ts'

/** Host-owned session services; Citer owns only its scoped contributions and factory handles. */
export class HostSessionAdapter {
  private readonly metadata = new Map<string, TopicMetadata>()
  private readonly scopes = new Map<Agent, { dispose: () => Promise<void>, ready: Promise<void> }>()
  private readonly worlds = new Map<string, CiterSessionWorld>()
  private readonly access: CiterSessionAccess
  private disposal: Promise<void> | undefined

  constructor(
    private readonly ctx: Context,
    private readonly settings: () => CiteCiterSettings,
    private readonly assemble: (scope: Context, agent: Agent, metadata: TopicMetadata) => Promise<void>,
    private readonly storageRoot: (metadata: TopicMetadata) => string,
  ) {
    this.access = new CiterSessionAccess(ctx, () => this.dispose())
    ctx.on('agent/created', ({ agent }) => {
      const metadata = this.metadata.get(agent.session.header.id)
      if (metadata !== undefined) void this.attach(agent, metadata).catch(error => ctx.logger.error('CiteCiter session composition failed', error))
    })
    ctx.on('agent/disposed', ({ agent }) => {
      const entry = this.scopes.get(agent)
      this.scopes.delete(agent)
      if (entry !== undefined) void entry.dispose().catch(error => ctx.logger.warn('CiteCiter scope disposal failed', error))
    })
  }

  /** Drain owned factories before removing their native checkpoint routes. */
  private dispose(): Promise<void> {
    return this.disposal ??= (async () => {
      await Promise.all([...this.worlds.values()].map(world => world.dispose()))
      this.worlds.clear()
      const entries = [...this.scopes.values()]
      this.scopes.clear()
      await Promise.all(entries.map(async entry => {
        // Failed startup still owns a fiber that must be disposed.
        await entry.ready.catch(() => undefined)
        await entry.dispose()
      }))
    })()
  }

  /** Retain navigation metadata before the Host can resume this identity. */
  remember(metadata: TopicMetadata): void { this.metadata.set(metadata.sessionId, metadata) }

  /** Resolve the Topic's factory/persistence realm, retaining old candidate records without deleting Host files. */
  async context(metadata: TopicMetadata): Promise<Context> {
    if (metadata.storage !== 'source') return this.ctx
    let world = this.worlds.get(metadata.sessionId)
    if (world === undefined) {
      world = new CiterSessionWorld(this.ctx, this.storageRoot(metadata), this.access)
      this.worlds.set(metadata.sessionId, world)
    }
    return world.context()
  }

  /** Release a complete owned Topic realm before deleting its files. */
  async retire(metadata: TopicMetadata): Promise<void> {
    const world = this.worlds.get(metadata.sessionId)
    if (world === undefined) return
    await world.dispose()
    this.worlds.delete(metadata.sessionId)
    this.metadata.delete(metadata.sessionId)
  }

  /** Compose a Topic on a native Agent without replacing its loop, tools or permission service. */
  private attach(agent: Agent, metadata: TopicMetadata): Promise<void> {
    const existing = this.scopes.get(agent)
    if (existing !== undefined) return existing.ready
    // Inherit the Host's exact scope through its own Cordis context. A separately
    // resolved dsh-scope package can carry a different private Symbol in Desktop.
    const fiber = agent.ctx.plugin({
      name: 'citeciter-native-topic',
      inject: ['systemPrompt', 'tools', 'attachments'],
      apply: (child: Context) => this.assemble(child, agent, metadata),
    })
    const ready = Promise.resolve(fiber).then(() => undefined)
    const dispose = async () => {
      await fiber.dispose()
      while (fiber.inertia !== undefined) await fiber.inertia
    }
    this.scopes.set(agent, { dispose, ready })
    return ready
  }

  /** Create a native Session with an explicit initial permission. Citer supplies an empty seed so removed references cannot leak through inherited history. No prompt is sent here. */
  async create(metadata: TopicMetadata, seed: readonly SessionEvent[], signal?: AbortSignal): Promise<AgentHandle> {
    this.remember(metadata)
    const owner = await this.context(metadata)
    const handle = await owner.agents.create({
      sessionId: SessionId(metadata.sessionId),
      meta: {
        ...(metadata.sourceCwd === '' ? {} : { cwd: metadata.sourceCwd }),
        parentSession: SessionId(metadata.sourceSessionId),
        isSeeded: seed.length > 0,
        agentPreset: this.ctx.agentPresets.defaultId,
      },
      ...(seed.length === 0 ? {} : { seed, inheritedEventCount: SessionLogOffset(seed.length) }),
      agentOptions: { provider: metadata.modelConfig.provider, model: metadata.modelConfig.model },
      setup: async (agentCtx, agent) => {
        await this.ctx.agentPresets.mount(agentCtx, agent.session.header.agentPreset)
        setSandboxMode(agent.session, this.settings().defaultPermission ?? 'read-only')
        await this.attach(agent, metadata)
      },
      ...(signal === undefined ? {} : { signal }),
    })
    return this.worlds.get(metadata.sessionId)?.own(handle) ?? handle
  }

  /** Resume with the Host's preset and preserve the user's logged permission. */
  async resume(metadata: TopicMetadata, signal?: AbortSignal): Promise<AgentHandle> {
    this.remember(metadata)
    const live = this.ctx.agents.get(SessionId(metadata.sessionId))
    if (live !== undefined) {
      await this.attach(live, metadata)
      // A borrowed live Agent remains owned by the Host consumer that created it.
      return { agent: live, dispose: async () => {} }
    }
    const owner = await this.context(metadata)
    const handle = await owner.agents.resume({
      resumeSessionId: SessionId(metadata.sessionId),
      agentOptions: { provider: metadata.modelConfig.provider, model: metadata.modelConfig.model },
      setup: async (agentCtx, agent) => {
        await this.ctx.agentPresets.mount(agentCtx, agent.session.header.agentPreset)
        await this.attach(agent, metadata)
      },
      ...(signal === undefined ? {} : { signal }),
    })
    return this.worlds.get(metadata.sessionId)?.own(handle) ?? handle
  }
}

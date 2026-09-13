import type { Context } from '@deepseek-ai/cordis'
import AgentRegistry, { type Agent } from '@deepseek-ai/dsh-agent'
import type { SessionId } from '@deepseek-ai/dsh-session'

/** Own a separate factory while publishing live identities through DSH's public registry for its conversation, upload and queue APIs. */
export class CiterAgentRegistry extends AgentRegistry {
  constructor(ctx: Context, private readonly options: { readonly registry: AgentRegistry }) { super(ctx) }
  override enter(agent: Agent, owner: Agent | undefined): () => void { return this.options.registry.enter(agent, owner) }
  override announce(agent: Agent): void { this.options.registry.announce(agent) }
  override register(agent: Agent): () => void { return this.options.registry.register(agent) }
  override get(id: SessionId): Agent | undefined { return this.options.registry.get(id) }
  override list(): Agent[] { return this.options.registry.list() }
  override roots(): Agent[] { return this.options.registry.roots() }
  override isOwnedBy(id: SessionId, owner: Agent): boolean { return this.options.registry.isOwnedBy(id, owner) }
  override currentInitiator(): Agent | undefined { return this.options.registry.currentInitiator() }
  override requireInitiator(): Agent { return this.options.registry.requireInitiator() }
  override withInitiator<T>(agent: Agent, operation: () => T): T { return this.options.registry.withInitiator(agent, operation) }
  override withoutInitiator<T>(operation: () => T): T { return this.options.registry.withoutInitiator(operation) }
}

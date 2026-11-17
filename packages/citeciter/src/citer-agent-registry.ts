import type { Context } from '@deepseek-ai/cordis'
import AgentRegistry from '@deepseek-ai/dsh-agent'

/**
 * Methods whose state lives in DSH's own registry: live identities, ownership and initiators. Some exist only
 * in some DSH releases (`roots` and `isOwnedBy` until 0.2.2-rc.2, `enter`'s owner argument likewise), so they
 * are forwarded by name rather than declared, and a method the running DSH lacks stays absent here too.
 */
const FORWARDED = ['enter', 'announce', 'register', 'get', 'list', 'roots', 'isOwnedBy', 'currentInitiator', 'requireInitiator', 'withInitiator', 'withoutInitiator'] as const

/** Own a separate factory while publishing live identities through DSH's public registry for its conversation, upload and queue APIs. */
export class CiterAgentRegistry extends AgentRegistry {
  constructor(ctx: Context, options: { readonly registry: AgentRegistry }) {
    super(ctx)
    const registry = options.registry as unknown as Readonly<Record<string, unknown>>
    for (const name of FORWARDED) {
      const method = registry[name]
      if (typeof method !== 'function') continue
      // An own property shadows the inherited method, which would act on this instance's empty store.
      Object.defineProperty(this, name, {
        configurable: true,
        writable: true,
        value: (...args: unknown[]): unknown => (method as (...args: unknown[]) => unknown).apply(options.registry, args),
      })
    }
  }
}

import type { Context } from '@deepseek-ai/cordis'
import type AgentLoop from '@deepseek-ai/dsh-agent-loop'
import type SessionStore from '@deepseek-ai/dsh-session'
import type SessionTitleService from '@deepseek-ai/dsh-session-title'

interface HostScope { readonly ctx: Context; dispose(): Promise<void> }
export interface HostAgentModules {
  readonly AgentLoop: typeof AgentLoop
  readonly SessionStore: typeof SessionStore
  readonly SessionTitleService: typeof SessionTitleService
  readonly createScope: (ctx: Context, key: object) => HostScope
}

/**
 * Load the declared SDK peers through DSH's active profile resolver.
 * File URLs bypass peer routing and can create a second private scope identity,
 * particularly when Electron ASAR paths use different casing on Windows.
 * Bare imports also leave CLI symlinks and Desktop packaging to the host resolver.
 * @returns the host's AgentLoop, SessionStore, title service and scope factory.
 */
export async function loadHostAgentModules(): Promise<HostAgentModules> {
  const [loop, scope, session, title] = await Promise.all([
    import('@deepseek-ai/dsh-agent-loop'),
    import('@deepseek-ai/dsh-scope'),
    import('@deepseek-ai/dsh-session'),
    import('@deepseek-ai/dsh-session-title'),
  ])
  return { AgentLoop: loop.AgentLoop, SessionStore: session.SessionStore, SessionTitleService: title.SessionTitleService, createScope: scope.createScope }
}

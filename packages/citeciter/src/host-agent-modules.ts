import type { Context, Plugin } from '@deepseek-ai/cordis'
import type AgentLoop from '@deepseek-ai/dsh-agent-loop'
import type SessionStore from '@deepseek-ai/dsh-session'
import type { Config as JsonlPersistenceConfig } from '@deepseek-ai/dsh-session-persistence-jsonl'
import type SessionTitleService from '@deepseek-ai/dsh-session-title'

interface HostScope { readonly ctx: Context; dispose(): Promise<void> }
/** Required policy of DSH's model-backed title provider; all fields are required by its Loader schema. */
export interface SessionTitleLlmConfig {
  readonly targetWords: number
  readonly targetCjkCharacters: number
  readonly maxInputBytes: number
  readonly maxOutputTokens: number
  readonly timeoutMs: number
}
export interface HostAgentModules {
  readonly AgentLoop: typeof AgentLoop
  readonly SessionStore: typeof SessionStore
  /** DSH's JSONL session persistence, which registers `ctx.sessionPersistence`. */
  readonly SessionPersistence: Plugin<JsonlPersistenceConfig>
  readonly SessionTitleService: typeof SessionTitleService
  /** DSH's own first-prompt model title provider, the one `dsh-base` mounts for host sessions. */
  readonly SessionTitleProvider: Plugin<SessionTitleLlmConfig>
  readonly createScope: (ctx: Context, key: object) => HostScope
}

/**
 * A Cordis plugin exported as a module (`name`, `Config`, `apply`) or as the module's default.
 * DSH 0.2.1-alpha.3 turned the JSONL persistence Service class into a module plugin.
 */
function modulePlugin<T>(module: object): Plugin<T> {
  return ('apply' in module ? module : (module as { readonly default: unknown }).default) as Plugin<T>
}

/**
 * Load the declared SDK peers through DSH's active profile resolver.
 * File URLs bypass peer routing and can create a second private scope identity,
 * particularly when Electron ASAR paths use different casing on Windows.
 * Bare imports also leave CLI symlinks and Desktop packaging to the host resolver.
 * @returns the host's AgentLoop, SessionStore, session persistence, title service and provider, and scope factory.
 */
export async function loadHostAgentModules(): Promise<HostAgentModules> {
  const [loop, scope, session, persistence, title, titleProvider] = await Promise.all([
    import('@deepseek-ai/dsh-agent-loop'),
    import('@deepseek-ai/dsh-scope'),
    import('@deepseek-ai/dsh-session'),
    import('@deepseek-ai/dsh-session-persistence-jsonl'),
    import('@deepseek-ai/dsh-session-title'),
    import('@deepseek-ai/dsh-session-title-first-prompt-llm'),
  ])
  return {
    AgentLoop: loop.AgentLoop,
    SessionStore: session.SessionStore,
    SessionPersistence: modulePlugin<JsonlPersistenceConfig>(persistence),
    SessionTitleService: title.SessionTitleService,
    SessionTitleProvider: modulePlugin<SessionTitleLlmConfig>(titleProvider),
    createScope: scope.createScope,
  }
}

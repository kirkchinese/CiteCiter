import { realpath } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { isAbsolute, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import type AgentLoop from '@deepseek-ai/dsh-agent-loop'
import type SessionStore from '@deepseek-ai/dsh-session'

interface HostScope { readonly ctx: Context; dispose(): Promise<void> }
export interface HostAgentModules {
  readonly AgentLoop: typeof AgentLoop
  readonly SessionStore: typeof SessionStore
  readonly createScope: (ctx: Context, key: object) => HostScope
}

/**
 * Resolve runtime modules from the host installation, not the plugin's dependencies.
 * CLI argv can name an npm/pnpm symlink; canonicalize it before walking node_modules.
 * Desktop retains its app.asar anchor and module identities without filesystem realpath.
 * @returns the host's AgentLoop, SessionStore and scope factory.
 * @throws when the launcher cannot be located or its runtime exports are unavailable.
 */
export async function loadHostAgentModules(): Promise<HostAgentModules> {
  const resources = (process as NodeJS.Process & { resourcesPath?: string }).resourcesPath
  const entry = resources === undefined ? process.argv[1] : join(resources, 'app.asar', 'package.json')
  if (entry === undefined || !isAbsolute(entry)) throw new Error('Citer 无法定位当前 DSH 的运行模块')
  const require = createRequire(resources === undefined ? await realpath(entry) : entry)
  const [loop, scope, session] = await Promise.all([
    import(pathToFileURL(require.resolve('@deepseek-ai/dsh-agent-loop')).href),
    import(pathToFileURL(require.resolve('@deepseek-ai/dsh-scope')).href),
    import(pathToFileURL(require.resolve('@deepseek-ai/dsh-session')).href),
  ])
  if (typeof loop.AgentLoop !== 'function' || typeof scope.createScope !== 'function' || typeof session.SessionStore !== 'function') throw new Error('当前 DSH 未提供 Citer 所需的 Agent 组合接口')
  return { AgentLoop: loop.AgentLoop as typeof AgentLoop, SessionStore: session.SessionStore as typeof SessionStore, createScope: scope.createScope as HostAgentModules['createScope'] }
}

import { access, realpath } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { isAbsolute, join } from 'node:path'
import { pathToFileURL } from 'node:url'
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

/** Resolve the official Desktop's bundled DSH runtime, keeping Electron virtual paths intact. */
async function desktopModuleAnchor(resources: string): Promise<string> {
  for (const name of ['app', 'app.asar']) {
    const manifest = join(resources, name, 'dsh', 'package.json')
    try {
      await access(manifest)
      return manifest
    } catch (error) {
      // An absent packaging variant is expected; access failures must remain visible.
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    }
  }
  throw new Error('Citer 无法定位官方 DSH Desktop 的内置运行模块，请更新官方桌面版')
}

/**
 * Resolve runtime modules from the host installation, not the plugin's dependencies.
 * CLI argv can name an npm/pnpm symlink; canonicalize it before walking node_modules.
 * Official Desktop carries its runtime inside app.asar/dsh (or app/dsh when unpacked).
 * The Electron shell's package.json is not a DSH module-resolution anchor.
 * @returns the host's AgentLoop, SessionStore, title service and scope factory.
 * @throws when the launcher cannot be located or its runtime exports are unavailable.
 */
export async function loadHostAgentModules(): Promise<HostAgentModules> {
  const resources = (process as NodeJS.Process & { resourcesPath?: string }).resourcesPath
  const entry = resources === undefined ? process.argv[1] : await desktopModuleAnchor(resources)
  if (entry === undefined || !isAbsolute(entry)) throw new Error('Citer 无法定位当前 DSH 的运行模块')
  const require = createRequire(resources === undefined ? await realpath(entry) : entry)
  const [loop, scope, session, title] = await Promise.all([
    import(pathToFileURL(require.resolve('@deepseek-ai/dsh-agent-loop')).href),
    import(pathToFileURL(require.resolve('@deepseek-ai/dsh-scope')).href),
    import(pathToFileURL(require.resolve('@deepseek-ai/dsh-session')).href),
    import(pathToFileURL(require.resolve('@deepseek-ai/dsh-session-title')).href),
  ])
  if (typeof loop.AgentLoop !== 'function' || typeof scope.createScope !== 'function' || typeof session.SessionStore !== 'function' || typeof title.SessionTitleService !== 'function') throw new Error('当前 DSH 未提供 Citer 所需的 Agent 组合接口')
  return { AgentLoop: loop.AgentLoop as typeof AgentLoop, SessionStore: session.SessionStore as typeof SessionStore, SessionTitleService: title.SessionTitleService as typeof SessionTitleService, createScope: scope.createScope as HostAgentModules['createScope'] }
}

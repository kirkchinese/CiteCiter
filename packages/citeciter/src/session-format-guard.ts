import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { SESSION_FORMAT_VERSION } from '@deepseek-ai/dsh-session'

export class NewerSessionFormatError extends Error {}

/** Refuse stale writable fallback when a newer host has already produced a successor log. Never migrate logs here. */
export async function assertSessionFormat(directory: string): Promise<void> {
  const files = await readdir(directory).catch(error => { if (error.code === 'ENOENT') return []; throw error })
  for (const name of files) {
    const version = /^session\.v(\d+)\.jsonl(?:\.zstd)?$/u.exec(name)?.[1]
    if (version !== undefined && Number(version) > SESSION_FORMAT_VERSION) {
      throw new NewerSessionFormatError(`此会话已由新版 DSH 保存为 v${version}，当前宿主只支持 v${SESSION_FORMAT_VERSION}。请在新版 Web 中继续；Citer 未改写数据。`)
    }
  }
}

/** Inspect only the exact owned Topic identity beneath the persistence workspace level. */
export async function assertOwnedSessionFormat(root: string, sessionId: string): Promise<void> {
  const workspaces = await readdir(root, { withFileTypes: true }).catch(error => { if (error.code === 'ENOENT') return []; throw error })
  for (const workspace of workspaces) {
    if (workspace.isDirectory() && !workspace.isSymbolicLink()) await assertSessionFormat(resolve(root, workspace.name, sessionId))
  }
}

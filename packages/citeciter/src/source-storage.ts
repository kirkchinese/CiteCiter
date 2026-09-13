import { lstat, mkdir, readFile, realpath, readdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import { SessionId } from '@deepseek-ai/dsh-session'
import { z } from 'zod'

const ownerSchema = z.object({ kind: z.literal('citeciter-source'), version: z.literal(1), sourceSessionId: z.string().min(1) }).strict()
function absent(error: unknown): boolean { return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT' }

/** Locate only source-owned Citer directories through the installed JSONL backend; persisted paths are never trusted. */
export class SourceStorage {
  private readonly pending = new Map<string, Promise<string | undefined>>()
  constructor(private readonly host: Context) {}

  /** @returns a canonical source/citeciter directory, optionally creating its ownership marker. */
  async root(sourceSessionId: string, create = false): Promise<string | undefined> {
    const previous = this.pending.get(sourceSessionId)
    const operation = (previous === undefined ? Promise.resolve() : previous.then(() => undefined, () => undefined)).then(() => this.resolveRoot(sourceSessionId, create))
    this.pending.set(sourceSessionId, operation)
    try { return await operation } finally { if (this.pending.get(sourceSessionId) === operation) this.pending.delete(sourceSessionId) }
  }

  private async resolveRoot(sourceSessionId: string, create: boolean): Promise<string | undefined> {
    const backend = this.host.sessionPersistence as typeof this.host.sessionPersistence & {
      resolveCurrentLog?: (id: SessionId) => Promise<string | undefined>
    }
    if (typeof backend.resolveCurrentLog !== 'function') throw new Error('当前 DSH 存储后端不支持定位来源 Session 目录')
    const file = await backend.resolveCurrentLog(SessionId(sourceSessionId))
    if (file === undefined) {
      if (create) throw new Error('来源 Session 尚未保存，请先在主对话发送消息')
      return undefined
    }
    const directory = resolve(dirname(await realpath(file)), 'citeciter')
    let info = await lstat(directory).catch(error => { if (absent(error)) return undefined; throw error })
    if (info === undefined) {
      if (!create) return undefined
      await mkdir(directory, { mode: 0o700 })
      info = await lstat(directory)
    }
    if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('Citer 拒绝使用链接或非目录的来源存储路径')
    const marker = resolve(directory, 'owner.json')
    const markerInfo = await lstat(marker).catch(error => { if (absent(error)) return undefined; throw error })
    if (markerInfo !== undefined && (!markerInfo.isFile() || markerInfo.isSymbolicLink())) throw new Error('Citer 来源标记必须是普通文件')
    let raw = await readFile(marker, 'utf8').catch(error => { if (absent(error)) return undefined; throw error })
    if (raw === undefined) {
      if (!create) return undefined
      if ((await readdir(directory)).length !== 0) throw new Error('来源 citeciter 目录已有未识别内容，未覆盖')
      raw = JSON.stringify({ kind: 'citeciter-source', version: 1, sourceSessionId }) + '\n'
      await writeFile(marker, raw, { flag: 'wx', mode: 0o600 })
    }
    const owner = ownerSchema.parse(JSON.parse(raw))
    if (owner.sourceSessionId !== sourceSessionId) throw new Error('Citer 来源目录标记与 Session 不匹配')
    return realpath(directory)
  }

  /** Discover owned roots without creating directories or changing Host Session data. */
  async discover(): Promise<ReadonlyMap<string, string>> {
    const roots = new Map<string, string>()
    for (const record of await this.host.sessionPersistence.list()) {
      const root = await this.root(record.header.id)
      if (root !== undefined) roots.set(record.header.id, root)
    }
    return roots
  }
}

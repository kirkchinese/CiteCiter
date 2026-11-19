import { lstat, mkdir, readFile, realpath, readdir, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, resolve } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import { SessionId } from '@deepseek-ai/dsh-session'
import { z } from 'zod'
import { assertSessionFormat } from './session-format-guard.ts'

const ownerSchema = z.object({ kind: z.literal('citeciter-source'), version: z.literal(1), sourceSessionId: z.string().min(1) }).strict()
function absent(error: unknown): boolean { return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT' }
/** A path that is missing or runs through a file: nothing Citer owns is there. */
function missing(error: unknown): boolean { return absent(error) || (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOTDIR') }
const SESSION_LOG = /^session(?:\.v\d+)?\.jsonl(?:\.zstd)?$/u
/** Directory reads in flight during discovery: enough to hide latency, few enough to leave the disk to DSH. */
const DISCOVERY_CONCURRENCY = 16

/** Run `work` over `items` with at most `limit` in flight; results keep the input order. */
async function mapLimited<Item, Result>(items: readonly Item[], limit: number, work: (item: Item) => Promise<Result>, signal?: AbortSignal): Promise<Result[]> {
  const results = new Array<Result>(items.length)
  let next = 0
  const lane = async () => {
    while (next < items.length) {
      signal?.throwIfAborted()
      const index = next++
      results[index] = await work(items[index]!)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, lane))
  return results
}

/** Locate only source-owned Citer directories through the installed JSONL backend; persisted paths are never trusted. */
export class SourceStorage {
  private readonly pending = new Map<string, Promise<string | undefined>>()
  /** Historical source containers by Session id; `null` marks an id found in more than one project. */
  private historicalDirectories: Promise<ReadonlyMap<string, string | null>> | undefined
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
      config?: { root?: unknown }
    }
    if (typeof backend.resolveCurrentLog !== 'function') throw new Error('当前 DSH 存储后端不支持定位来源 Session 目录')
    const file = await backend.resolveCurrentLog(SessionId(sourceSessionId))
    // Alpha reads older generations without publishing a successor until write
    // access. An existing Citer directory must stay discoverable in that state.
    const sourceDirectory = file === undefined
      ? (await (this.historicalDirectories ??= this.findHistoricalDirectories(backend.config?.root))).get(sourceSessionId)
      : dirname(await realpath(file))
    if (sourceDirectory === null) throw new Error('多个来源目录使用相同的 Session 标识，Citer 未选择其中任何一个')
    if (sourceDirectory === undefined) {
      if (create) throw new Error('来源 Session 尚未保存，请先在主对话发送消息')
      return undefined
    }
    await assertSessionFormat(sourceDirectory)
    const directory = resolve(sourceDirectory, 'citeciter')
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

  /** Locate historical source containers only; DSH alone reads and migrates their logs. */
  private async findHistoricalDirectories(root: unknown): Promise<ReadonlyMap<string, string | null>> {
    if (typeof root !== 'string' || !isAbsolute(root)) throw new Error('当前 DSH 未提供可定位的 JSONL 存储根目录')
    const result = new Map<string, string | null>()
    for (const { project, sessions } of await this.sessionDirectories(root)) {
      for (const name of sessions) {
        const directory = resolve(project, name)
        const logs = await readdir(directory, { withFileTypes: true }).catch((error: unknown) => {
          if (missing(error)) return []
          throw error
        })
        if (!logs.some(file => file.isFile() && SESSION_LOG.test(file.name))) continue
        // DSH refuses an id stored in two projects; so does Citer, for that id only.
        result.set(name, result.has(name) ? null : directory)
      }
    }
    return result
  }

  /**
   * Every project directory under the JSONL root with its Session directory names. Links and files are skipped,
   * and a project that cannot be listed is skipped with a warning instead of failing the whole scan.
   */
  private async sessionDirectories(root: string, signal?: AbortSignal): Promise<Array<{ readonly project: string, readonly sessions: readonly string[] }>> {
    const projects = await readdir(root, { withFileTypes: true }).catch((error: unknown) => {
      if (missing(error)) return []
      throw error
    })
    const listed = await mapLimited(projects.filter(entry => entry.isDirectory() && !entry.isSymbolicLink()), DISCOVERY_CONCURRENCY, async (entry) => {
      const project = resolve(root, entry.name)
      try {
        const sessions = (await readdir(project, { withFileTypes: true })).filter(session => session.isDirectory() && !session.isSymbolicLink()).map(session => session.name)
        return { project, sessions }
      } catch (error) {
        if (!missing(error)) this.host.logger.warn(`Citer skipped unreadable session directory ${project}`, error)
        return { project, sessions: [] }
      }
    }, signal)
    return listed
  }

  /**
   * Discover owned roots without creating directories or changing Host Session data.
   *
   * Startup cost must not grow with Sessions × projects. Resolving each listed Session through the backend scans
   * every project directory per Session: with 7,000 Sessions in 1,263 projects that took about 42 minutes and held
   * DSH at "Loading plugins". Instead the JSONL root is listed once, one `citeciter/owner.json` probe per Session
   * directory; only the few marked sources are then checked, and a source that cannot be checked is skipped with
   * a warning rather than failing discovery.
   * @param signal - aborts the scan when Citer shuts down.
   */
  async discover(signal?: AbortSignal): Promise<ReadonlyMap<string, string>> {
    const backend = this.host.sessionPersistence as typeof this.host.sessionPersistence & { config?: { root?: unknown } }
    const root = backend.config?.root
    if (typeof root !== 'string' || !isAbsolute(root)) return this.discoverThroughBackend(signal)
    const candidates = new Map<string, string | null>()
    const projects = await this.sessionDirectories(root, signal)
    await mapLimited(projects.flatMap(({ project, sessions }) => sessions.map(name => ({ name, directory: resolve(project, name) }))), DISCOVERY_CONCURRENCY, async ({ name, directory }) => {
      const marker = await lstat(resolve(directory, 'citeciter', 'owner.json')).catch((error: unknown) => {
        if (missing(error)) return undefined
        this.host.logger.warn(`Citer skipped unreadable source directory ${directory}`, error)
        return undefined
      })
      if (marker === undefined) return
      candidates.set(name, candidates.has(name) ? null : directory)
    }, signal)
    const roots = new Map<string, string>()
    for (const [name, directory] of candidates) {
      signal?.throwIfAborted()
      if (directory === null) {
        this.host.logger.warn(`Citer 未加载 ${name}：多个来源目录使用相同的 Session 标识`)
        continue
      }
      try {
        const owner = ownerSchema.parse(JSON.parse(await readFile(resolve(directory, 'citeciter', 'owner.json'), 'utf8')))
        // An id that its directory name does not spell exactly is left to the backend's own lookup.
        const owned = owner.sourceSessionId === name
          ? await this.checkedRoot(directory, name)
          : await this.root(owner.sourceSessionId)
        if (owned !== undefined) roots.set(owner.sourceSessionId, owned)
      } catch (error) {
        signal?.throwIfAborted()
        this.host.logger.warn(`Citer 未加载 ${name}：${error instanceof Error ? error.message : String(error)}`)
      }
    }
    return roots
  }

  /** A source directory found by the scan, held to the checks `root()` applies: a real Session container. */
  private async checkedRoot(sourceDirectory: string, sourceSessionId: string): Promise<string | undefined> {
    const logs = await readdir(sourceDirectory, { withFileTypes: true })
    if (!logs.some(file => file.isFile() && SESSION_LOG.test(file.name))) return undefined
    await assertSessionFormat(sourceDirectory)
    const directory = resolve(sourceDirectory, 'citeciter')
    const info = await lstat(directory)
    if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('Citer 拒绝使用链接或非目录的来源存储路径')
    const marker = await lstat(resolve(directory, 'owner.json'))
    if (!marker.isFile() || marker.isSymbolicLink()) throw new Error('Citer 来源标记必须是普通文件')
    const owner = ownerSchema.parse(JSON.parse(await readFile(resolve(directory, 'owner.json'), 'utf8')))
    if (owner.sourceSessionId !== sourceSessionId) throw new Error('Citer 来源目录标记与 Session 不匹配')
    return realpath(directory)
  }

  /** Discovery for a backend without a configured root directory: one backend lookup per listed Session. */
  private async discoverThroughBackend(signal?: AbortSignal): Promise<ReadonlyMap<string, string>> {
    const roots = new Map<string, string>()
    for (const record of await this.host.sessionPersistence.list()) {
      signal?.throwIfAborted()
      try {
        const root = await this.root(record.header.id)
        if (root !== undefined) roots.set(record.header.id, root)
      } catch (error) {
        signal?.throwIfAborted()
        this.host.logger.warn(`Citer 未加载 ${record.header.id}：${error instanceof Error ? error.message : String(error)}`)
      }
    }
    return roots
  }
}

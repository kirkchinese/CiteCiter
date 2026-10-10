/** Durable Topic navigation metadata in each source-owned Citer root, independent of Agent execution. */
import { randomUUID } from 'node:crypto'
import { lstat, mkdir, realpath, readFile, readdir, rmdir, unlink, writeFile } from 'node:fs/promises'
import { basename, dirname, isAbsolute, relative, resolve } from 'node:path'
import { dshHomePath } from '@deepseek-ai/dsh-home-paths'
import { type SessionHeader } from '@deepseek-ai/dsh-session'
import { z } from 'zod'
import { topicMetadataSchema, parseTopicMetadataFile, type TopicMetadata } from './topic.ts'
import { atomicReplace } from './atomic-replace.ts'
import { TopicDeletionReceipts, type TopicDeletionReceipt } from './topic-deletion-receipts.ts'

/** Index root used before 0.8, when Topic metadata lived outside the source Session directory. */
const LEGACY_INDEX_ROOT = dshHomePath('citeciter', 'workspaces')

function errorCode(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code)
    : undefined
}

export async function unlinkIfPresent(path: string): Promise<void> {
  try {
    await unlink(path)
  } catch (error) {
    if (errorCode(error) !== 'ENOENT') throw error
  }
}

export async function rmdirIfEmpty(path: string): Promise<void> {
  try {
    await rmdir(path)
  } catch (error) {
    if (errorCode(error) !== 'ENOENT' && errorCode(error) !== 'ENOTEMPTY') throw error
  }
}

function assertContained(root: string, target: string): void {
  const path = relative(resolve(root), resolve(target))
  if (path === '' || path.startsWith('..') || isAbsolute(path)) {
    throw new Error('CiteCiter refused a path outside its private storage root')
  }
}

/** Require an existing target's real parent to remain below the configured private root. */
async function assertCanonicalParent(root: string, target: string): Promise<void> {
  assertContained(root, target)
  const [canonicalRoot, canonicalParent] = await Promise.all([realpath(root), realpath(dirname(target))])
  assertContained(canonicalRoot, resolve(canonicalParent, basename(target)))
}

/** Remove one owned file or final link without following links in its parent path. */
async function unlinkOwnedFileIfPresent(root: string, target: string): Promise<void> {
  const info = await lstat(target).catch((error: unknown) => {
    if (errorCode(error) === 'ENOENT') return undefined
    throw error
  })
  if (info === undefined) return
  await assertCanonicalParent(root, target)
  if (!info.isFile() && !info.isSymbolicLink()) {
    throw new Error(`CiteCiter refused to unlink a non-file storage artifact: ${target}`)
  }
  await unlink(target)
}

/** Remove one empty owned directory after proving it is a real directory below root. */
async function rmdirOwnedIfEmpty(root: string, target: string): Promise<void> {
  const info = await lstat(target).catch((error: unknown) => {
    if (errorCode(error) === 'ENOENT') return undefined
    throw error
  })
  if (info === undefined) return
  if (info.isSymbolicLink() || !info.isDirectory()) {
    throw new Error(`CiteCiter refused to remove a link-shaped or non-directory storage path: ${target}`)
  }
  const [canonicalRoot, canonicalTarget] = await Promise.all([realpath(root), realpath(target)])
  assertContained(canonicalRoot, canonicalTarget)
  await rmdirIfEmpty(target)
}

async function atomicWriteJson(path: string, value: unknown): Promise<void> {
  const temp = `${path}.${randomUUID()}.tmp`
  try {
    await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o600 })
    await atomicReplace(temp, path)
  } catch (error) {
    await unlinkIfPresent(temp)
    throw error
  }
}

async function readdirIfPresent(path: string) {
  return readdir(path, { withFileTypes: true }).catch((error: unknown) => {
    if (errorCode(error) === 'ENOENT') return []
    throw error
  })
}

const topicDeletionMarkerSchema = z.object({
  schemaVersion: z.literal(1),
  storage: z.literal('source').optional(),
  sessionId: z.string().min(1),
  sourceSessionId: z.string().min(1),
  topicId: z.number().int().positive(),
  sessionHeader: z.object({
    version: z.number().int().nonnegative(),
    id: z.string().min(1),
    createdAt: z.number().int().nonnegative(),
    isSeeded: z.boolean().default(false),
    cwd: z.string().optional(),
  }).strict(),
}).strict()

/** Committed intent to delete one Topic; recovery finishes the cleanup after a restart. */
export type TopicDeletionMarker = Omit<z.infer<typeof topicDeletionMarkerSchema>, 'sessionHeader'> & {
  readonly sessionHeader: SessionHeader
}

function parseTopicDeletionMarker(raw: unknown): TopicDeletionMarker {
  const marker = topicDeletionMarkerSchema.parse(raw) as TopicDeletionMarker
  if (marker.sessionHeader.id !== marker.sessionId) throw new Error('Citer 删除标记与 Session 身份不匹配')
  return marker
}

/** Minimal on-disk navigation index; Session history stays in standard DSH JSONL. */
export class TopicIndex {
  private readonly sourceRoots = new Map<string, string>()
  private readonly deletionReceipts = new TopicDeletionReceipts(atomicWriteJson)

  /** @param legacyRoot - pre-0.8 index root, read only to migrate old Topics. */
  constructor(private readonly legacyRoot: string = LEGACY_INDEX_ROOT) {}

  /** Bind a canonical source-owned root resolved by SourceStorage. */
  bindSource(sourceSessionId: string, root: string): void { this.sourceRoots.set(sourceSessionId, root) }

  /** Return the owned metadata directory for one Topic. */
  ownedDirectory(sourceSessionId: string, topicId: number): string {
    const root = this.sourceRoot(sourceSessionId)
    const directory = resolve(root, String(topicId))
    assertContained(root, directory)
    return directory
  }

  /** Read navigation records across bound sources; never opens or mutates a Session log. */
  async all(): Promise<TopicMetadata[]> {
    const records: TopicMetadata[] = []
    for (const [sourceSessionId, root] of this.sourceRoots) {
      for (const item of await readdir(root, { withFileTypes: true })) {
        if (!item.isDirectory() || item.isSymbolicLink() || !/^\d+$/.test(item.name)) continue
        const path = resolve(root, item.name)
        if (await this.deletionMarkerIfPresent(path) !== undefined) continue
        const record = await this.readIfPresent(resolve(path, 'topic.json'))
        if (record !== undefined && record.sourceSessionId === sourceSessionId && record.storage === 'source') records.push(record)
      }
    }
    return records
  }

  /** Read records still stored in the pre-0.8 index root, for migration only. */
  async legacyRecords(): Promise<TopicMetadata[]> {
    const records: TopicMetadata[] = []
    for (const source of await readdirIfPresent(this.legacyRoot)) {
      if (!source.isDirectory() || source.isSymbolicLink()) continue
      const directory = resolve(this.legacyRoot, source.name)
      for (const item of await readdir(directory, { withFileTypes: true })) {
        if (!item.isDirectory() || item.isSymbolicLink() || !/^\d+$/.test(item.name)) continue
        const path = resolve(directory, item.name)
        if (await this.deletionMarkerIfPresent(path) !== undefined) continue
        const record = await this.readIfPresent(resolve(path, 'topic.json'))
        if (record !== undefined && record.storage !== 'source') records.push(record)
      }
    }
    return records
  }

  /** Reserve the next unused numeric Topic directory below a bound source root. */
  async reserve(sourceSessionId: string): Promise<{ topicId: number, directory: string }> {
    const root = this.sourceRoot(sourceSessionId)
    let topicId = Math.max(0, ...(await readdir(root)).map(name => /^\d+$/.test(name) ? Number(name) : 0)) + 1
    while (true) {
      const directory = resolve(root, String(topicId))
      assertContained(root, directory)
      try {
        await mkdir(directory, { mode: 0o700 })
        return { topicId, directory }
      } catch (error) {
        if (errorCode(error) !== 'EEXIST') throw error
        topicId++
      }
    }
  }

  async save(metadata: TopicMetadata): Promise<void> {
    const validated = topicMetadataSchema.parse(metadata) as TopicMetadata
    if (validated.storage !== 'source') throw new Error('Citer 只写入来源目录中的 Topic')
    const directory = this.ownedDirectory(validated.sourceSessionId, validated.topicId)
    await mkdir(directory, { recursive: true, mode: 0o700 })
    if ((await lstat(directory)).isSymbolicLink()) throw new Error('Citer 拒绝写入链接形式的 Topic 目录')
    await assertCanonicalParent(this.sourceRoot(validated.sourceSessionId), resolve(directory, 'topic.json'))
    await atomicWriteJson(resolve(directory, 'topic.json'), validated)
  }

  /** Read the metadata currently stored in one owned Topic directory, if any. */
  async readOwned(sourceSessionId: string, topicId: number): Promise<TopicMetadata | undefined> {
    return this.readIfPresent(resolve(this.ownedDirectory(sourceSessionId, topicId), 'topic.json'))
  }

  async loadBySessionId(sessionId: string): Promise<TopicMetadata> {
    const metadata = await this.findBySessionId(sessionId)
    if (metadata !== undefined) return metadata
    throw new Error(`CiteCiter Topic "${sessionId}" does not exist`)
  }

  /** Return owned metadata when present; malformed or unreadable storage still throws. */
  async findBySessionId(sessionId: string): Promise<TopicMetadata | undefined> {
    return (await this.all()).find(item => item.sessionId === sessionId)
  }

  /**
   * Find authoritative committed deletion evidence without inferring it from missing metadata.
   * @param sessionId - exact generated Citer Session identity.
   * @returns a verified pending marker or completed receipt, including after Host restart;
   * old deletions whose markers were already removed have no recoverable evidence.
   */
  async findDeleted(sessionId: string): Promise<TopicDeletionReceipt | undefined> {
    let result: TopicDeletionReceipt | undefined
    const accept = (receipt: TopicDeletionReceipt) => {
      if (result !== undefined && (result.sourceSessionId !== receipt.sourceSessionId || result.topicId !== receipt.topicId)) {
        throw new Error('Citer 删除记录包含冲突的 Topic 身份')
      }
      // An existing recovery marker still owns cleanup, even if its final receipt
      // was committed just before a crash interrupted marker removal.
      if (result === undefined || receipt.cleanup === 'pending') result = receipt
    }
    for (const marker of await this.listDeleting()) if (marker.sessionId === sessionId) {
      accept({ version: 1, sessionId, sourceSessionId: marker.sourceSessionId, topicId: marker.topicId, cleanup: 'pending' })
    }
    for (const [sourceSessionId, root] of this.sourceRoots) {
      const receipt = await this.deletionReceipts.read(root, sourceSessionId, sessionId)
      if (receipt !== undefined) accept(receipt)
    }
    return result
  }

  async list(sourceSessionId: string): Promise<TopicMetadata[]> {
    return (await this.all()).filter(item => item.sourceSessionId === sourceSessionId).sort((a, b) => a.topicId - b.topicId)
  }

  /** Commit a minimal deletion marker before making Topic metadata unreachable. */
  async markDeleting(metadata: TopicMetadata, sessionHeader: SessionHeader): Promise<TopicDeletionMarker> {
    const marker: TopicDeletionMarker = {
      schemaVersion: 1,
      storage: 'source',
      sessionId: metadata.sessionId,
      sourceSessionId: metadata.sourceSessionId,
      topicId: metadata.topicId,
      sessionHeader: {
        version: sessionHeader.version,
        id: sessionHeader.id,
        createdAt: sessionHeader.createdAt,
        isSeeded: sessionHeader.isSeeded,
        ...(sessionHeader.cwd === undefined ? {} : { cwd: sessionHeader.cwd }),
      },
    }
    const markerPath = resolve(this.ownedDirectory(metadata.sourceSessionId, metadata.topicId), 'deleting.json')
    await assertCanonicalParent(this.sourceRoot(metadata.sourceSessionId), markerPath)
    await atomicWriteJson(markerPath, marker)
    return marker
  }

  /** Discover committed deletion markers without following linked directories. */
  async listDeleting(): Promise<TopicDeletionMarker[]> {
    const markers: TopicDeletionMarker[] = []
    for (const [source, root] of this.sourceRoots) {
      for (const topic of await readdirIfPresent(root)) {
        if (!topic.isDirectory() || topic.isSymbolicLink() || !/^\d+$/.test(topic.name)) continue
        const marker = await this.deletionMarkerIfPresent(resolve(root, topic.name))
        if (marker !== undefined && marker.topicId === Number(topic.name) && marker.storage === 'source' && marker.sourceSessionId === source) markers.push(marker)
      }
    }
    return markers
  }

  /** Commit the deletion identity, then remove the marker and empty Topic directory after artifact cleanup. */
  async finishDeleting(marker: TopicDeletionMarker): Promise<void> {
    const root = this.sourceRoot(marker.sourceSessionId)
    const directory = this.ownedDirectory(marker.sourceSessionId, marker.topicId)
    await unlinkOwnedFileIfPresent(root, resolve(directory, 'topic.json'))
    // Preserve only the deletion identity outside the numeric Topic directory.
    // Publication precedes marker removal, so restart cannot lose both forms.
    await this.deletionReceipts.complete(root, {
      version: 1, sourceSessionId: marker.sourceSessionId, topicId: marker.topicId,
      sessionId: marker.sessionId, cleanup: 'complete',
    })
    await unlinkOwnedFileIfPresent(root, resolve(directory, 'deleting.json'))
    await rmdirOwnedIfEmpty(root, directory)
  }

  /** Forget a migrated pre-0.8 index entry after its owned copy was committed; original logs remain intact. */
  async forgetLegacy(metadata: Pick<TopicMetadata, 'sessionId' | 'sourceSessionId' | 'topicId'>): Promise<void> {
    const directory = resolve(this.legacyRoot, Buffer.from(metadata.sourceSessionId, 'utf8').toString('base64url'), String(metadata.topicId))
    assertContained(this.legacyRoot, directory)
    const previous = await this.readIfPresent(resolve(directory, 'topic.json'))
    if (previous === undefined) return
    if (previous.sessionId !== metadata.sessionId || previous.sourceSessionId !== metadata.sourceSessionId) throw new Error('Citer 旧索引与迁移身份不匹配，未删除')
    await unlinkOwnedFileIfPresent(this.legacyRoot, resolve(directory, 'topic.json'))
    await rmdirOwnedIfEmpty(this.legacyRoot, directory)
  }

  private sourceRoot(sourceSessionId: string): string {
    const root = this.sourceRoots.get(sourceSessionId)
    if (root === undefined) throw new Error('Citer 来源目录不可用')
    return root
  }

  private async readIfPresent(path: string): Promise<TopicMetadata | undefined> {
    try {
      return parseTopicMetadataFile(JSON.parse(await readFile(path, 'utf8')))
    } catch (error) {
      if (errorCode(error) === 'ENOENT') return undefined
      throw error
    }
  }

  private async deletionMarkerIfPresent(directory: string): Promise<TopicDeletionMarker | undefined> {
    try {
      const path = resolve(directory, 'deleting.json')
      const info = await lstat(path)
      if (!info.isFile() || info.isSymbolicLink()) throw new Error('Citer 删除标记必须是普通文件')
      return parseTopicDeletionMarker(JSON.parse(await readFile(path, 'utf8')))
    } catch (error) {
      if (errorCode(error) === 'ENOENT') return undefined
      throw error
    }
  }
}

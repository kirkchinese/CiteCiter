/** Durable navigation metadata and bounded legacy artifact cleanup, independent of Agent execution. */
import { randomUUID } from 'node:crypto'
import { lstat, mkdir, realpath, readFile, readdir, rmdir, unlink, writeFile } from 'node:fs/promises'
import { basename, dirname, isAbsolute, relative, resolve } from 'node:path'
import { dshHomePath } from '@deepseek-ai/dsh-home-paths'
import { type SessionHeader } from '@deepseek-ai/dsh-session'
import { z } from 'zod'
import { topicMetadataSchema, parseTopicMetadataFile, type TopicMetadata } from './topic.ts'
import { atomicReplace } from './atomic-replace.ts'
import { TopicDeletionReceipts, type TopicDeletionReceipt } from './topic-deletion-receipts.ts'
const TOPIC_INDEX_ROOT = dshHomePath('citeciter', 'workspaces')

export function errorCode(error: unknown): string | undefined {
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

function sourceDirectoryName(sourceSessionId: string): string {
  return Buffer.from(sourceSessionId, 'utf8').toString('base64url')
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

/**
 * Remove one artifact from a caller-owned JSONL root without following links.
 * @param root - fixed private JSONL root owned by the caller.
 * @param artifact - location returned by that exact JSONL backend.
 * @returns when the file/link and its empty per-session directory are absent.
 */
export async function removeOwnedJsonlArtifact(
  root: string,
  artifact: { readonly kind: string, readonly path: string } | undefined,
): Promise<void> {
  if (artifact === undefined || artifact.kind !== 'jsonl') {
    throw new Error('CiteCiter permanent deletion requires its private JSONL artifact backend')
  }
  await unlinkOwnedFileIfPresent(root, artifact.path)
  await rmdirOwnedIfEmpty(root, dirname(artifact.path))
}

/**
 * Delete all JSONL generations of an already retired private Topic.
 * The Host does not own Citer's nested logs. This bounded disk adapter follows
 * its project/Session directory layout and canonical generation filenames.
 * @param root - exclusively owned CiteCiter Session root, never a host Session root.
 * @param sessionId - generated CiteCiter identity; arbitrary path segments are refused.
 * @returns after every canonical generation and the retired lock file are absent.
 */
export async function removeOwnedTopicGenerations(root: string, sessionId: string): Promise<void> {
  if (!/^citeciter-[a-zA-Z0-9-]+$/u.test(sessionId)) throw new Error('Invalid private Topic identity for deletion')
  const projects = await readdir(root, { withFileTypes: true }).catch((error: unknown) => {
    if (errorCode(error) === 'ENOENT') return []
    throw error
  })
  for (const project of projects) {
    if (!project.isDirectory() || project.isSymbolicLink()) continue
    const directory = resolve(root, project.name, sessionId)
    const info = await lstat(directory).catch((error: unknown) => {
      if (errorCode(error) === 'ENOENT') return undefined
      throw error
    })
    if (info === undefined) continue
    if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('Refused linked Topic directory')
    assertContained(await realpath(root), await realpath(directory))
    for (const name of await readdir(directory)) {
      if (/^session(?:\.v[1-9]\d*)?\.jsonl(?:\.zstd)?$/u.test(name) || name === 'session.lock') {
        await unlinkOwnedFileIfPresent(root, resolve(directory, name))
      }
    }
    await rmdirOwnedIfEmpty(root, directory)
  }
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

  /** Bind a canonical source-owned root resolved by SourceStorage. */
  bindSource(sourceSessionId: string, root: string): void { this.sourceRoots.set(sourceSessionId, root) }

  /** Return the owned metadata directory for one source-backed Topic. */
  ownedDirectory(sourceSessionId: string, topicId: number): string {
    const root = this.sourceRoots.get(sourceSessionId)
    if (root === undefined) throw new Error('Citer 来源目录不可用')
    const directory = resolve(root, String(topicId))
    assertContained(root, directory)
    return directory
  }

  /** @param root - private Topic index root. */
  constructor(private readonly root: string = TOPIC_INDEX_ROOT) {}

  /** Read navigation records across sources; never opens or mutates a Session log. */
  async all(includeSuperseded = false): Promise<TopicMetadata[]> {
    const sources = await readdir(this.root, { withFileTypes: true }).catch((error: unknown) => {
      if (errorCode(error) === 'ENOENT') return []
      throw error
    })
    const records: TopicMetadata[] = []
    for (const source of sources) {
      if (!source.isDirectory() || source.isSymbolicLink()) continue
      const directory = resolve(this.root, source.name)
      for (const item of await readdir(directory, { withFileTypes: true })) {
        if (!item.isDirectory() || item.isSymbolicLink() || !/^\d+$/.test(item.name)) continue
        const path = resolve(directory, item.name)
        if (await this.deletionMarkerIfPresent(path) !== undefined) continue
        const record = await this.readIfPresent(resolve(path, 'topic.json'))
        if (record !== undefined) records.push(record)
      }
    }
    for (const [sourceSessionId, directory] of this.sourceRoots) {
      for (const item of await readdir(directory, { withFileTypes: true })) {
        if (!item.isDirectory() || item.isSymbolicLink() || !/^\d+$/.test(item.name)) continue
        const path = resolve(directory, item.name)
        if (await this.deletionMarkerIfPresent(path) !== undefined) continue
        const record = await this.readIfPresent(resolve(path, 'topic.json'))
        if (record !== undefined && record.sourceSessionId === sourceSessionId && record.storage === 'source') records.push(record)
      }
    }
    if (includeSuperseded) return records
    const unique = new Map<string, TopicMetadata>()
    for (const record of records) if (!unique.has(record.sessionId) || record.storage === 'source') unique.set(record.sessionId, record)
    return [...unique.values()]
  }

  async reserve(sourceSessionId: string): Promise<{ topicId: number, directory: string }> {
    const sourceDirectory = this.sourceRoots.get(sourceSessionId) ?? resolve(this.root, sourceDirectoryName(sourceSessionId))
    await mkdir(sourceDirectory, { recursive: true, mode: 0o700 })
    let topicId = Math.max(0, ...(await this.list(sourceSessionId)).map(item => item.topicId)) + 1
    try {
      const names = await readdir(sourceDirectory)
      topicId = Math.max(topicId - 1, ...names.map((name) => /^\d+$/.test(name) ? Number(name) : 0)) + 1
    } catch (error) {
      if (errorCode(error) !== 'ENOENT') throw error
    }
    while (true) {
      const directory = resolve(sourceDirectory, String(topicId))
      assertContained(sourceDirectory, directory)
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
    const directory = this.directory(validated.sourceSessionId, validated.topicId, validated.storage === 'source')
    await mkdir(directory, { recursive: true, mode: 0o700 })
    if ((await lstat(directory)).isSymbolicLink()) throw new Error('Citer 拒绝写入链接形式的 Topic 目录')
    await assertCanonicalParent(validated.storage === 'source' ? this.sourceRoots.get(validated.sourceSessionId)! : this.root, resolve(directory, 'topic.json'))
    await atomicWriteJson(resolve(directory, 'topic.json'), validated)
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
    const sources = await readdir(this.root, { withFileTypes: true }).catch(error => {
      if (errorCode(error) === 'ENOENT') return []
      throw error
    })
    const candidates = [...this.sourceRoots].map(([sourceSessionId, root]) => ({ sourceSessionId, root }))
    for (const source of sources) {
      if (!source.isDirectory() || source.isSymbolicLink()) continue
      const sourceSessionId = Buffer.from(source.name, 'base64url').toString('utf8')
      if (sourceSessionId === '' || sourceDirectoryName(sourceSessionId) !== source.name) continue
      candidates.push({ sourceSessionId, root: resolve(this.root, source.name) })
    }
    for (const { sourceSessionId, root } of candidates) {
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
    const directory = this.directory(metadata.sourceSessionId, metadata.topicId, metadata.storage === 'source')
    const marker: TopicDeletionMarker = {
      schemaVersion: 1,
      ...(metadata.storage === 'source' ? { storage: 'source' } : {}),
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
    const markerPath = resolve(directory, 'deleting.json')
    await assertCanonicalParent(metadata.storage === 'source' ? this.sourceRoots.get(metadata.sourceSessionId)! : this.root, markerPath)
    await atomicWriteJson(markerPath, marker)
    return marker
  }

  /** Discover committed deletion markers without following linked directories. */
  async listDeleting(): Promise<TopicDeletionMarker[]> {
    const sources = await readdir(this.root, { withFileTypes: true }).catch(error => {
      if (errorCode(error) === 'ENOENT') return []
      throw error
    })
    const markers: TopicDeletionMarker[] = []
    const directories = sources.filter(source => source.isDirectory() && !source.isSymbolicLink()).map(source => ({ path: resolve(this.root, source.name), source: undefined as string | undefined }))
    directories.push(...[...this.sourceRoots].map(([source, path]) => ({ source, path })))
    for (const { path: sourceDirectory, source } of directories) {
      const topics = await readdir(sourceDirectory, { withFileTypes: true }).catch((error: unknown) => {
        if (errorCode(error) === 'ENOENT') return []
        throw error
      })
      for (const topic of topics) {
        if (!topic.isDirectory() || topic.isSymbolicLink() || !/^\d+$/.test(topic.name)) continue
        const marker = await this.deletionMarkerIfPresent(resolve(sourceDirectory, topic.name))
        if (marker !== undefined && marker.topicId === Number(topic.name) && (source === undefined
          ? marker.storage === undefined && sourceDirectoryName(marker.sourceSessionId) === basename(sourceDirectory)
          : marker.storage === 'source' && marker.sourceSessionId === source)) markers.push(marker)
      }
    }
    return markers
  }

  /** Commit the deletion identity, then remove the marker and empty Topic directory after artifact cleanup. */
  async finishDeleting(marker: TopicDeletionMarker): Promise<void> {
    const owned = marker.storage === 'source'
    const directory = this.directory(marker.sourceSessionId, marker.topicId, owned)
    const root = owned ? this.sourceRoots.get(marker.sourceSessionId)! : this.root
    await unlinkOwnedFileIfPresent(root, resolve(directory, 'topic.json'))
    // Preserve only the deletion identity outside the numeric Topic directory.
    // Publication precedes marker removal, so restart cannot lose both forms.
    const sourceRoot = this.sourceRoots.get(marker.sourceSessionId)
    if (owned && sourceRoot === undefined) throw new Error('Citer 来源目录不可用，未移除删除恢复标记')
    const receiptRoot = sourceRoot ?? resolve(this.root, sourceDirectoryName(marker.sourceSessionId))
    await this.deletionReceipts.complete(receiptRoot, {
      version: 1, sourceSessionId: marker.sourceSessionId, topicId: marker.topicId,
      sessionId: marker.sessionId, cleanup: 'complete',
    })
    await unlinkOwnedFileIfPresent(root, resolve(directory, 'deleting.json'))
    await rmdirOwnedIfEmpty(root, directory)
  }

  /** Forget only a superseded plugin index after an owned copy was committed; original logs remain intact. */
  async forgetLegacy(metadata: Pick<TopicMetadata, 'sessionId' | 'sourceSessionId' | 'topicId'>): Promise<void> {
    const directory = this.directory(metadata.sourceSessionId, metadata.topicId)
    const previous = await this.readIfPresent(resolve(directory, 'topic.json'))
    if (previous === undefined) return
    if (previous.sessionId !== metadata.sessionId || previous.sourceSessionId !== metadata.sourceSessionId) throw new Error('Citer 旧索引与迁移身份不匹配，未删除')
    await unlinkOwnedFileIfPresent(this.root, resolve(directory, 'topic.json'))
    await rmdirOwnedIfEmpty(this.root, directory)
  }

  private directory(sourceSessionId: string, topicId: number, owned = false): string {
    if (owned) return this.ownedDirectory(sourceSessionId, topicId)
    const directory = resolve(this.root, sourceDirectoryName(sourceSessionId), String(topicId))
    assertContained(this.root, directory)
    return directory
  }

  private async read(path: string): Promise<TopicMetadata> {
    return parseTopicMetadataFile(JSON.parse(await readFile(path, 'utf8')))
  }

  private async readIfPresent(path: string): Promise<TopicMetadata | undefined> {
    try {
      return await this.read(path)
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

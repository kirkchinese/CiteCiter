/** One-shot migration of Topics created before 0.8 into their source-owned Citer directories. */
import { Context } from '@deepseek-ai/cordis'
import { dshHomePath } from '@deepseek-ai/dsh-home-paths'
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session'
import JsonlSessionPersistence from '@deepseek-ai/dsh-session-persistence-jsonl'
import type { HostSessionAdapter } from './host-session-adapter.ts'
import { copySessionHistory } from './session-migration.ts'
import type { SourceStorage } from './source-storage.ts'
import type { TopicMetadata } from './topic.ts'
import type { TopicIndex } from './topic-index.ts'

/** Private JSONL root of Topics created before 0.8. Original logs there are never removed. */
const LEGACY_SESSION_ROOT = dshHomePath('citeciter', 'sessions')

interface LegacyPersistence {
  readonly persistence: Context['sessionPersistence']
  dispose(): Promise<void>
}

/** Open the old private log root read-only for copying; it is never written. */
async function openLegacyPersistence(): Promise<LegacyPersistence> {
  const ctx = new Context()
  const fibers = [await ctx.plugin(SessionStore)]
  try {
    fibers.push(await ctx.plugin(JsonlSessionPersistence, { root: LEGACY_SESSION_ROOT, compression: 'none' }))
  } catch (error) {
    await fibers[0]!.dispose()
    throw error
  }
  return {
    persistence: ctx.sessionPersistence,
    dispose: async () => { for (const fiber of fibers.reverse()) await fiber.dispose() },
  }
}

/**
 * Copy each pre-0.8 Topic whose source Session is available into the source-owned layout.
 * The copy is verified event by event before the old index entry is forgotten, and the
 * original log stays in place. Topics whose source is unavailable are left untouched and
 * retried on the next start.
 * @param host - plugin context; its persistence holds Topics created by 0.7 development builds.
 * @param index - Topic index with every discoverable source root already bound.
 * @param sources - resolver for source-owned Citer roots.
 * @param native - owner of the per-Topic Session worlds that receive the copies.
 */
export async function migrateLegacyTopics(host: Context, index: TopicIndex, sources: SourceStorage, native: HostSessionAdapter): Promise<void> {
  const records = await index.legacyRecords()
  if (records.length === 0) return
  let legacy: LegacyPersistence | undefined
  try {
    for (const metadata of records) {
      try {
        // Another Host consumer may own this identity. Never copy a moving log.
        if (host.agents.get(SessionId(metadata.sessionId)) !== undefined) continue
        const root = await sources.root(metadata.sourceSessionId, true)
        if (root === undefined) continue
        index.bindSource(metadata.sourceSessionId, root)
        // A copy committed before an interrupted cleanup, or a later deletion, finishes here.
        if (await index.findBySessionId(metadata.sessionId) !== undefined || await index.findDeleted(metadata.sessionId) !== undefined) {
          await index.forgetLegacy(metadata)
          continue
        }
        // Keep the old number unless a newer Topic already uses it.
        const occupied = await index.readOwned(metadata.sourceSessionId, metadata.topicId) !== undefined
        const topicId = occupied ? (await index.reserve(metadata.sourceSessionId)).topicId : metadata.topicId
        const migrated: TopicMetadata = { ...metadata, topicId, hosted: true, storage: 'source' }
        const owner = await native.context(migrated)
        const from = metadata.hosted === true
          ? host.sessionPersistence
          : (legacy ??= await openLegacyPersistence()).persistence
        await copySessionHistory(from, owner.sessionPersistence, metadata.sessionId)
        await index.save(migrated)
        await index.forgetLegacy(metadata)
      } catch (error) {
        // An unavailable source or a divergent interrupted copy leaves the old record untouched.
        host.logger.warn(`CiteCiter could not migrate Topic ${metadata.sessionId}; it will be retried on the next start`, error)
      }
    }
  } finally {
    await legacy?.dispose()
  }
}

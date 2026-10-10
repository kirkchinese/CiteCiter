/** One-shot migration of Topics created before 0.8 into their source-owned Citer directories. */
import { Context } from '@deepseek-ai/cordis';
import type { HostSessionAdapter } from './host-session-adapter.ts';
import type { SourceStorage } from './source-storage.ts';
import type { TopicIndex } from './topic-index.ts';
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
export declare function migrateLegacyTopics(host: Context, index: TopicIndex, sources: SourceStorage, native: HostSessionAdapter): Promise<void>;

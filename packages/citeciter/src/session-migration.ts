import { isDeepStrictEqual } from 'node:util'
import type { Context } from '@deepseek-ai/cordis'
import { SessionId } from '@deepseek-ai/dsh-session'

/** Copy a validated Session through public persistence handles. Resume an interrupted identical prefix; never overwrite divergent data or remove the original. Close both handles before returning. */
export async function copySessionHistory(source: Context['sessionPersistence'], target: Context['sessionPersistence'], sessionId: string): Promise<void> {
  const id = SessionId(sessionId)
  const reader = await source.open(id, 'read')
  try {
    const { events } = await reader.read()
    const exists = await target.stat(id)
    const writer = exists === undefined
      ? await target.create(reader.header, { inheritedEventCount: reader.inheritedEventCount })
      : await target.open(id, 'write')
    try {
      if (!isDeepStrictEqual(writer.header, reader.header) || writer.inheritedEventCount !== reader.inheritedEventCount) throw new Error('Citer 迁移目标的 Session 头与来源不一致，未覆盖')
      const previous = (await writer.read()).events
      if (previous.length > events.length || !isDeepStrictEqual(previous, events.slice(0, previous.length))) throw new Error('Citer 迁移目标已出现不同历史，未覆盖')
      if (previous.length < events.length) await writer.append(events.slice(previous.length))
      await writer.flush()
      if (!isDeepStrictEqual((await writer.read()).events, events)) throw new Error('Citer 迁移后的完整日志校验失败')
    } finally { await writer.close() }
  } finally { await reader.close() }
}

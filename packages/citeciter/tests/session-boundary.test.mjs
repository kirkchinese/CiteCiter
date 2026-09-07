import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { Context } from '@deepseek-ai/cordis'
import SessionStore, { Session, SessionId, SessionLogOffset } from '@deepseek-ai/dsh-session'
import JsonlSessionPersistence from '@deepseek-ai/dsh-session-persistence-jsonl'
import { firstPostSeedUserQuestion, topicMessages } from '../lib/types/topic-runtime.js'

const userEvent = (seq, text) => ({
  type: 'user/message', seq, time: seq, surfaceOp: 'append',
  data: { id: `message-${seq}`, role: 'user', content: [{ type: 'text', text }], source: { kind: 'user' } },
})

test('a resumed exact Topic excludes inherited history but retains its earlier own questions', () => {
  const events = [userEvent(0, 'Parent question'), userEvent(1, 'Topic question')]
  const session = Session.create(SessionId('boundary-topic'), events, {
    version: 0, id: SessionId('boundary-topic'), createdAt: 1,
    isSeeded: true, parentSession: SessionId('parent'),
  }, SessionLogOffset(1))
  assert.equal(session.firstLiveSeq, 2)
  const log = {
    header: session.header, events: session.snapshotEvents(),
    inheritedEventCount: session.inheritedEventCount,
  }
  assert.equal(firstPostSeedUserQuestion(log), 'Topic question')
  assert.deepEqual(topicMessages(log).messages.map(message => message.text), ['Topic question'])
})

test('the rc.1 JSONL reader restores a version-0 physical seedLength without rewriting the artifact', async () => {
  const root = await mkdtemp(join(tmpdir(), 'citeciter-legacy-jsonl-'))
  const ctx = new Context()
  const sessions = await ctx.plugin(SessionStore)
  const persistence = await ctx.plugin(JsonlSessionPersistence, { root, compression: 'none' })
  try {
    const meta = {
      version: 0, id: SessionId('old-exact-topic'), createdAt: 1, cwd: root,
      isSeeded: true, parentSession: SessionId('parent'),
    }
    const artifact = ctx.sessionPersistence.locate(meta)
    const { isSeeded: _isSeeded, ...physical } = meta
    const rows = [
      { type: 'session', ...physical, seedLength: 1, delegationDepth: 0 },
      userEvent(0, 'Inherited source'), userEvent(1, 'Old Topic question'),
    ]
    const bytes = rows.map(row => JSON.stringify(row)).join('\n') + '\n'
    await mkdir(dirname(artifact.path), { recursive: true })
    await writeFile(artifact.path, bytes)
    const restored = await ctx.sessionPersistence.readFrom(meta.id, SessionLogOffset(0))
    assert.equal(restored.meta.isSeeded, true)
    assert.equal(restored.inheritedEventCount, 1)
    assert.equal(firstPostSeedUserQuestion({
      header: restored.meta, events: restored.events, inheritedEventCount: restored.inheritedEventCount,
    }), 'Old Topic question')
    assert.equal(await readFile(artifact.path, 'utf8'), bytes)
  } finally {
    await persistence.dispose()
    await sessions.dispose()
    await rm(root, { recursive: true, force: true })
  }
})

import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { Context } from '@deepseek-ai/cordis'
import SessionStore, { SESSION_FORMAT_VERSION, Session, SessionId, SessionLogOffset } from '@deepseek-ai/dsh-session'
import JsonlSessionPersistence from '@deepseek-ai/dsh-session-persistence-jsonl'
import { firstPostSeedUserQuestion, topicMessages } from '../lib/types/topic-runtime.js'

const userEvent = (seq, text) => ({
  type: 'user/message', seq, time: seq, surfaceOp: 'append',
  data: { id: `message-${seq}`, role: 'user', content: [{ type: 'text', text }], source: { kind: 'user' } },
})

test('a resumed exact Topic excludes inherited history but retains its earlier own questions', () => {
  const events = [userEvent(0, 'Parent question'), userEvent(1, 'Topic question')]
  const session = Session.fromRestore(SessionId('boundary-topic'), events, {
    version: SESSION_FORMAT_VERSION, id: SessionId('boundary-topic'), createdAt: 1,
    isSeeded: true, parentSession: SessionId('parent'),
  }, SessionLogOffset(1), 'independent')
  assert.equal(session.firstLiveSeq, 2)
  const log = {
    header: session.header, events: session.snapshotEvents(),
    inheritedEventCount: session.inheritedEventCount,
  }
  assert.equal(firstPostSeedUserQuestion(log), 'Topic question')
  assert.deepEqual(topicMessages(log).messages.map(message => message.text), ['Topic question'])
})

test('the latest JSONL read handle restores a version-0 seedLength without writing a generation', async () => {
  const root = await mkdtemp(join(tmpdir(), 'citeciter-legacy-jsonl-'))
  const ctx = new Context()
  const sessions = await ctx.plugin(SessionStore)
  const persistence = await ctx.plugin(JsonlSessionPersistence, { root, compression: 'none' })
  try {
    const meta = {
      version: 0, id: SessionId('old-exact-topic'), createdAt: 1,
      isSeeded: true, parentSession: SessionId('parent'),
    }
    const artifact = { path: join(root, '_no-cwd', meta.id, 'session.jsonl') }
    const { isSeeded: _isSeeded, ...physical } = meta
    const rows = [
      { type: 'session', ...physical, seedLength: 3, delegationDepth: 0 },
      { type: 'turn/start', seq: 0, time: 0, data: { turn: 1 } },
      { type: 'step/start', seq: 1, time: 1, data: { turn: 1, step: 1 } },
      userEvent(2, 'Inherited source'), userEvent(3, 'Old Topic question'),
    ]
    const bytes = rows.map(row => JSON.stringify(row)).join('\n') + '\n'
    await mkdir(dirname(artifact.path), { recursive: true })
    await writeFile(artifact.path, bytes)
    const reader = await ctx.sessionPersistence.open(meta.id, 'read')
    try {
      const { events } = await reader.read()
      assert.equal(reader.header.version, SESSION_FORMAT_VERSION)
      assert.equal(reader.header.isSeeded, true)
      assert.equal(reader.inheritedEventCount, 4)
      assert.ok(events.slice(0, reader.inheritedEventCount).some(event => event.type === 'user/message' && event.data.content[0]?.text === 'Inherited source'))
      assert.equal(firstPostSeedUserQuestion({
        header: reader.header, events, inheritedEventCount: reader.inheritedEventCount,
      }), 'Old Topic question')
    } finally {
      await reader.close()
    }
    assert.equal(await readFile(artifact.path, 'utf8'), bytes)
    assert.deepEqual(await readdir(dirname(artifact.path)), ['session.jsonl'])
  } finally {
    await persistence.dispose()
    await sessions.dispose()
    await rm(root, { recursive: true, force: true })
  }
})

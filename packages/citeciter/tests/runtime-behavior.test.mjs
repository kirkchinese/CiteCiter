import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  citeCiterToolAvailable,
  foldTopicTitle,
  resolveTopicModeAndSeed,
  selectTopicTitleMessage,
} from '../lib/types/topic-runtime.js'

test('source-file settings drive the same visible and executable tool allowlist', () => {
  for (const name of ['read_source_session', 'ask_user_question']) {
    assert.equal(citeCiterToolAvailable(name, false), true)
  }
  for (const name of ['read', 'glob', 'grep']) {
    assert.equal(citeCiterToolAvailable(name, true), true)
    assert.equal(citeCiterToolAvailable(name, false), false)
  }
  for (const name of ['bash', 'write', 'edit', 'delete']) {
    assert.equal(citeCiterToolAvailable(name, true), false)
  }
})

test('Exact Fork uses a closed source turn and otherwise falls back only when requested', () => {
  const assistant = {
    seq: 2,
    type: 'assistant/message',
    data: { turn: 1, message: { content: [] } },
  }
  const closed = {
    session: { id: 'source' },
    events: [assistant, { seq: 3, type: 'step/end', data: { turn: 1, step: 1 } }, {
      seq: 4,
      type: 'turn/end',
      data: { turn: 1, reason: { kind: 'completed' } },
    }],
  }
  assert.deepEqual(resolveTopicModeAndSeed({ mode: 'exact-fork' }, closed, 2), {
    mode: 'exact-fork',
    forkThroughSeq: 4,
    seed: closed.events,
  })
  const open = { ...closed, events: [assistant] }
  assert.deepEqual(resolveTopicModeAndSeed({ mode: 'exact-when-available' }, open, 2), {
    mode: 'observer',
    forkThroughSeq: null,
    seed: [],
  })
  assert.throws(() => resolveTopicModeAndSeed({ mode: 'exact-fork' }, open, 2), /open model call|source turn/u)
})

test('Exact Topics ignore inherited titles and title the first post-seed question', () => {
  const inheritedTitle = {
    seq: 2,
    time: 2,
    type: 'session/title',
    data: { title: '来源会话标题', messageSeqs: [1], source: { kind: 'provider', provider: 'source' } },
    surfaceOp: 'append',
  }
  const topicTitle = {
    seq: 8,
    time: 8,
    type: 'session/title',
    data: { title: '签署位为何为假', messageSeqs: [4], source: { kind: 'provider', provider: 'citeciter' } },
    surfaceOp: 'append',
  }
  const metadata = { mode: 'exact-fork', forkThroughSeq: 3 }
  assert.equal(foldTopicTitle(metadata, [inheritedTitle]), undefined)
  assert.equal(foldTopicTitle(metadata, [inheritedTitle, topicTitle])?.title, '签署位为何为假')

  const selected = selectTopicTitleMessage({
    session: {
      header: { seedLength: 3 },
      events: [{ seq: 0 }, { seq: 1 }, { seq: 2 }, { seq: 4 }],
    },
    messages: [
      { seq: 1, text: '来源问题' },
      { seq: 4, text: '这个签署位为什么仍为 false？' },
    ],
  })
  assert.deepEqual(selected, { seq: 4, text: '这个签署位为什么仍为 false？' })
})

test('Topic list summaries do not replay every Topic or source Session', async () => {
  const source = await readFile(new URL('../src/topic-runtime.ts', import.meta.url), 'utf8')
  const list = source.slice(
    source.indexOf('private async list('),
    source.indexOf('private async readLog('),
  )
  assert.doesNotMatch(list, /this\.snapshot\(/u)
  assert.doesNotMatch(list, /sessionQuery\.readSession/u)
  assert.match(list, /this\.summary\(topic\)/u)
})

test('Topic metadata is committed before the first Agent request can use source tools', async () => {
  const source = await readFile(new URL('../src/topic-runtime.ts', import.meta.url), 'utf8')
  const create = source.slice(
    source.indexOf('private async create(request:'),
    source.indexOf('private async createIdempotent('),
  )
  assert.ok(create.indexOf('await this.index.save(metadata)') < create.indexOf('handle.agent.followup('))
})

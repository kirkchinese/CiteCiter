import assert from 'node:assert/strict'
import test from 'node:test'

import { CITER_CONTEXT_KIND, composeSourceWindow, isFirstStepOfTurn, lastSourceWindowSeq, refusedMessageSources } from '../lib/types/topic-context.js'
import { contextMessage } from '../lib/types/message-projection.js'

function assistant(seq, text) {
  return {
    seq, time: seq, type: 'assistant/message',
    data: { turn: 1, step: 1, message: { id: `a-${seq}`, role: 'assistant', source: { kind: 'model', provider: 't', model: 't' }, content: [{ type: 'text', text }] } },
  }
}

const source = { session: { id: 'src' }, events: [assistant(1, 'first'), assistant(2, 'second'), assistant(3, 'third')] }

test('the first automatic excerpt covers recent records and records its cursor', () => {
  const message = composeSourceWindow(source, { includeReasoning: false, anchorSeq: null, afterSeq: null })
  assert.equal(message.source.kind, CITER_CONTEXT_KIND)
  assert.equal(message.source.citer, 'source-window')
  // DSH's `recall` form, so native and community context viewers can present it.
  assert.equal(message.source.form, 'recall')
  assert.deepEqual(message.source.references, [{ label: '来源对话', retainedMessages: 3, omittedMessages: 0, truncated: false }])
  assert.equal(message.source.throughSeq, 3)
  assert.match(message.content[0].text, /^# Source excerpt \(automatic\)\nThe most recent source records/u)
  assert.match(message.content[0].text, /# Assistant · seq 3\nthird/u)
})

test('later excerpts include only new records, and nothing when the source has not grown', () => {
  const next = composeSourceWindow(source, { includeReasoning: false, anchorSeq: null, afterSeq: 1 })
  assert.doesNotMatch(next.content[0].text, /seq 1\nfirst/u)
  assert.match(next.content[0].text, /since the previous automatic excerpt \(which ended at seq 1\)/u)
  assert.equal(composeSourceWindow(source, { includeReasoning: false, anchorSeq: null, afterSeq: 3 }), null)
})

test('the excerpt cursor and its label are recovered from the Topic log', () => {
  const message = composeSourceWindow(source, { includeReasoning: false, anchorSeq: null, afterSeq: null })
  const events = [
    { seq: 0, time: 0, type: 'user/message', data: { id: 'u', role: 'user', source: { kind: 'user' }, content: [{ type: 'text', text: 'hi' }] } },
    { seq: 1, time: 1, type: 'user/message', data: message },
  ]
  assert.equal(lastSourceWindowSeq(events), 3)
  assert.equal(lastSourceWindowSeq(events.slice(0, 1)), null)
  const row = contextMessage(events[1])
  assert.equal(row.label, '上下文召回')
  assert.equal(row.contextRole, 'recall')
  assert.equal(row.producer, '来源摘录')
})

test('excerpts and notices written by earlier versions keep their cursor and label', () => {
  const legacy = { seq: 1, time: 1, type: 'user/message', data: { id: 'old', role: 'user', source: { kind: CITER_CONTEXT_KIND, form: 'source-window', throughSeq: 7 }, content: [{ type: 'text', text: 'excerpt' }] } }
  assert.equal(lastSourceWindowSeq([legacy]), 7)
  assert.equal(contextMessage(legacy).producer, '来源摘录')
  const notice = { seq: 2, time: 2, type: 'user/message', data: { id: 'n', role: 'user', source: { kind: CITER_CONTEXT_KIND, citer: 'workspace-changes', form: 'notice', summary: '2 个文件有改动' }, content: [{ type: 'text', text: 'changes' }] } }
  assert.deepEqual([contextMessage(notice).label, contextMessage(notice).producer, contextMessage(notice).summary], ['上下文注入', '代码库变化', '2 个文件有改动'])
  const foreign = { seq: 3, time: 3, type: 'user/message', data: { id: 'f', role: 'user', source: { kind: 'plugin:dsh-example' }, content: [{ type: 'text', text: 'x' }] } }
  assert.equal(contextMessage(foreign).producer, 'dsh-example')
})

test('the first step of every turn is found from the log, whatever the loop step counter says', () => {
  const events = [
    { type: 'turn/start', data: { turn: 1 } }, { type: 'step/start', data: { turn: 1, step: 1 } }, { type: 'step/end', data: { turn: 1, step: 1 } },
    { type: 'turn/end', data: { turn: 1 } }, { type: 'turn/start', data: { turn: 2 } },
  ]
  assert.equal(isFirstStepOfTurn(events, 2), true)
  assert.equal(isFirstStepOfTurn([...events, { type: 'step/start', data: { turn: 2, step: 2 } }], 2), false)
  assert.equal(isFirstStepOfTurn(events.slice(0, 2), 1), false)
})

test('sources refused by format v4 are named by their attribution only', () => {
  const user = source => ({ type: 'user/message', data: { id: 'u', role: 'user', content: [{ type: 'text', text: 'secret' }], ...(source === undefined ? {} : { source }) } })
  assert.deepEqual(refusedMessageSources(user({ kind: 'plugin', plugin: 'old-plugin', form: 'notice' })), [{ kind: 'plugin', plugin: 'old-plugin' }])
  assert.deepEqual(refusedMessageSources(user(undefined)), [{ kind: null }])
  assert.deepEqual(refusedMessageSources(user({ kind: '' })), [{ kind: '' }])
  assert.deepEqual(refusedMessageSources(user({ kind: CITER_CONTEXT_KIND })), [])
  assert.deepEqual(refusedMessageSources({ type: 'agent/inbox/spliced', data: { inserted: [{ source: { kind: 'user' } }, { source: { kind: 'plugin', plugin: 'x' } }] } }), [{ kind: 'plugin', plugin: 'x' }])
  assert.deepEqual(refusedMessageSources({ type: 'turn/start', data: { turn: 1 } }), [])
})

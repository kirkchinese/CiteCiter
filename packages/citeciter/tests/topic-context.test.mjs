import assert from 'node:assert/strict'
import test from 'node:test'

import { CITER_CONTEXT_KIND, composeSourceWindow, lastSourceWindowSeq } from '../lib/types/topic-context.js'
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
  assert.equal(message.source.form, 'source-window')
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
  assert.equal(contextMessage(events[1]).label, '来源摘录')
})

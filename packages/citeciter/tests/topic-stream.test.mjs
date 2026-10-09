import assert from 'node:assert/strict'
import test from 'node:test'
import { TopicStreamProjection } from '../lib/types/topic-stream.js'
import { topicMessages } from '../lib/types/topic-runtime.js'

test('live text and reasoning survive snapshot detachment and disappear on settlement', () => {
  const stream = new TopicStreamProjection()
  const frame = { attemptId: 'attempt-1', revision: 1 }
  stream.accept({ ...frame, type: 'start', turn: 1, step: 1 }, 3)
  assert.equal(stream.snapshot(), undefined)
  for (const chunk of [
    { type: 'block-start', index: 0, blockType: 'reasoning' },
    { type: 'reasoning-delta', index: 0, text: '分析' },
    { type: 'block-start', index: 1, blockType: 'text' },
    { type: 'text-delta', index: 1, text: '已生成' },
  ]) stream.accept({ ...frame, type: 'chunk', index: 0, time: 1, chunk }, 3)
  const saved = stream.snapshot()
  assert.equal(saved.reasoning, '分析')
  assert.equal(saved.text, '已生成')
  assert.equal(saved.streaming, true)
  stream.accept({ ...frame, type: 'chunk', index: 4, time: 2, chunk: { type: 'text-delta', index: 1, text: '后续' } }, 3)
  assert.equal(saved.text, '已生成')
  assert.equal(stream.snapshot().text, '已生成后续')
  stream.accept({ ...frame, type: 'end', index: 5, outcome: { kind: 'committed', seq: 3, eventType: 'assistant/message' } }, 4)
  assert.equal(stream.snapshot(), undefined)
})

test('replacement attempts isolate abandoned output and reject stale frames', () => {
  const stream = new TopicStreamProjection()
  stream.accept({ type: 'start', attemptId: 'old', revision: 1, turn: 1, step: 1 }, 3)
  stream.accept({ type: 'start', attemptId: 'new', revision: 2, turn: 1, step: 1 }, 4)
  stream.accept({ type: 'chunk', attemptId: 'old', revision: 1, index: 0, time: 1, chunk: { type: 'text-delta', index: 0, text: 'stale' } }, 4)
  assert.equal(stream.snapshot(), undefined)
  stream.accept({ type: 'end', attemptId: 'new', revision: 2, index: 0, outcome: { kind: 'abandoned' } }, 4)
  assert.equal(stream.snapshot(), undefined)
})

test('failed durable attempts retain visible output and a single failure row after reopen', () => {
  const events = [
    { type: 'turn/start', seq: 0, data: { turn: 1 } },
    { type: 'step/start', seq: 1, data: { turn: 1, step: 1 } },
    { type: 'assistant/attempt', seq: 2, data: { turn: 1, step: 1, stream: [
      { type: 'chunk', time: 1, chunk: { type: 'block-start', index: 0, blockType: 'text' } },
      { type: 'text-chunks', time0: 2, index: 0, dt: [0], texts: ['保留已输出的讲解'] },
    ] } },
    { type: 'turn/end', seq: 3, data: { turn: 1, reason: { kind: 'error', error: { message: 'provider failed' } } } },
  ]
  const projected = topicMessages({ header: {}, inheritedEventCount: 0, events })
  assert.equal(projected.messages.length, 2)
  assert.equal(projected.messages[0].text, '保留已输出的讲解')
  assert.equal(projected.messages[0].streaming, false)
  assert.equal(projected.messages[1].bodyRetained, true)
  assert.equal(projected.error, 'provider failed')
})

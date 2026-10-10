import assert from 'node:assert/strict'
import test from 'node:test'

import { isTopicMessageVisible } from '../lib/types/client/topic-presentation.js'

const tool = (id, seq, overrides = {}) => ({
  id, seq, role: 'tool', name: 'blackboard_apply',
  arguments: '{}', result: 'ok', isError: false, running: false, ...overrides,
})
const assistant = (id, seq, overrides = {}) => ({
  id, seq, role: 'assistant', text: 'answer', reasoning: null, streaming: false, ...overrides,
})
const failure = { id: 'failure', seq: 4, role: 'error', text: 'failed', bodyRetained: false, attempt: 1, status: 'failed' }

test('context rows and empty assistant rows stay hidden', () => {
  const context = { id: 'context', seq: 0, role: 'context', label: 'Citation', text: 'quote' }
  assert.equal(isTopicMessageVisible(context, [context]), false)
  assert.equal(isTopicMessageVisible(assistant('empty', 1, { text: ' ', reasoning: '' }), []), false)
  assert.equal(isTopicMessageVisible(assistant('thinking', 1, { text: '', reasoning: 'thought' }), []), true)
})

test('every tool dispatch keeps its own row, including a failure followed by a success', () => {
  const failed = tool('failed', 2, { result: 'invalid', isError: true })
  const succeeded = tool('succeeded', 3)
  const messages = [failed, succeeded]
  assert.equal(isTopicMessageVisible(failed, messages), true)
  assert.equal(isTopicMessageVisible(succeeded, messages), true)
})

test('a failure stays visible until a later completed answer recovers it', () => {
  const streaming = assistant('streaming', 5, { text: 'partial', streaming: true })
  const blank = assistant('blank', 6, { text: '', reasoning: 'only thinking' })
  const earlier = assistant('earlier', 3)
  const recovered = assistant('recovered', 7)
  assert.equal(isTopicMessageVisible(failure, [earlier, failure]), true)
  assert.equal(isTopicMessageVisible(failure, [failure, streaming, blank]), true)
  assert.equal(isTopicMessageVisible(failure, [failure, streaming, recovered]), false)
})

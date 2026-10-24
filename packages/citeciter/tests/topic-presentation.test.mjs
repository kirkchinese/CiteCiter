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

test('notices and recalled context are listed, ordinary context only on request, empty answers never', () => {
  const notice = { id: 'n', seq: 0, role: 'context', label: '上下文注入', contextRole: 'inject', producer: '代码库变化', summary: '2 个文件有改动', text: 'changes' }
  const recall = { id: 'r', seq: 0, role: 'context', label: '上下文召回', contextRole: 'recall', producer: '来源摘录', text: 'excerpt' }
  const runtime = { id: 'c', seq: 0, role: 'context', label: '上下文注入', contextRole: 'inject', producer: '运行环境', text: 'cwd' }
  assert.equal(isTopicMessageVisible(notice), true)
  assert.equal(isTopicMessageVisible(recall), true)
  assert.equal(isTopicMessageVisible(runtime), false)
  assert.equal(isTopicMessageVisible(runtime, { allContext: true }), true)
  assert.equal(isTopicMessageVisible(assistant('empty', 1, { text: ' ', reasoning: '' })), false)
  assert.equal(isTopicMessageVisible(assistant('thinking', 1, { text: '', reasoning: 'thought' })), true)
  assert.equal(isTopicMessageVisible(assistant('image', 1, { text: '', attachments: [{ kind: 'image', id: 'a', name: '图片' }] })), true)
})

test('every tool dispatch keeps its own row, including a failure followed by a success', () => {
  assert.equal(isTopicMessageVisible(tool('failed', 2, { result: 'invalid', isError: true })), true)
  assert.equal(isTopicMessageVisible(tool('succeeded', 3)), true)
})

test('failures and stops stay in the history after later answers, as in DSH', () => {
  assert.equal(isTopicMessageVisible({ id: 'failure', seq: 4, role: 'error', turn: 1, text: 'failed', bodyRetained: false, attempt: 1, status: 'failed' }), true)
  assert.equal(isTopicMessageVisible({ id: 'stop', seq: 5, role: 'error', turn: 2, text: '已停止，可继续。', bodyRetained: true, attempt: 1, status: 'stopped' }), true)
})

import assert from 'node:assert/strict'
import test from 'node:test'

import { appendBoardCitation, isTopicMessageVisible } from '../lib/types/client/topic-presentation.js'

test('board citations append without replacing the existing Topic draft', () => {
  assert.equal(appendBoardCitation('', '关于黑板：'), '关于黑板：')
  assert.equal(appendBoardCitation('已有草稿', '关于黑板：'), '已有草稿\n关于黑板：')
})

test('Topic transcript hides internal progress and clears recovered failures', () => {
  const read = {
    id: 'read', seq: 1, role: 'tool', name: 'read_source_session',
    arguments: '{}', result: 'ok', isError: false, running: false,
  }
  const boardFailure = {
    id: 'board-failure', seq: 2, role: 'tool', name: 'blackboard_apply',
    arguments: '{}', result: 'invalid', isError: true, running: false,
  }
  const boardSuccess = { ...boardFailure, id: 'board-success', seq: 3, result: 'ok', isError: false }
  const failure = {
    id: 'failure', seq: 4, role: 'error',
    text: 'failed', bodyRetained: false, attempt: 1, status: 'failed',
  }
  const streaming = {
    id: 'streaming', seq: 5, role: 'assistant',
    text: '', reasoning: 'hidden thought', streaming: true,
  }
  const recovered = { ...streaming, id: 'recovered', seq: 6, text: 'recovered', streaming: false }
  const messages = [read, boardFailure, boardSuccess, failure, recovered]

  assert.equal(isTopicMessageVisible(streaming, messages), false)
  assert.equal(isTopicMessageVisible({ ...streaming, streaming: false }, messages), false)
  assert.equal(isTopicMessageVisible(read, messages), false)
  assert.equal(isTopicMessageVisible(boardFailure, messages), false)
  assert.equal(isTopicMessageVisible(boardSuccess, messages), false)
  assert.equal(isTopicMessageVisible(failure, [failure, streaming]), true)
  assert.equal(isTopicMessageVisible(failure, messages), false)
})

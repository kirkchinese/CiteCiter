import assert from 'node:assert/strict'
import test from 'node:test'
import { MAX_QUESTION_CHARS, normalizeQuestion } from '../lib/types/client/prompt.js'

test('genuine user questions are normalized without Citation or role wrappers', () => {
  const question = '  为什么这个张量能度量曲率？  '
  assert.equal(normalizeQuestion(question), '为什么这个张量能度量曲率？')
  assert.throws(() => normalizeQuestion('   '), /cannot be empty/)
  assert.throws(() => normalizeQuestion('x'.repeat(MAX_QUESTION_CHARS + 1)), /exceeds/)
})

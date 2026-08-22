import assert from 'node:assert/strict'
import test from 'node:test'
import { MAX_QUESTION_CHARS, normalizeQuestion, parseNextQuestions } from '../lib/types/client/prompt.js'

test('genuine user questions are normalized without Citation or role wrappers', () => {
  const question = '  为什么这个张量能度量曲率？  '
  assert.equal(normalizeQuestion(question), '为什么这个张量能度量曲率？')
  assert.throws(() => normalizeQuestion('   '), /cannot be empty/)
  assert.throws(() => normalizeQuestion('x'.repeat(MAX_QUESTION_CHARS + 1)), /exceeds/)
})

test('only an exact terminal three-question block becomes follow-up shortcuts', () => {
  assert.deepEqual(parseNextQuestions(`回答正文。\n<citeciter-next-questions>\n["为什么？","证据呢？","还有边界吗？"]\n</citeciter-next-questions>`), {
    text: '回答正文。',
    questions: ['为什么？', '证据呢？', '还有边界吗？'],
    invalid: false,
  })
  const malformed = `回答正文。\n<citeciter-next-questions>\n["只有一个？"]\n</citeciter-next-questions>`
  assert.deepEqual(parseNextQuestions(malformed), { text: '回答正文。', questions: [], invalid: true })
  assert.deepEqual(parseNextQuestions('回答正文。\n</citeciter-next-questions>\n<dsml>garbage</dsml>'), {
    text: '回答正文。',
    questions: [],
    invalid: true,
  })
  assert.deepEqual(parseNextQuestions('回答正文。\n<citeciter-next-questions>\n["尚未完成'), {
    text: '回答正文。',
    questions: [],
    invalid: true,
  })
})

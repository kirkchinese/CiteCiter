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
  assert.deepEqual(parseNextQuestions('回答正文。<citeciter-next-questions> ["单行？","空行？","边界？"] </citeciter-next-questions>  '), {
    text: '回答正文。',
    questions: ['单行？', '空行？', '边界？'],
    invalid: false,
  })
  assert.deepEqual(parseNextQuestions('回答正文。\r\n<citeciter-next-questions>\r\n["换行？","空格？","引用？"]\r\n</citeciter-next-questions>\r\n'), {
    text: '回答正文。',
    questions: ['换行？', '空格？', '引用？'],
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
  for (const control of [
    '回答正文。<citeciter-next-questions> ["重复？","重复？","边界？"] </citeciter-next-questions>',
    '回答正文。<citeciter-next-questions> ["一？","二？","三？","四？"] </citeciter-next-questions>',
    '回答正文。<citeciter-next-questions> [损坏 JSON] </citeciter-next-questions>',
    '回答正文。<citeciter-next-questions>',
    '回答正文。</citeciter-next-questions>',
    '回答正文。<citeciter-next-questions>["一？","二？","三？"]</citeciter-next-questions><citeciter-next-questions>["四？","五？","六？"]</citeciter-next-questions>',
  ]) {
    assert.deepEqual(parseNextQuestions(control), {
      text: '回答正文。',
      questions: [],
      invalid: true,
    })
  }
  const ordinary = '正文中引用 <citeciter-next-question> 和 <citeciter-next-questions 都不是控制后缀。'
  assert.deepEqual(parseNextQuestions(ordinary), { text: ordinary, questions: [], invalid: false })
})

test('streaming control-tag prefixes never enter the visible answer', () => {
  for (const suffix of [
    '<',
    '<cite',
    '<citeciter-next-',
    '<citeciter-next-questions>',
    '<citeciter-next-questions> ["一？","二？","三？"] </citeciter-next-',
  ]) {
    assert.deepEqual(parseNextQuestions(`回答正文。${suffix}`, true), {
      text: '回答正文。',
      questions: [],
      invalid: true,
    })
  }
  assert.deepEqual(parseNextQuestions('回答正文。<cite', false), {
    text: '回答正文。<cite',
    questions: [],
    invalid: false,
  })
})

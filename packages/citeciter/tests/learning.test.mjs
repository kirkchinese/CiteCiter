import assert from 'node:assert/strict'
import test from 'node:test'
import { LEARNING_STAGES, learningQuestion, learningCardsInputSchema, projectLearningCards, learningCardsMarkdown } from '../lib/types/learning.js'
import { DEFAULT_CITECITER_SETTINGS, citeCiterSettingsSchema } from '../lib/types/topic.js'

const card = { title: '曲率与路径', summary: '曲率刻画局部平行移动的路径依赖。', example: { kind: 'text', content: '球面上的闭合回路。' }, question: '平面与球面有什么不同？', answer: '局部曲率不同，平行移动绕回的结果也不同。' }
const codeCard = { ...card, title: '代码示例', example: { kind: 'code', language: 'js', content: 'if (x) {\n  run()\n}' } }
const record = (id, cards = [card], extra = {}) => ({ id, seq: 1, role: 'tool', name: 'learning_cards', arguments: JSON.stringify({ cards }), result: JSON.stringify({ saved: cards.length }), running: false, isError: false, ...extra })

test('learning stage prompts carry the full instruction and the user question', () => {
  for (const stage of LEARNING_STAGES) {
    const text = learningQuestion(stage.id, '我卡在这个前提上')
    assert.ok(text.startsWith(`【学习阶段：${stage.label}】\n`))
    assert.ok(text.includes(stage.instruction))
    assert.ok(text.endsWith('我的问题：我卡在这个前提上'))
  }
  assert.ok(!learningQuestion('summary').includes('我的问题'))
})

test('failed, pending and malformed card saves preserve the previous complete set', () => {
  const next = { ...card, title: '修订后的卡片' }
  const records = [record('valid'), record('failed', [next], { isError: true }), record('pending', [next], { running: true }), record('invalid', [], { result: '{"saved":0}' }), record('mismatched', [next], { result: '{"saved":2}' })]
  assert.deepEqual(projectLearningCards(records), { cards: [card], messageId: 'valid', invalid: 2 })
  assert.deepEqual(projectLearningCards([...records, record('revision', [next])]), { cards: [next], messageId: 'revision', invalid: 2 })
  assert.deepEqual(projectLearningCards([record('prose', [card], { role: 'assistant' })]).cards, [])
})

test('cards logged with a plain-string example are still read as text', () => {
  const legacy = { ...card, example: '球面上的闭合回路。' }
  assert.deepEqual(projectLearningCards([record('old', [legacy])]).cards, [card])
})

test('card input bounds reject blank, unknown, oversized and legacy-shaped values', () => {
  for (const cards of [[], Array(9).fill(card), [{ ...card, title: ' ' }], [{ ...card, schedule: 'tomorrow' }], [{ ...card, summary: 'x'.repeat(2001) }], [{ ...card, example: '纯字符串' }], [{ ...codeCard, example: { kind: 'code', language: 'js', content: '   ' } }]]) {
    assert.equal(learningCardsInputSchema.safeParse({ cards }).success, false)
  }
  assert.equal(learningCardsInputSchema.safeParse({ cards: [card, codeCard] }).success, true)
})

test('recall is off by default and old preferences remain readable', () => {
  assert.equal(DEFAULT_CITECITER_SETTINGS.activeRecall, false)
  const { activeRecall: _, ...old } = DEFAULT_CITECITER_SETTINGS
  assert.equal(citeCiterSettingsSchema.safeParse(old).success, true)
  assert.equal(citeCiterSettingsSchema.safeParse({ ...old, activeRecall: 'true' }).success, false)
})

test('export keeps the content, fences code literally and records provenance', () => {
  const exported = learningCardsMarkdown([card, codeCard], '曲率', 'topic-test', '原文引用')
  for (const value of [card.title, card.summary, card.example.content, card.question, card.answer, 'topic-test', '原文引用']) assert.ok(exported.includes(value))
  assert.ok(exported.includes('```js\nif (x) {\n  run()\n}\n```'))
  assert.ok(exported.endsWith('\n'))
})

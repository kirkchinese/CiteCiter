import assert from 'node:assert/strict'
import test from 'node:test'
import { LEARNING_STAGES, learningQuestion, latestLearningStage, learningCardsInputSchema, projectLearningCards, learningCardsMarkdown } from '../lib/types/learning.js'
import { DEFAULT_CITECITER_SETTINGS, citeCiterSettingsSchema } from '../lib/types/topic.js'

const card = { title: '曲率与路径', summary: '曲率刻画局部平行移动的路径依赖。', example: '球面上的闭合回路。', question: '平面与球面有什么不同？', answer: '局部曲率不同，平行移动绕回的结果也不同。' }
const record = (id, cards = [card], extra = {}) => ({ id, seq: 1, role: 'tool', name: 'learning_cards', arguments: JSON.stringify({ cards }), result: JSON.stringify({ saved: cards.length }), running: false, isError: false, ...extra })

test('learning intent and the user question survive a Topic history round trip', () => {
  for (const stage of LEARNING_STAGES) {
    const text = learningQuestion(stage.id, '我卡在这个前提上')
    const messages = JSON.parse(JSON.stringify([{ id: 'u1', seq: 1, role: 'user', text }]))
    assert.equal(latestLearningStage(messages), stage.id)
    assert.ok(text.includes(stage.instruction))
    assert.ok(text.endsWith('我的问题：我卡在这个前提上'))
  }
  assert.equal(latestLearningStage([{ id: 'a1', seq: 2, role: 'assistant', text: learningQuestion('summary') }]), null)
})

test('failed, pending and malformed card saves preserve the previous complete set', () => {
  const next = { ...card, title: '修订后的卡片' }
  const records = [record('valid'), record('failed', [next], { isError: true }), record('pending', [next], { running: true }), record('invalid', [], { result: '{"saved":0}' }), record('mismatched', [next], { result: '{"saved":2}' })]
  const projection = projectLearningCards(records)
  assert.deepEqual(projection, { cards: [card], messageId: 'valid', invalid: 2 })
  assert.deepEqual(projectLearningCards([...records, record('revision', [next])]), { cards: [next], messageId: 'revision', invalid: 2 })
  assert.deepEqual(projectLearningCards([record('prose', [card], { role: 'assistant' })]).cards, [])
})

test('card input bounds reject blank, unknown and oversized external values', () => {
  for (const cards of [[], Array(9).fill(card), [{ ...card, title: ' ' }], [{ ...card, schedule: 'tomorrow' }], [{ ...card, summary: 'x'.repeat(2001) }]]) {
    assert.equal(learningCardsInputSchema.safeParse({ cards }).success, false)
  }
  assert.equal(learningCardsInputSchema.safeParse({ cards: [card] }).success, true)
})

test('recall is off by default and old preferences remain readable', () => {
  assert.equal(DEFAULT_CITECITER_SETTINGS.activeRecall, false)
  const { activeRecall: _, ...old } = DEFAULT_CITECITER_SETTINGS
  assert.equal(citeCiterSettingsSchema.safeParse(old).success, true)
  assert.equal(citeCiterSettingsSchema.safeParse({ ...old, activeRecall: 'true' }).success, false)
})

test('export retains the displayed content, optional answer and Topic provenance', () => {
  const exported = learningCardsMarkdown([card], '曲率', 'topic-test', '原文引用')
  for (const value of [...Object.values(card), 'topic-test', '原文引用']) assert.ok(exported.includes(value))
  assert.ok(exported.endsWith('\n'))
})

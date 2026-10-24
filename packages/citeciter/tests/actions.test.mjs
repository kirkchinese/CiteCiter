import assert from 'node:assert/strict'
import test from 'node:test'

import { actionDelivery, actionQuestion, DEFAULT_WHEEL_SLOTS, ENGLISH_WHEEL_SLOTS, localizedWheelSlots, wheelSlotsSchema } from '../lib/types/actions.js'

const ask = { label: '提问', prompt: '', ask: true, presentation: 'side' }
const preset = { label: '翻译', prompt: '请翻译。', ask: false, presentation: 'floating' }

test('preset actions follow the delivery setting while questions always open the composer', () => {
  assert.equal(actionDelivery(preset, undefined), 'send')
  assert.equal(actionDelivery(preset, 'send'), 'send')
  assert.equal(actionDelivery(preset, 'draft'), 'draft')
  assert.equal(actionDelivery(ask, 'send'), 'draft')
})

test('default actions are valid, start with a question and carry no per-slot target', () => {
  assert.deepEqual(wheelSlotsSchema.parse(DEFAULT_WHEEL_SLOTS), DEFAULT_WHEEL_SLOTS)
  assert.equal(DEFAULT_WHEEL_SLOTS[0]?.ask, true)
  assert.equal(DEFAULT_WHEEL_SLOTS.some(slot => slot !== null && 'target' in slot), false)
})

test('each unchanged built-in action follows the language; edited and added actions stay as written', () => {
  assert.deepEqual(wheelSlotsSchema.parse(ENGLISH_WHEEL_SLOTS), ENGLISH_WHEEL_SLOTS)
  assert.equal(localizedWheelSlots(undefined, false), ENGLISH_WHEEL_SLOTS)
  assert.deepEqual(localizedWheelSlots(DEFAULT_WHEEL_SLOTS, false), ENGLISH_WHEEL_SLOTS)
  assert.deepEqual(localizedWheelSlots(DEFAULT_WHEEL_SLOTS.map(slot => slot && { ...slot, target: 'current' }), false), ENGLISH_WHEEL_SLOTS.map(slot => slot && { ...slot, target: 'current' }))
  assert.equal(localizedWheelSlots(DEFAULT_WHEEL_SLOTS, true), DEFAULT_WHEEL_SLOTS)
  // Saving stores the whole list: one edited action and one added action must not pin the others to Chinese.
  const saved = DEFAULT_WHEEL_SLOTS.map(slot => slot && { ...slot })
  saved[1].label = '我的解释'
  saved[6] = { label: '自定义保留', prompt: '请保留这条中文自定义提示词。', ask: false, presentation: 'side' }
  ;[saved[2], saved[3]] = [saved[3], saved[2]]
  const english = localizedWheelSlots(saved, false)
  assert.deepEqual(english.map(slot => slot?.label ?? null), ['Ask Citer', '我的解释', 'Translate', 'Find errors', 'Blackboard', 'Study cards', '自定义保留', null])
  assert.equal(english[1], saved[1])
  // The reverse: built-ins saved while DSH showed English return to Chinese.
  const savedInEnglish = [...english]
  assert.deepEqual(localizedWheelSlots(savedInEnglish, true).map(slot => slot?.label ?? null), ['问 Citer', '我的解释', '翻译', '找错误', '板书', '学习卡', '自定义保留', null])
  // The ask action as earlier versions saved it takes the current name in either language.
  const earlier = [{ label: '提问', prompt: '', ask: true, presentation: 'side' }, ...DEFAULT_WHEEL_SLOTS.slice(1)]
  assert.equal(localizedWheelSlots(earlier, true)[0].label, '问 Citer')
  assert.equal(localizedWheelSlots(earlier, false)[0].label, 'Ask Citer')
  // Nothing to change keeps the saved list itself.
  assert.equal(localizedWheelSlots(saved, true), saved)
  assert.equal(ENGLISH_WHEEL_SLOTS[3].prompt.includes('into English'), true)
  assert.equal(ENGLISH_WHEEL_SLOTS[5].prompt.startsWith('[Learning stage: '), true)
  assert.equal(ENGLISH_WHEEL_SLOTS[5].prompt.endsWith('\n\nMy question: Organize the content around this quote.'), true)
})

test('an action question is its prompt plus the optional user question', () => {
  assert.equal(actionQuestion(preset, ''), '请翻译。')
  assert.equal(actionQuestion(preset, '  术语保留英文  '), '请翻译。\n\n我的问题：术语保留英文')
  assert.equal(actionQuestion(ask, ''), '')
})

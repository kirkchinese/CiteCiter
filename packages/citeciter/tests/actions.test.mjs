import assert from 'node:assert/strict'
import test from 'node:test'

import { actionDelivery, actionQuestion, DEFAULT_WHEEL_SLOTS, ENGLISH_WHEEL_SLOTS, localizedWheelSlots, undeliveredActionMessage, wheelSlotsSchema } from '../lib/types/actions.js'
import { MODEL_SELECTION_REQUIRED } from '../lib/types/model-admission.js'

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

test('English defaults replace only the complete built-in Chinese action list', () => {
  assert.deepEqual(wheelSlotsSchema.parse(ENGLISH_WHEEL_SLOTS), ENGLISH_WHEEL_SLOTS)
  assert.equal(localizedWheelSlots(undefined, false), ENGLISH_WHEEL_SLOTS)
  assert.equal(localizedWheelSlots(DEFAULT_WHEEL_SLOTS, false), ENGLISH_WHEEL_SLOTS)
  assert.equal(localizedWheelSlots(DEFAULT_WHEEL_SLOTS.map(slot => slot && { ...slot, target: 'current' }), false), ENGLISH_WHEEL_SLOTS)
  assert.equal(localizedWheelSlots(DEFAULT_WHEEL_SLOTS, true), DEFAULT_WHEEL_SLOTS)
  const custom = DEFAULT_WHEEL_SLOTS.map(slot => slot && { ...slot })
  custom[1].label = 'My explanation'
  assert.equal(localizedWheelSlots(custom, false), custom)
  assert.equal(ENGLISH_WHEEL_SLOTS[3].prompt.includes('into English'), true)
  assert.equal(ENGLISH_WHEEL_SLOTS[5].prompt.startsWith('[Learning stage: '), true)
  assert.equal(ENGLISH_WHEEL_SLOTS[5].prompt.endsWith('\n\nMy question: Organize the content around this quote.'), true)
})

test('an action question is its prompt plus the optional user question', () => {
  assert.equal(actionQuestion(preset, ''), '请翻译。')
  assert.equal(actionQuestion(preset, '  术语保留英文  '), '请翻译。\n\n我的问题：术语保留英文')
  assert.equal(actionQuestion(ask, ''), '')
})

test('a refused action explains itself once', () => {
  assert.equal(undeliveredActionMessage(MODEL_SELECTION_REQUIRED), '动作没有发送，已放进输入框')
  assert.equal(undeliveredActionMessage('模型服务暂时不可用。'), '模型服务暂时不可用。动作已放进输入框，可修改后发送')
  assert.equal(undeliveredActionMessage('request rejected'), 'request rejected。动作已放进输入框，可修改后发送')
})

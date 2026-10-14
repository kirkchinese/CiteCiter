import assert from 'node:assert/strict'
import test from 'node:test'

import { actionDelivery, actionQuestion, DEFAULT_WHEEL_SLOTS, wheelSlotsSchema } from '../lib/types/actions.js'

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

test('an action question is its prompt plus the optional user question', () => {
  assert.equal(actionQuestion(preset, ''), '请翻译。')
  assert.equal(actionQuestion(preset, '  术语保留英文  '), '请翻译。\n\n我的问题：术语保留英文')
  assert.equal(actionQuestion(ask, ''), '')
})

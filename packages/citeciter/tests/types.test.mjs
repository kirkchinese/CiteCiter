import assert from 'node:assert/strict'
import test from 'node:test'
import { CiteBus } from '../lib/types/client/types.js'

test('a failed CiteBus subscriber does not starve later subscribers', () => {
  const errors = []
  const calls = []
  const bus = new CiteBus((error) => errors.push(error))
  bus.subscribe(() => { throw new Error('listener failed') })
  bus.subscribe(() => calls.push('later listener'))

  bus.setMenuSelection({
    text: 'term',
    kind: 'assistant-step',
    anchorKey: '1:assistant-step1',
    x: 1,
    y: 2,
  })

  assert.deepEqual(calls, ['later listener'])
  assert.equal(errors.length, 1)
  assert.match(errors[0].message, /listener failed/)
})

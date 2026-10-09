import assert from 'node:assert/strict'
import test from 'node:test'

import { installDynamicAccelerator, parseAccelerator } from '../lib/types/client/hotkeys.js'

test('accelerator parsing accepts modifier+key and rejects bare keys', () => {
  assert.deepEqual(parseAccelerator('Control+Shift+C'), {
    modifiers: new Set(['Control', 'Shift']),
    key: 'C',
  })
  assert.deepEqual(parseAccelerator('Meta+Enter'), { modifiers: new Set(['Meta']), key: 'Enter' })
  assert.equal(parseAccelerator('C'), null)
  assert.equal(parseAccelerator(''), null)
  assert.equal(parseAccelerator('Control+'), null)
  assert.equal(parseAccelerator('Foo+C'), null)
})

test('the dynamic accelerator reads settings fresh and skips editable and IME targets', () => {
  const listeners = new Map()
  const window = {
    addEventListener(name, listener) {
      listeners.set(name, listener)
    },
    removeEventListener(name) {
      listeners.delete(name)
    },
  }
  globalThis.window = window
  let accelerator = 'Control+Shift+C'
  let calls = 0
  const dispose = installDynamicAccelerator(() => accelerator, () => { calls += 1 })

  const keydown = listeners.get('keydown')
  keydown({ key: 'c', ctrlKey: true, shiftKey: true, altKey: false, metaKey: false, isComposing: false, keyCode: 67, target: { closest: () => null }, preventDefault() {} })
  assert.equal(calls, 1)

  accelerator = ''
  keydown({ key: 'c', ctrlKey: true, shiftKey: true, altKey: false, metaKey: false, isComposing: false, keyCode: 67, target: { closest: () => null }, preventDefault() {} })
  assert.equal(calls, 1)

  accelerator = 'Control+Shift+C'
  keydown({ key: 'c', ctrlKey: true, shiftKey: true, altKey: false, metaKey: false, isComposing: true, keyCode: 229, target: { closest: () => null }, preventDefault() {} })
  keydown({ key: 'c', ctrlKey: true, shiftKey: true, altKey: false, metaKey: false, isComposing: false, keyCode: 67, target: { closest: () => ({}), }, preventDefault() {} })
  assert.equal(calls, 1)

  dispose()
  assert.equal(listeners.has('keydown'), false)
  delete globalThis.window
})

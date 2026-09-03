import assert from 'node:assert/strict'
import test from 'node:test'

import { readTextareaSelection } from '../lib/types/client/reader-selection.js'

function textarea(value, start, end) {
  return { value, selectionStart: start, selectionEnd: end }
}

test('reader selections return trimmed quotes with 240-character context windows', () => {
  const before = 'a'.repeat(300)
  const quoted = '  key passage  '
  const after = 'z'.repeat(300)
  const value = `${before}${quoted}${after}`
  const start = before.length
  const end = start + quoted.length
  const startOffset = start + 2
  const endOffset = end - 2
  const selection = readTextareaSelection(textarea(value, start, end))
  assert.deepEqual(selection, {
    displayText: 'key passage',
    prefixText: value.slice(Math.max(0, startOffset - 240), startOffset),
    suffixText: value.slice(endOffset, endOffset + 240),
  })

  assert.equal(readTextareaSelection(textarea(value, start, start)), null)
  assert.equal(readTextareaSelection(textarea(value, start, start + 2)), null)
})

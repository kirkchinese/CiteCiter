import assert from 'node:assert/strict'
import test from 'node:test'

import { literalSelection, markdownBlocks, pieceAt, textLines } from '../lib/types/client/document-layout.js'
import { lineAtOffset } from '../lib/types/document-pages.js'

const source = (content, pieces) => pieces.map(piece => content.slice(piece.start, piece.end))

test('text documents are cut into numbered lines that cover the source exactly', () => {
  const content = 'a\n\nbc\n'
  const lines = textLines(content)
  assert.deepEqual(source(content, lines), ['a', '', 'bc', ''])
  assert.deepEqual(lines.map(line => line.line), [1, 2, 3, 4])
})

test('Markdown blocks keep fences, math and indented continuations whole', () => {
  const content = [
    '# Title', '', 'First paragraph', 'continues.', '', '```js', 'const a = 1', '', 'const b = 2', '```', '',
    '$$', 'x = 1', '', 'y = 2', '$$', '', '1. item', '', '   more of the item', '', 'Last',
  ].join('\n')
  const blocks = markdownBlocks(content)
  assert.deepEqual(source(content, blocks), [
    '# Title',
    'First paragraph\ncontinues.',
    '```js\nconst a = 1\n\nconst b = 2\n```',
    '$$\nx = 1\n\ny = 2\n$$',
    '1. item\n\n   more of the item',
    'Last',
  ])
  assert.deepEqual(blocks.map(block => block.line), [1, 3, 6, 12, 18, 22])
  assert.equal(pieceAt(blocks, content.indexOf('y = 2')), 3)
  assert.equal(pieceAt(blocks, 0), 0)
})

test('an unclosed fence runs to the end instead of losing text', () => {
  const content = 'Intro\n\n```\ncode\n\nmore'
  assert.deepEqual(source(content, markdownBlocks(content)), ['Intro', '```\ncode\n\nmore'])
})

test('a literal selection is trimmed and keeps its context; lines count from one', () => {
  const content = 'alpha\n  beta gamma  \ndelta'
  const selected = literalSelection(content, 6, 20)
  assert.equal(selected.displayText, 'beta gamma')
  assert.equal(content.slice(selected.start, selected.end), 'beta gamma')
  assert.equal(selected.prefixText, 'alpha\n  ')
  assert.equal(literalSelection(content, 5, 8), null)
  assert.equal(lineAtOffset(content, selected.start), 2)
  assert.equal(lineAtOffset(content, 0), 1)
})

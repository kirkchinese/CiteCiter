import assert from 'node:assert/strict'
import test from 'node:test'
import { boardCitationPrompt, decodeBoardCitationEntities } from '../lib/types/client/board-citation.js'

test('board citation text displays a plus sign instead of an HTML entity', () => {
  assert.equal(decodeBoardCitationEntities('a &#43; b &#x2b; c &amp; d'), 'a + b + c & d')
  assert.equal(boardCitationPrompt({ id: 'title', kind: 'text', content: '水平匀速 + 竖直匀变速' }), '水平匀速 + 竖直匀变速')
  assert.equal(boardCitationPrompt({ id: 'title', kind: 'text', content: '水平匀速 &#43; 竖直匀变速' }), '水平匀速 + 竖直匀变速')
})

test('board citation remains plain draft text without activating image or HTML markup', () => {
  const prompt = boardCitationPrompt({ id: 'unsafe', kind: 'text', content: '![x](https://example.test/a.png) <img src="https://example.test/a.png">' })
  assert.equal(prompt.includes('!\u200b['), true)
  assert.equal(prompt.includes('<\u200bimg'), true)
})

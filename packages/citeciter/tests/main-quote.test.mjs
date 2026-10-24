import assert from 'node:assert/strict'
import test from 'node:test'

import { appendedDraft, markdownQuote } from '../lib/types/client/main-quote.js'

test('a quote joins a plain draft after a blank line, and never rewrites a draft holding reference chips', () => {
  assert.equal(appendedDraft('', '> a\n\n', 0), '> a\n\n')
  assert.equal(appendedDraft('我的看法  \n', '> a\n\n', 0), '我的看法\n\n> a\n\n')
  // DSH shows a chip as its clipboard text (`@notes.md`); rewriting would turn it into plain text.
  assert.equal(appendedDraft('看 @notes.md 这个文件', '> a\n\n', 1), null)
})

test('markdown quote preserves multiline text and ends with a blank line', () => {
  assert.equal(markdownQuote(' 第一行\r\n\r\n第二行 '), '> 第一行\n>\n> 第二行\n\n')
  assert.throws(() => markdownQuote(' \n '), /请先选中/u)
})

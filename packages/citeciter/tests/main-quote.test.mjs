import assert from 'node:assert/strict'
import test from 'node:test'

import { appendedDraft, markdownQuote } from '../lib/types/client/main-quote.js'

test('a quote joins a plain draft after a blank line, and never rewrites a draft holding reference chips', () => {
  assert.equal(appendedDraft('', '> a\n\n'), '> a\n\n')
  assert.equal(appendedDraft('我的看法  \n', '> a\n\n'), '我的看法\n\n> a\n\n')
  assert.equal(appendedDraft('看 \uE100 这个文件', '> a\n\n'), null)
})

test('markdown quote preserves multiline text and ends with a blank line', () => {
  assert.equal(markdownQuote(' 第一行\r\n\r\n第二行 '), '> 第一行\n>\n> 第二行\n\n')
  assert.throws(() => markdownQuote(' \n '), /请先选中/u)
})

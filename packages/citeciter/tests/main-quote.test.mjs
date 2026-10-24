import assert from 'node:assert/strict'
import test from 'node:test'

import { composerEnd, decodeQuote, encodeQuote, findQuote, markdownQuote, quoteModelText, quotePreview } from '../lib/types/client/main-quote.js'

const quote = { from: 'assistant', text: '的 DSH 内核（0.2.1-rc.2）\n在主对话输入框里' }

test('a quote chip keeps the passage and its speaker, and reads back field by field', () => {
  assert.deepEqual(decodeQuote(encodeQuote(quote)), quote)
  assert.equal(decodeQuote('@notes.md'), undefined)
  assert.equal(decodeQuote(JSON.stringify({ from: 'system', text: 'x' })), undefined)
  assert.equal(decodeQuote(JSON.stringify({ from: 'user', text: '  ' })), undefined)
})

test('the main agent receives only the exact passage and who said it', () => {
  assert.equal(quoteModelText(quote), '<quote from="assistant">\n的 DSH 内核（0.2.1-rc.2）\n在主对话输入框里\n</quote>')
})

test('sent quotes are found again in the message text', () => {
  const sent = `看这句 ${quoteModelText(quote)} 有问题，还有 ${quoteModelText({ from: 'tool', text: 'exit 1' })}`
  const first = findQuote(sent, 0)
  assert.deepEqual(first?.quote, quote)
  assert.equal(sent.slice(first.start, first.end), quoteModelText(quote))
  assert.deepEqual(findQuote(sent, first.end)?.quote, { from: 'tool', text: 'exit 1' })
  assert.equal(findQuote('<quote from="assistant">\n\n</quote>', 0), undefined)
})

test('the chip shows one short line; copying it gives a Markdown quote', () => {
  assert.equal(quotePreview(' a\n b '), 'a b')
  assert.equal(quotePreview('一'.repeat(40)), `${'一'.repeat(31)}…`)
  assert.equal(markdownQuote(' 第一行\r\n\r\n第二行 '), '> 第一行\n>\n> 第二行')
  assert.throws(() => markdownQuote(' \n '), /请先选中/u)
})

test('the composer end counts each chip as one character', () => {
  assert.equal(composerEnd('', []), 0)
  // `看 ￼ 这个`: the chip's nine clipboard characters are one in detect coordinates.
  assert.equal(composerEnd('看 @notes.md 这个', [{ length: 9 }]), 6)
  assert.equal(composerEnd('/goal 做完', [], '/goal'), 4)
})

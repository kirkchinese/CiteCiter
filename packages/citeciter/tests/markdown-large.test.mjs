import assert from 'node:assert/strict'
import test from 'node:test'
import { markdownSourceCandidates } from '../lib/types/client/markdown-source-map.js'

for (const [label, markdown, quote] of [
  ['long paragraph', '甲'.repeat(180_000) + '\n尾页的唯一引用。', '尾页的唯一引用。'],
  ['decoded text', 'a'.repeat(180_000) + '&amp; **unique ending**', '& unique ending'],
  ['indented code', '    ' + 'x'.repeat(180_000) + ' unique code ending\n', 'unique code ending'],
]) {
  test(`large Markdown citation maps a ${label} without overflowing the argument stack`, () => {
    const candidates = markdownSourceCandidates(markdown, quote)
    assert.equal(candidates.length, 1)
    const candidate = candidates[0]
    assert.equal(markdown.slice(candidate.startOffset, candidate.endOffset), candidate.sourceText)
    assert.ok(candidate.startOffset >= 180_000)
  })
}

import assert from 'node:assert/strict'
import test from 'node:test'
import { headOf, sliceWhole, snapEnd, snapStart, tailOf, wellFormed } from '../lib/types/text-units.js'
import { clip, formatSourceTranscript } from '../lib/types/source-transcript.js'

const LONE = /\p{Cs}/u
const DIAMOND = '🔹' // U+1F539: two UTF-16 code units

test('cut points never land between the halves of a non-BMP character', () => {
  const text = 'ab' + DIAMOND + 'cd'
  // Offset 3 is between \ud83d and \udd39.
  assert.equal(snapEnd(text, 3), 2)
  assert.equal(snapStart(text, 3), 4)
  assert.equal(headOf(text, 3), 'ab')
  assert.equal(tailOf(text, 3), 'cd')
  assert.equal(sliceWhole(text, 3, 6), 'cd')
  assert.equal(headOf(text, 4), 'ab' + DIAMOND)
  assert.equal(headOf('short', 10), 'short')
  for (let limit = 0; limit <= text.length; limit++) {
    assert.doesNotMatch(headOf(text, limit), LONE)
    assert.doesNotMatch(tailOf(text, limit), LONE)
  }
})

test('wellFormed replaces lone surrogates and keeps every offset', () => {
  const broken = 'x\udd39y\ud83d'
  const fixed = wellFormed(broken)
  assert.equal(fixed, 'x\uFFFDy\uFFFD')
  assert.equal(fixed.length, broken.length)
  assert.equal(wellFormed('ok ' + DIAMOND), 'ok ' + DIAMOND)
})

test('clip keeps whole characters at both cuts and counts what it omits', () => {
  for (const limit of [10, 11, 1499, 1500, 1501]) {
    for (let at = 0; at < limit + 40; at++) {
      const text = 'a'.repeat(at) + DIAMOND + 'b'.repeat(4000)
      const { text: clipped, shortened } = clip(text, limit)
      assert.equal(shortened, true)
      assert.doesNotMatch(clipped, LONE, `limit ${limit}, emoji at ${at}`)
      const [head, rest] = clipped.split('\n… [')
      const [count, tail] = rest.split(' characters omitted] …\n')
      assert.equal(head.length + Number(count) + tail.length, text.length, 'omitted count matches the actual cut')
    }
  }
  // The tail cut: an emoji near the end of the payload.
  for (const limit of [10, 1500]) {
    for (let after = 0; after < limit; after++) {
      const text = 'b'.repeat(4000) + DIAMOND + 'a'.repeat(after)
      const { text: clipped } = clip(text, limit)
      assert.doesNotMatch(clipped, LONE, `limit ${limit}, emoji ${after} from the end`)
      const [head, rest] = clipped.split('\n… [')
      const [count, tail] = rest.split(' characters omitted] …\n')
      assert.equal(head.length + Number(count) + tail.length, text.length)
    }
  }
  // The case from issue #35: the tail starts with the whole emoji instead of its low half.
  const issue = 'a'.repeat(1049) + DIAMOND + 'b'.repeat(4000)
  const tail = clip(issue, 1500).text.split('omitted] …\n')[1]
  assert.ok(tail.startsWith('b'))
})

test('a compact transcript page of emoji-heavy payloads is well-formed', () => {
  const list = Array.from({ length: 300 }, (_, index) => `${DIAMOND} **plugin-${index}**: https://example.com/${index}`).join('\n')
  const source = {
    session: { id: 'source', cwd: '' },
    events: [
      { seq: 0, time: 0, type: 'user/message', data: { id: 'u', role: 'user', content: [{ type: 'text', text: 'list plugins' }], source: { kind: 'user' } } },
      { seq: 1, time: 1, type: 'tool/call', data: { callId: 'c', name: 'read', arguments: JSON.stringify({ path: list }) } },
      { seq: 2, time: 2, type: 'tool/result', data: { message: { toolCallId: 'c', content: [{ type: 'text', text: list }], isError: false } } },
      { seq: 3, time: 3, type: 'assistant/message', data: { turn: 1, message: { id: 'a', role: 'assistant', content: [{ type: 'text', text: list }] } } },
    ],
  }
  for (const maxBytes of [400, 4000, 50_000]) {
    const page = formatSourceTranscript(source, { includeReasoning: false, maxBytes, detail: 'compact' })
    assert.doesNotMatch(page.markdown, LONE, `maxBytes ${maxBytes}`)
    // The model API's strict JSON parser accepts the serialized page.
    assert.doesNotMatch(JSON.stringify(page.markdown), /\\ud[89a-f][0-9a-f]{2}/iu)
  }
})

test('text already carrying a lone surrogate reaches the model replaced, not raw', () => {
  const source = {
    session: { id: 'source', cwd: '' },
    events: [{ seq: 0, time: 0, type: 'user/message', data: { id: 'u', role: 'user', content: [{ type: 'text', text: 'broken \udd39 text' }], source: { kind: 'user' } } }],
  }
  const page = formatSourceTranscript(source, { includeReasoning: false, maxBytes: 4000, detail: 'compact' })
  assert.doesNotMatch(page.markdown, LONE)
  assert.match(page.markdown, /broken \uFFFD text/u)
})

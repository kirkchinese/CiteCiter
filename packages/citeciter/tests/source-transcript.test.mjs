import assert from 'node:assert/strict'
import test from 'node:test'

import { formatSourceTranscript, sourceWindowStart } from '../lib/types/source-transcript.js'
import { unifiedLineDiff } from '../lib/types/line-diff.js'

const sourceId = 'source-session'
const page = (source, options = {}) => formatSourceTranscript(source, { includeReasoning: false, maxBytes: 100_000, detail: 'compact', ...options })

function user(seq, text, kind = 'user') {
  return { seq, time: seq, type: 'user/message', data: { id: `user-${seq}`, role: 'user', source: { kind }, content: [{ type: 'text', text }] }, surfaceOp: 'append' }
}

function assistant(seq, text, reasoning = 'private reasoning') {
  return {
    seq, time: seq, type: 'assistant/message',
    data: { turn: 1, step: 1, message: { id: `assistant-${seq}`, role: 'assistant', source: { kind: 'model', provider: 'test', model: 'test' }, content: [{ type: 'reasoning', text: reasoning }, { type: 'text', text }] } },
    surfaceOp: 'append',
  }
}

function toolCall(seq, callId, name, args = {}) {
  return { seq, time: seq, type: 'tool/call', data: { turn: 1, step: 1, callId, name, arguments: JSON.stringify(args) } }
}

function toolResult(seq, callId, text, meta) {
  return {
    seq, time: seq, type: 'tool/result',
    data: {
      turn: 1, step: 1,
      message: { id: `result-${seq}`, role: 'user', source: { kind: 'tool', callId }, content: [{ type: 'tool-result', toolCallId: callId, content: text === '' ? [] : [{ type: 'text', text }] }] },
      ...(meta === undefined ? {} : { meta }),
    },
    surfaceOp: 'append',
  }
}

function fixture() {
  return {
    session: { id: sourceId },
    events: [
      { seq: 0, time: 0, type: 'turn/start', data: { turn: 1 } },
      user(1, 'Inspect this'),
      user(2, 'injected runtime context', 'runtime-context'),
      { seq: 3, time: 3, type: 'step/start', data: { turn: 1, step: 1 } },
      { seq: 4, time: 4, type: 'assistant/chunk', data: { turn: 1, step: 1, chunk: { type: 'reasoning-delta', index: 0, text: 'partial' } } },
      assistant(5, 'I will inspect it.', 'Need the source file.'),
      toolCall(6, 'call-1', 'read', { path: 'a.ts' }),
      toolResult(7, 'call-1', 'file contents'),
      { seq: 8, time: 8, type: 'step/end', data: { turn: 1, step: 1 } },
      { seq: 9, time: 9, type: 'turn/end', data: { turn: 1, reason: { kind: 'completed' } } },
    ],
  }
}

test('a transcript page renders seq-anchored messages and tool records, filtering noise', () => {
  const result = page(fixture())
  assert.equal(result.records, 4)
  assert.equal(result.capturedThroughSeq, 9)
  assert.equal(result.hasMore, false)
  assert.equal(result.truncated, false)
  assert.match(result.markdown, /^Source session source-session · seq 0–9 · latest seq 9 · 4 records · detail compact/u)
  assert.match(result.markdown, /# User · seq 1\nInspect this/u)
  assert.match(result.markdown, /# Assistant · seq 5\nI will inspect it\./u)
  assert.match(result.markdown, /## Tool call · read · seq 6\n- path: a\.ts/u)
  assert.match(result.markdown, /### Tool result · read · seq 7\n```\nfile contents\n```/u)
  assert.doesNotMatch(result.markdown, /injected runtime context|partial|private reasoning|Need the source file/u)
  assert.match(result.markdown, /End of the source as of this read/u)
})

test('reasoning is a quoted block only when allowed', () => {
  const result = page(fixture(), { includeReasoning: true })
  assert.match(result.markdown, /# Assistant · seq 5\n> Reasoning:\n> Need the source file\.\nI will inspect it\./u)
})

test('fences outgrow backtick runs inside payloads', () => {
  const source = { session: { id: sourceId }, events: [toolCall(1, 'c', 'bash', { command: 'echo' }), toolResult(2, 'c', 'before\n````\ninside\n````\nafter')] }
  const result = page(source)
  assert.match(result.markdown, /`````\nbefore\n````\ninside\n````\nafter\n`````/u)
})

test('compact detail shortens tool payloads with a re-read hint; full detail keeps them', () => {
  const long = `${'a'.repeat(3000)}TAIL`
  const source = { session: { id: sourceId }, events: [toolCall(1, 'c', 'write', { file_path: 'x.ts', content: long }), toolResult(2, 'c', long)] }
  const compact = page(source)
  assert.equal(compact.shortened, true)
  assert.match(compact.markdown, /characters omitted/u)
  assert.match(compact.markdown, /TAIL/u)
  assert.match(compact.markdown, /detail: "full"/u)
  const full = page(source, { detail: 'full' })
  assert.equal(full.shortened, false)
  assert.equal(full.markdown.includes(long), true)
})

test('edit results carrying diff meta render unified hunks', () => {
  const oldText = 'one\ntwo\nthree\nfour\n'
  const newText = 'one\ntwo\nTHREE\nfour\n'
  const source = { session: { id: sourceId }, events: [toolCall(1, 'c', 'edit', { file_path: 'a.ts' }), toolResult(2, 'c', 'Edited a.ts', { diffs: [{ path: 'a.ts', oldText, newText }] })] }
  const result = page(source)
  assert.match(result.markdown, /a\.ts:\n```diff\n@@ -1,4 \+1,4 @@\n one\n two\n-three\n\+THREE\n four\n```/u)
  assert.match(result.markdown, /Edited a\.ts/u)
})

test('the page budget stops before a record that does not fit and names the next seq', () => {
  const source = { session: { id: sourceId }, events: [assistant(1, 'x'.repeat(400)), assistant(2, 'y'.repeat(400)), assistant(3, 'z')] }
  const first = page(source, { maxBytes: 860 })
  assert.equal(first.records, 2)
  assert.equal(first.truncated, true)
  assert.equal(first.nextFromSeq, 3)
  assert.match(first.markdown, /call read_source_session with fromSeq: 3\./u)
  const rest = page(source, { fromSeq: first.nextFromSeq, maxBytes: 860 })
  assert.equal(rest.records, 1)
  assert.equal(rest.hasMore, false)
})

test('a record larger than the whole page is shortened to fit instead of dropped', () => {
  const source = { session: { id: sourceId }, events: [assistant(1, `${'曲'.repeat(5000)}END`), assistant(2, 'after')] }
  const first = page(source, { maxBytes: 4000 })
  assert.equal(first.records >= 1, true)
  assert.equal(first.capturedThroughSeq >= 1, true)
  assert.equal(first.shortened, true)
  assert.equal(first.bytesUsed <= 4000, true)
  assert.match(first.markdown, /END/u)
})

test('a page too small for any record still advances its cursor', () => {
  const result = page({ session: { id: sourceId }, events: [assistant(3, 'large')] }, { maxBytes: 4 })
  assert.equal(result.records, 0)
  assert.equal(result.capturedThroughSeq, 3)
  assert.equal(result.truncated, true)
})

test('a throughSeq cap bounds one call without hiding later growth', () => {
  const source = { session: { id: sourceId }, events: [assistant(1, 'one'), assistant(2, 'two'), assistant(3, 'three')] }
  const capped = page(source, { throughSeq: 2 })
  assert.equal(capped.records, 2)
  assert.equal(capped.hasMore, true)
  assert.equal(capped.nextFromSeq, 3)
  assert.throws(() => page(source, { fromSeq: 3, throughSeq: 2 }), /throughSeq/u)
})

test('automatic windows prefer the newest records, or those leading to an anchor', () => {
  const source = { session: { id: sourceId }, events: [assistant(1, 'a'.repeat(300)), assistant(2, 'b'.repeat(300)), assistant(3, 'c'.repeat(300)), assistant(4, 'd'.repeat(300))] }
  assert.equal(sourceWindowStart(source, { includeReasoning: false, maxBytes: 700 }), 3)
  assert.equal(sourceWindowStart(source, { includeReasoning: false, maxBytes: 700, endSeq: 2 }), 1)
  assert.equal(sourceWindowStart(source, { includeReasoning: false, maxBytes: 10_000, afterSeq: 2 }), 3)
  assert.equal(sourceWindowStart(source, { includeReasoning: false, maxBytes: 10_000, afterSeq: 4 }), 5)
})

test('line diffs show changed hunks with context and stay bounded', () => {
  assert.equal(unifiedLineDiff('a\nb\n', 'a\nb\n'), '')
  assert.equal(unifiedLineDiff('a\nb\nc\n', 'a\nc\n'), '@@ -1,3 +1,2 @@\n a\n-b\n c')
  const many = Array.from({ length: 20 }, (_, index) => `line ${index}`)
  const changed = many.map((line, index) => index === 2 || index === 17 ? `${line}!` : line)
  const diff = unifiedLineDiff(many.join('\n'), changed.join('\n'))
  assert.equal(diff.split('\n').filter(line => line.startsWith('@@')).length, 2)
  assert.equal(unifiedLineDiff('x\n'.repeat(10), 'y\n'.repeat(10), { maxCells: 50 }), null)
})

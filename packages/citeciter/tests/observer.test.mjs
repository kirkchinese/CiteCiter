import assert from 'node:assert/strict'
import test from 'node:test'

import {
  fingerprintCitationDraft,
  formatSourceSessionRead,
  resolveObserverCitation,
  validateObserverCitation,
} from '../lib/types/observer.js'

const sourceId = 'source-session'

function assistant(seq, text, reasoning = 'private reasoning') {
  return {
    seq,
    time: seq,
    type: 'assistant/message',
    data: {
      turn: 1,
      step: 1,
      message: {
        id: `assistant-${seq}`,
        role: 'assistant',
        source: { kind: 'model', provider: 'test', model: 'test' },
        content: [
          { type: 'reasoning', text: reasoning },
          { type: 'text', text },
        ],
      },
    },
    surfaceOp: 'append',
  }
}

function draftFor(text, sourceText) {
  const startOffset = text.indexOf(sourceText)
  const draft = {
    sourceSessionId: sourceId,
    anchorSeq: 3,
    startOffset,
    endOffset: startOffset + sourceText.length,
    sourceText,
    displayText: sourceText,
    prefixText: text.slice(Math.max(0, startOffset - 5), startOffset),
    suffixText: text.slice(startOffset + sourceText.length, startOffset + sourceText.length + 5),
  }
  return { ...draft, selectionFingerprint: fingerprintCitationDraft(draft) }
}

test('a committed assistant/message is citable while its step and turn remain open', () => {
  const text = 'Alpha 😀 curvature omega'
  const citation = draftFor(text, '😀 curvature')
  const source = {
    session: { id: sourceId },
    events: [
      { seq: 0, time: 0, type: 'turn/start', data: { turn: 1 } },
      { seq: 1, time: 1, type: 'step/start', data: { turn: 1, step: 1 } },
      { seq: 2, time: 2, type: 'assistant/chunk', data: { turn: 1, step: 1, chunk: { type: 'text-delta', index: 0, text } } },
      assistant(3, text),
      { seq: 4, time: 4, type: 'tool/call', data: { turn: 1, step: 1, callId: 'call-1', name: 'read', arguments: '{}' } },
    ],
  }

  const first = validateObserverCitation(source, citation)
  const second = validateObserverCitation(source, citation)
  assert.equal(first.assistantMessageSeq, 3)
  assert.equal(first.assistantVisibleText, text)
  assert.equal(first.contentFingerprint, citation.selectionFingerprint)
  assert.deepEqual(second, first)
  assert.notEqual(second.citation, first.citation)
})

test('the Host resolves inherited rendered Markdown without trusting the browser projection', () => {
  const text = '缺口真实存在且被正确保持为 false：`ACC-002/003/004` 与 `single_nx20_continuous_profile_signed=false`。'
  const source = { session: { id: sourceId }, events: [assistant(681179, text)] }
  const resolved = resolveObserverCitation(source, {
    sourceSessionId: sourceId,
    anchorSeq: 681179,
    displayText: 'single_nx20_continuous_profile_signed=false',
    prefixText: 'ACC-002/003/004 与 ',
    suffixText: '。',
  })

  assert.equal(resolved.citation.sourceText, 'single_nx20_continuous_profile_signed=false')
  assert.equal(resolved.citation.startOffset, 'private reasoning\n\n'.length + text.indexOf('single_nx20'))
  assert.equal(resolved.citation.displayText, 'single_nx20_continuous_profile_signed=false')
  assert.equal(resolved.contentFingerprint, fingerprintCitationDraft({
    ...resolved.citation,
    selectionFingerprint: undefined,
  }))
})

test('the Host resolves committed reasoning-only and mixed reasoning-answer selections', () => {
  const reasoningOnly = resolveObserverCitation({
    session: { id: sourceId },
    events: [assistant(12, '', 'Need the source.')],
  }, {
    sourceSessionId: sourceId,
    anchorSeq: 12,
    displayText: 'Need the source',
    prefixText: '',
    suffixText: '.',
  })
  assert.equal(reasoningOnly.citation.sourceText, 'Need the source')
  assert.equal(reasoningOnly.citation.startOffset, 0)

  const mixed = resolveObserverCitation({
    session: { id: sourceId },
    events: [assistant(13, 'Final answer.', 'First thought.')],
  }, {
    sourceSessionId: sourceId,
    anchorSeq: 13,
    displayText: 'thought.\n\nFinal',
    prefixText: 'First ',
    suffixText: ' answer.',
  })
  assert.equal(mixed.citation.sourceText, 'thought.\n\nFinal')
  assert.equal(validateObserverCitation({
    session: { id: sourceId },
    events: [assistant(13, 'Final answer.', 'First thought.')],
  }, mixed.citation).assistantVisibleText, 'First thought.\n\nFinal answer.')
})

test('chunk-only, stale text, invalid UTF-16 offsets, and forged fingerprints are rejected', () => {
  const text = 'Alpha curvature omega'
  const citation = draftFor(text, 'curvature')
  const chunkOnly = {
    session: { id: sourceId },
    events: [{
      seq: 3,
      time: 3,
      type: 'assistant/chunk',
      data: { turn: 1, step: 1, chunk: { type: 'text-delta', index: 0, text } },
    }],
  }
  assert.throws(() => validateObserverCitation(chunkOnly, citation), /committed assistant\/message/)

  const source = { session: { id: sourceId }, events: [assistant(3, text)] }
  assert.throws(
    () => validateObserverCitation(source, { ...citation, sourceText: 'curvaturf' }),
    /offsets and sourceText/,
  )
  assert.throws(
    () => validateObserverCitation(source, { ...citation, endOffset: citation.endOffset + 1 }),
    /offsets and sourceText/,
  )
  assert.throws(
    () => validateObserverCitation(source, { ...citation, selectionFingerprint: '0'.repeat(64) }),
    /content fingerprint/,
  )
})

function sourceReadFixture() {
  return {
    session: { id: sourceId },
    events: [
      { seq: 0, time: 0, type: 'turn/start', data: { turn: 1 } },
      {
        seq: 1,
        time: 1,
        type: 'user/message',
        data: {
          id: 'user-1',
          role: 'user',
          source: { kind: 'user' },
          content: [{ type: 'text', text: 'Inspect this' }],
        },
        surfaceOp: 'append',
      },
      { seq: 2, time: 2, type: 'step/start', data: { turn: 1, step: 1 } },
      { seq: 3, time: 3, type: 'assistant/chunk', data: { turn: 1, step: 1, chunk: { type: 'reasoning-delta', index: 0, text: 'partial' } } },
      assistant(4, 'I will inspect it.', 'Need the source file.'),
      { seq: 5, time: 5, type: 'tool/call', data: { turn: 1, step: 1, callId: 'call-1', name: 'read', arguments: '{"path":"a.ts"}' } },
      {
        seq: 6,
        time: 6,
        type: 'tool/result',
        data: {
          turn: 1,
          step: 1,
          message: {
            id: 'result-1',
            role: 'user',
            source: { kind: 'tool', callId: 'call-1' },
            content: [{
              type: 'tool-result',
              toolCallId: 'call-1',
              content: [{ type: 'text', text: 'file contents' }],
            }],
          },
        },
        surfaceOp: 'append',
      },
      { seq: 7, time: 7, type: 'step/end', data: { turn: 1, step: 1 } },
      { seq: 8, time: 8, type: 'turn/end', data: { turn: 1, reason: { kind: 'completed' } } },
      { seq: 9, time: 9, type: 'session/title', data: { title: 'Ignored', messageSeqs: [], source: { kind: 'fallback' } } },
    ],
  }
}

test('source reads format useful evidence, omit chunks, and gate reasoning', () => {
  const source = sourceReadFixture()
  const withReasoning = formatSourceSessionRead(source, {
    includeReasoning: true,
    maxBytes: 100_000,
  })
  assert.deepEqual(withReasoning.events.map((event) => event.type), [
    'turn/start',
    'user/message',
    'step/start',
    'assistant/message',
    'tool/call',
    'tool/result',
    'step/end',
    'turn/end',
  ])
  assert.equal(withReasoning.events.find((event) => event.type === 'assistant/message').reasoning, 'Need the source file.')
  assert.equal(withReasoning.events.find((event) => event.type === 'tool/result').content[0].text, 'file contents')
  assert.equal(withReasoning.capturedThroughSeq, 9)
  assert.equal(withReasoning.availableThroughSeq, 9)
  assert.equal(withReasoning.truncated, false)

  const withoutReasoning = formatSourceSessionRead(source, {
    fromSeq: 2,
    throughSeq: 6,
    includeReasoning: false,
    maxBytes: 100_000,
  })
  const answer = withoutReasoning.events.find((event) => event.type === 'assistant/message')
  assert.equal('reasoning' in answer, false)
  assert.equal(withoutReasoning.capturedThroughSeq, 6)
  assert.equal(withoutReasoning.availableThroughSeq, 6)
  assert.equal(withoutReasoning.truncated, false)
})

test('source-read byte limits stop before the first event that does not fit', () => {
  const source = sourceReadFixture()
  const complete = formatSourceSessionRead(source, {
    includeReasoning: true,
    maxBytes: 100_000,
  })
  const oneEventBytes = Math.max(
    Buffer.byteLength(JSON.stringify([complete.events[0]]), 'utf8'),
    Buffer.byteLength(JSON.stringify([complete.events[1]]), 'utf8'),
  )
  const bounded = formatSourceSessionRead(source, {
    includeReasoning: true,
    maxBytes: oneEventBytes,
  })

  assert.deepEqual(bounded.events, [complete.events[0]])
  assert.equal(Buffer.byteLength(JSON.stringify(bounded.events), 'utf8') <= oneEventBytes, true)
  assert.equal(bounded.capturedThroughSeq, 0)
  assert.equal(bounded.availableThroughSeq, 9)
  assert.equal(bounded.truncated, true)
})

test('oversized source events become bounded placeholders that preserve progress', () => {
  const bigAssistant = (seq) => assistant(seq, 'x'.repeat(2_000))
  const source = {
    session: { id: sourceId },
    events: [
      bigAssistant(430),
      assistant(431, 'after first'),
      assistant(432, 'after second'),
    ],
  }
  const placeholder = { type: 'assistant/message', seq: 430, oversized: true }
  const firstNormal = { type: 'assistant/message', seq: 431, turn: 1, step: 1, text: 'after first' }
  const first = formatSourceSessionRead(source, {
    fromSeq: 430,
    includeReasoning: false,
    maxBytes: Buffer.byteLength(JSON.stringify([placeholder, firstNormal]), 'utf8') - 1,
  })
  assert.deepEqual(first.events, [placeholder])
  assert.equal(first.capturedThroughSeq, 430)
  assert.equal(first.availableThroughSeq, 432)
  assert.equal(first.truncated, true)
  assert.equal(Buffer.byteLength(JSON.stringify(first.events), 'utf8') <= Buffer.byteLength(JSON.stringify([placeholder, firstNormal]), 'utf8'), true)

  const rest = formatSourceSessionRead(source, {
    fromSeq: 431,
    includeReasoning: false,
    maxBytes: 100_000,
  })
  assert.deepEqual(rest.events.map((event) => event.seq), [431, 432])
  assert.equal(rest.capturedThroughSeq, 432)
  assert.equal(rest.truncated, false)
})

test('consecutive oversized events advance by at least one seq per returned page', () => {
  const source = {
    session: { id: sourceId },
    events: [
      assistant(10, 'x'.repeat(2_000)),
      assistant(11, 'y'.repeat(2_000)),
      assistant(12, 'done'),
    ],
  }
  const firstPlaceholder = { type: 'assistant/message', seq: 10, oversized: true }
  const secondPlaceholder = { type: 'assistant/message', seq: 11, oversized: true }
  const normal = { type: 'assistant/message', seq: 12, turn: 1, step: 1, text: 'done' }
  const first = formatSourceSessionRead(source, {
    fromSeq: 10,
    includeReasoning: false,
    maxBytes: Buffer.byteLength(JSON.stringify([firstPlaceholder, secondPlaceholder, normal]), 'utf8') - 1,
  })
  assert.deepEqual(first.events, [firstPlaceholder, secondPlaceholder])
  assert.equal(first.capturedThroughSeq, 11)
  assert.equal(first.truncated, true)

  const next = formatSourceSessionRead(source, {
    fromSeq: first.capturedThroughSeq + 1,
    includeReasoning: false,
    maxBytes: 100_000,
  })
  assert.equal(next.events[0]?.seq, 12)
  assert.equal(next.events[0]?.text, 'done')
  assert.equal(next.events[0]?.oversized, undefined)
  assert.equal(next.capturedThroughSeq, 12)
  assert.equal(next.truncated, false)
})

test('an event exactly equal to the UTF-8 page limit remains complete', () => {
  const source = {
    session: { id: sourceId },
    events: [assistant(3, '曲率😀')],
  }
  const complete = formatSourceSessionRead(source, {
    includeReasoning: false,
    maxBytes: 100_000,
  })
  const exact = formatSourceSessionRead(source, {
    includeReasoning: false,
    maxBytes: Buffer.byteLength(JSON.stringify(complete.events), 'utf8'),
  })
  assert.deepEqual(exact.events, complete.events)
  assert.equal(Buffer.byteLength(JSON.stringify(exact.events), 'utf8') > 0, true)
  assert.equal(exact.capturedThroughSeq, 3)
  assert.equal(exact.truncated, false)
})

test('an exact-limit middle event waits for an empty page instead of becoming oversized', () => {
  const firstEvent = assistant(2, 'first')
  const exactEvent = assistant(3, '😀'.repeat(256))
  const exactAlone = formatSourceSessionRead({ session: { id: sourceId }, events: [exactEvent] }, {
    includeReasoning: false,
    maxBytes: 100_000,
  })
  const maxBytes = Buffer.byteLength(JSON.stringify(exactAlone.events), 'utf8')
  const firstPage = formatSourceSessionRead({ session: { id: sourceId }, events: [firstEvent, exactEvent] }, {
    includeReasoning: false,
    maxBytes,
  })
  assert.deepEqual(firstPage.events.map((event) => event.seq), [2])
  assert.equal(firstPage.capturedThroughSeq, 2)
  assert.equal(firstPage.truncated, true)

  const secondPage = formatSourceSessionRead({ session: { id: sourceId }, events: [firstEvent, exactEvent] }, {
    fromSeq: 3,
    includeReasoning: false,
    maxBytes,
  })
  assert.deepEqual(secondPage.events, exactAlone.events)
  assert.equal(secondPage.capturedThroughSeq, 3)
  assert.equal(secondPage.truncated, false)
})

test('UTF-8 byte limits distinguish an exact event from one byte under budget', () => {
  const source = { session: { id: sourceId }, events: [assistant(3, '曲率😀'.repeat(128))] }
  const complete = formatSourceSessionRead(source, { includeReasoning: false, maxBytes: 100_000 })
  const exactBytes = Buffer.byteLength(JSON.stringify(complete.events), 'utf8')
  const exact = formatSourceSessionRead(source, { includeReasoning: false, maxBytes: exactBytes })
  const under = formatSourceSessionRead(source, { includeReasoning: false, maxBytes: exactBytes - 1 })
  assert.deepEqual(exact.events, complete.events)
  assert.deepEqual(under.events, [{ type: 'assistant/message', seq: 3, oversized: true }])
  assert.equal(under.capturedThroughSeq, 3)
})

test('a page too small for the oversized placeholder still advances its cursor', () => {
  const source = { session: { id: sourceId }, events: [assistant(3, 'large')] }
  const result = formatSourceSessionRead(source, { includeReasoning: false, maxBytes: 2 })
  assert.deepEqual(result.events, [])
  assert.equal(result.capturedThroughSeq, 3)
  assert.equal(result.truncated, true)
})

test('fixed boundaries hide later source growth while Observer pages can advance into it', () => {
  const initial = {
    session: { id: sourceId },
    events: [assistant(1, 'one'), assistant(2, 'two')],
  }
  const grown = { ...initial, events: [...initial.events, assistant(3, 'three')] }
  const exact = formatSourceSessionRead(grown, {
    throughSeq: 2,
    includeReasoning: false,
    maxBytes: 100_000,
  })
  assert.deepEqual(exact.events.map((event) => event.seq), [1, 2])
  assert.equal(exact.availableThroughSeq, 2)

  const observer = formatSourceSessionRead(grown, {
    fromSeq: 3,
    includeReasoning: false,
    maxBytes: 100_000,
  })
  assert.deepEqual(observer.events.map((event) => event.seq), [3])
  assert.equal(observer.availableThroughSeq, 3)
})

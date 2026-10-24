import assert from 'node:assert/strict'
import test from 'node:test'

import {
  fingerprintCitationDraft,
  fingerprintCitationRecord,
  projectDiffMeta,
  projectToolResultText,
  resolveDocumentEvidence,
  resolveObserverCitation,
  resolveToolEvidence,
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

test('a committed assistant/message is citable while its step and turn remain open', () => {
  const text = 'Alpha 😀 curvature omega'
  const claim = { sourceSessionId: sourceId, anchorSeq: 3, displayText: '😀 curvature', prefixText: 'Alpha ', suffixText: ' omega' }
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

  const first = resolveObserverCitation(source, claim)
  const second = resolveObserverCitation(source, claim)
  assert.equal(first.assistantMessageSeq, 3)
  assert.equal(first.citation.sourceText, '😀 curvature')
  assert.equal(first.citation.startOffset, 'private reasoning\n\n'.length + text.indexOf('😀'))
  assert.equal(first.contentFingerprint, first.citation.selectionFingerprint)
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
  assert.equal(mixed.assistantVisibleText, 'First thought.\n\nFinal answer.')
})

test('chunk-only events and quotes missing from the committed message are rejected', () => {
  const text = 'Alpha curvature omega'
  const claim = { sourceSessionId: sourceId, anchorSeq: 3, displayText: 'curvature', prefixText: 'Alpha ', suffixText: ' omega' }
  const chunkOnly = {
    session: { id: sourceId },
    events: [{
      seq: 3,
      time: 3,
      type: 'assistant/chunk',
      data: { turn: 1, step: 1, chunk: { type: 'text-delta', index: 0, text } },
    }],
  }
  assert.throws(() => resolveObserverCitation(chunkOnly, claim), /committed assistant\/message/)

  const source = { session: { id: sourceId }, events: [assistant(3, text)] }
  assert.throws(() => resolveObserverCitation(source, { ...claim, displayText: 'curvaturf' }))
  assert.throws(() => resolveObserverCitation(source, { ...claim, sourceSessionId: 'other-session' }), /sourceSessionId/)
  assert.throws(() => resolveObserverCitation(source, { ...claim, anchorSeq: 4 }), /committed assistant\/message/)
})

function toolCall(seq, callId, name) {
  return {
    seq,
    time: seq,
    type: 'tool/call',
    data: { turn: 1, step: 1, callId, name, arguments: '{}' },
  }
}

function toolResult(seq, callId, text, meta) {
  return {
    seq,
    time: seq,
    type: 'tool/result',
    data: {
      turn: 1,
      step: 1,
      message: {
        id: `result-${seq}`,
        role: 'user',
        source: { kind: 'tool', callId },
        content: [{
          type: 'tool-result',
          toolCallId: callId,
          content: text === '' ? [] : [{ type: 'text', text }],
        }],
      },
      ...(meta === undefined ? {} : { meta }),
    },
    surfaceOp: 'append',
  }
}

test('a committed tool result becomes whole-card result-text EvidenceRef', () => {
  const source = {
    session: { id: sourceId },
    events: [toolCall(5, 'call-1', 'bash'), toolResult(6, 'call-1', 'tool output')],
  }
  const resolved = resolveToolEvidence(source, {
    sourceSessionId: sourceId,
    callId: 'call-1',
    displayText: 'tool output',
  })
  assert.deepEqual(resolved.evidence.entry, {
    kind: 'tool-result',
    anchorSeq: 6,
    callId: 'call-1',
    toolName: 'bash',
    projection: 'result-text',
  })
  assert.equal(resolved.evidence.anchorSeq, 6)
  assert.equal(resolved.evidence.sourceText, 'tool output')
  assert.equal(resolved.evidence.startOffset, 0)
  assert.equal(resolved.evidence.endOffset, 'tool output'.length)
  assert.equal(resolved.evidence.prefixText, '')
  assert.equal(resolved.evidence.suffixText, '')
  assert.match(fingerprintCitationRecord(resolved.evidence), /^[a-f0-9]{64}$/)
  assert.equal(projectToolResultText([{ type: 'text', text: 'a' }, { type: 'image', text: 'skip' }, null, { type: 'text', text: 'b' }]), 'ab')
})

test('a part selected in a rendered tool card is accepted without its line-number gutter', () => {
  const read = '<path>calc.js</path>\n<content>\n1: // Tiny calculator\n2: function add(a, b) {\n3:   return a + b\n4: }\n</content>'
  const source = { session: { id: sourceId }, events: [toolCall(5, 'call-1', 'read'), toolResult(6, 'call-1', read)] }
  const resolved = resolveToolEvidence(source, { sourceSessionId: sourceId, callId: 'call-1', displayText: 'function add(a, b) {\n  return a + b' })
  assert.equal(resolved.evidence.displayText, 'function add(a, b) {\n  return a + b')
  assert.equal(resolved.evidence.sourceText, read)
  assert.throws(() => resolveToolEvidence(source, { sourceSessionId: sourceId, callId: 'call-1', displayText: 'function subtract' }), /does not match/u)
})

test('tool evidence rejects wrong sessions, missing calls, mismatched text, and empty results', () => {
  const source = {
    session: { id: sourceId },
    events: [toolCall(5, 'call-1', 'bash'), toolResult(6, 'call-1', 'tool output')],
  }
  assert.throws(
    () => resolveToolEvidence(source, { sourceSessionId: 'other-session', callId: 'call-1', displayText: 'tool output' }),
    /does not match the observed source Session/u,
  )
  assert.throws(
    () => resolveToolEvidence(source, { sourceSessionId: sourceId, callId: 'missing', displayText: 'tool output' }),
    /does not identify a committed tool\/result/u,
  )
  assert.throws(
    () => resolveToolEvidence(source, { sourceSessionId: sourceId, callId: 'call-1', displayText: 'forged text' }),
    /does not match the committed tool result text/u,
  )
  const empty = {
    session: { id: sourceId },
    events: [toolCall(5, 'call-2', 'read'), toolResult(6, 'call-2', '')],
  }
  assert.throws(
    () => resolveToolEvidence(empty, { sourceSessionId: sourceId, callId: 'call-2', displayText: ' ' }),
    /no citable text/u,
  )
})

test('document-range evidence re-resolves the Reader quote against the stored text', () => {
  const content = '第一章 平行移动\n第二章 曲率与 holonomy'
  const resolved = resolveDocumentEvidence(content, {
    sourceSessionId: sourceId,
    documentId: 'document-1',
    displayText: '曲率与 holonomy',
    prefixText: '第二章 ',
    suffixText: '',
  })
  assert.equal(resolved.evidence.anchorSeq, 0)
  assert.deepEqual(resolved.evidence.entry, {
    kind: 'document-range',
    documentId: 'document-1',
    startOffset: content.indexOf('曲率'),
    endOffset: content.indexOf('曲率') + '曲率与 holonomy'.length,
  })
  assert.equal(resolved.evidence.sourceText, '曲率与 holonomy')
  assert.equal(resolved.evidence.displayText, '曲率与 holonomy')
  assert.throws(
    () => resolveDocumentEvidence(content, {
      sourceSessionId: sourceId,
      documentId: 'document-1',
      displayText: '不存在的段落',
      prefixText: '',
      suffixText: '',
    }),
    /选区无法映射/u,
  )
})

test('document selections preserve literal Markdown, code and full-text boundaries', () => {
  const content = '# Heading\n\n**bold** [link](https://example.com)\n\n```js\nconst x = "<tag>";\n```\n'
  for (const quote of [content.trim(), '# Heading', '**bold**', '[link](https://example.com)', 'const x = "<tag>";', '```js']) {
    const start = content.indexOf(quote)
    const resolved = resolveDocumentEvidence(content, { sourceSessionId: sourceId, documentId: 'document-1', displayText: quote, prefixText: content.slice(0, start), suffixText: content.slice(start + quote.length) })
    assert.equal(resolved.evidence.sourceText, quote)
    assert.equal(resolved.evidence.entry.startOffset, start)
    assert.equal(resolved.evidence.entry.endOffset, start + quote.length)
  }
})

test('literal document context distinguishes Markdown punctuation and rejects ambiguous quotes', () => {
  const content = '**same**\n__same__'
  const claim = { sourceSessionId: sourceId, documentId: 'document-1', displayText: 'same', prefixText: '__', suffixText: '__' }
  assert.equal(resolveDocumentEvidence(content, claim).evidence.entry.startOffset, content.lastIndexOf('same'))
  assert.throws(() => resolveDocumentEvidence(content, { ...claim, prefixText: '', suffixText: '' }), /无法唯一映射/u)
  assert.throws(() => resolveDocumentEvidence('[label](target)', { ...claim, displayText: 'labeltarget' }), /无法映射/u)
})

test('a selection in rendered Markdown resolves inside the blocks the reader reported', () => {
  const content = '# Guide\n\nThe **same** phrase.\n\nAgain the **same** phrase.'
  const second = content.indexOf('Again')
  const claim = {
    sourceSessionId: sourceId, documentId: 'document-1', displayText: 'same phrase', prefixText: 'Again the ', suffixText: '.',
    sourceRange: { start: second, end: content.length },
  }
  const resolved = resolveDocumentEvidence(content, claim)
  // The range is in the second paragraph, and its source keeps the Markdown emphasis.
  assert.ok(resolved.evidence.entry.startOffset >= second)
  assert.equal(resolved.evidence.sourceText.replaceAll('*', ''), 'same phrase')
  assert.throws(() => resolveDocumentEvidence(content, { ...claim, sourceRange: { start: 0, end: content.length + 5 } }), /无法映射/u)
})

test('terminal and diff projections resolve their dedicated whole-card text', () => {  const terminal = resolveToolEvidence({
    session: { id: sourceId },
    events: [
      toolCall(5, 'call-3', 'terminal_send'),
      toolResult(6, 'call-3', 'pwd\n/home/misaka', { card: 'terminal', output: 'pwd\n/home/misaka' }),
    ],
  }, {
    sourceSessionId: sourceId,
    callId: 'call-3',
    displayText: 'pwd\n/home/misaka',
    projection: 'terminal',
  })
  assert.equal(terminal.evidence.entry.projection, 'terminal')
  assert.equal(terminal.evidence.sourceText, 'pwd\n/home/misaka')

  const diffs = [{ path: 'a.ts', oldText: 'a', newText: 'b' }]
  const diffText = projectDiffMeta({ diffs })
  const diff = resolveToolEvidence({
    session: { id: sourceId },
    events: [
      toolCall(5, 'call-4', 'edit'),
      toolResult(6, 'call-4', '', { diffs }),
    ],
  }, {
    sourceSessionId: sourceId,
    callId: 'call-4',
    displayText: diffText,
    projection: 'diff',
  })
  assert.equal(diff.evidence.entry.projection, 'diff')
  assert.equal(diff.evidence.sourceText, diffText)

  assert.throws(
    () => resolveToolEvidence({
      session: { id: sourceId },
      events: [toolCall(5, 'call-5', 'edit'), toolResult(6, 'call-5', 'plain')],
    }, {
      sourceSessionId: sourceId,
      callId: 'call-5',
      displayText: 'plain',
      projection: 'diff',
    }),
    /no citable diff projection/u,
  )
})

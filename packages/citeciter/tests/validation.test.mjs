import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import test from 'node:test'

import { canonicalCitationIdentity } from '../lib/types/thread.js'
import { validateCitation } from '../lib/types/validation.js'

function makeFixture() {
  const citation = {
    schemaVersion: 1,
    sourceSessionId: 'parent-session',
    anchorKey: 'assistant-key',
    anchorSeq: 2,
    startOffset: 4,
    endOffset: 13,
    selectionFingerprint: '',
    selectedText: 'curvature',
    prefixText: 'The ',
    suffixText: ' tensor',
    createdAt: 1,
  }
  citation.selectionFingerprint = createHash('sha256')
    .update(canonicalCitationIdentity(citation))
    .digest('hex')
  const events = [
    { seq: 0, type: 'turn/start', data: { turn: 1 } },
    { seq: 1, type: 'step/start', data: { turn: 1, step: 1 } },
    {
      seq: 2,
      type: 'assistant/message',
      data: { turn: 1, step: 1, message: { content: [] } },
    },
    { seq: 3, type: 'step/end', data: { turn: 1, step: 1 } },
    { seq: 4, type: 'turn/end', data: { turn: 1, reason: { kind: 'completed' } } },
    { seq: 5, type: 'session/end-seed', data: {} },
  ]
  const agent = {
    session: {
      header: { parentSession: 'parent-session', seedLength: 6 },
      events,
    },
  }
  return { agent, citation, events }
}

test('Host Citation validation requires lineage, completed inherited turn, and exact UTF-16 span', () => {
  const { agent, citation } = makeFixture()
  assert.doesNotThrow(() => validateCitation(agent, citation))

  assert.throws(
    () => validateCitation(agent, { ...citation, sourceSessionId: 'other-parent' }),
    /fork lineage/,
  )
  assert.throws(
    () => validateCitation(agent, { ...citation, endOffset: citation.endOffset + 1 }),
    /offsets are invalid/,
  )
})

test('Host Citation validation rejects open turns and self-inconsistent fingerprints', () => {
  const open = makeFixture()
  open.agent.session.events = open.events.filter((event) => event.type !== 'turn/end')
  assert.throws(
    () => validateCitation(open.agent, open.citation),
    /completed inherited turn/,
  )

  const forged = makeFixture()
  assert.throws(
    () => validateCitation(forged.agent, {
      ...forged.citation,
      selectionFingerprint: '0'.repeat(64),
    }),
    /fingerprint does not match/,
  )
})

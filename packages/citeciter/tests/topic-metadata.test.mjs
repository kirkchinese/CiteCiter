import assert from 'node:assert/strict'
import test from 'node:test'
import { parseTopicMetadataFile, topicMetadataSchema } from '../lib/types/topic.js'

const citationV3 = {
  schemaVersion: 3, sourceSessionId: 'source', anchorSeq: 7, startOffset: 0, endOffset: 5,
  sourceText: 'quote', displayText: 'quote', prefixText: '', suffixText: '',
  selectionFingerprint: 'a'.repeat(64), createdAt: 1,
}

/** A Topic as written by the current runtime into the source-owned directory. */
const current = {
  schemaVersion: 2, hosted: true, storage: 'source', topicId: 3, createRequestId: 'req-1',
  sessionId: 'citeciter-1', sourceSessionId: 'source', sourceCwd: 'E:/work', mode: 'observer',
  scenario: 'qa', documentId: null, citation: null,
  modelConfig: { provider: 'deepseek', model: 'chat', reasoningEffort: 'high' },
  forkThroughSeq: null, temporaryTitle: '新 Topic', cachedTitle: 'Title', cachedTitleSource: 'provider',
  cachedTitleEventSeq: 4, createdAt: 10, updatedAt: 20, archivedAt: null, sourceAvailable: true,
  observedThroughSeq: null, modelSelectionRequired: false,
}

test('records written by the current runtime parse unchanged', () => {
  assert.deepEqual(parseTopicMetadataFile(structuredClone(current)), current)
  assert.deepEqual(topicMetadataSchema.parse(current), current)
})

test('pre-0.8 private records with v3 citations stay readable', () => {
  const legacy = {
    schemaVersion: 1, topicId: 1, sessionId: 'citeciter-old', sourceSessionId: 'source', sourceCwd: '',
    mode: 'exact-fork', citation: citationV3, modelConfig: { provider: 'p', model: 'm', temperature: 0.2 },
    forkThroughSeq: 9, temporaryTitle: 'quote', cachedTitle: null, cachedTitleSource: null,
    createdAt: 1, updatedAt: 2, archivedAt: null, sourceAvailable: false,
  }
  const parsed = parseTopicMetadataFile(legacy)
  assert.equal(parsed.schemaVersion, 2)
  assert.equal(parsed.scenario, 'qa')
  assert.equal(parsed.documentId, null)
  assert.equal(parsed.hosted, undefined)
  assert.equal(parsed.storage, undefined)
  assert.deepEqual(parsed.citation.entry, { kind: 'assistant-message', anchorSeq: 7 })
  assert.equal(parsed.citation.schemaVersion, 4)
})

test('unknown fields and malformed identities are rejected at the reader', () => {
  assert.throws(() => parseTopicMetadataFile({ ...current, unexpected: true }))
  assert.throws(() => parseTopicMetadataFile({ ...current, topicId: 0 }))
  assert.throws(() => parseTopicMetadataFile({ ...current, storage: 'elsewhere' }))
})

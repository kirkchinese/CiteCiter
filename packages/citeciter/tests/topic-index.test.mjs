import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { TopicIndex } from '../lib/types/topic-runtime.js'

function canonicalMetadata(overrides = {}) {
  return {
    schemaVersion: 2,
    topicId: 1,
    createRequestId: 'create-request-1',
    sessionId: 'citeciter-committed',
    sourceSessionId: 'source-session',
    sourceCwd: '/workspace',
    mode: 'observer',
    scenario: 'qa',
    documentId: null,
    citation: {
      schemaVersion: 4,
      sourceSessionId: 'source-session',
      anchorSeq: 2,
      entry: { kind: 'assistant-message', anchorSeq: 2 },
      startOffset: 0,
      endOffset: 5,
      sourceText: 'quote',
      displayText: 'quote',
      prefixText: '',
      suffixText: '',
      selectionFingerprint: 'a'.repeat(64),
      createdAt: 1,
    },
    modelConfig: { provider: 'test', model: 'test' },
    forkThroughSeq: null,
    temporaryTitle: 'quote',
    cachedTitle: null,
    cachedTitleSource: null,
    createdAt: 1,
    updatedAt: 1,
    archivedAt: null,
    sourceAvailable: true,
    ...overrides,
  }
}

function legacyMetadata(overrides = {}) {
  const { entry: _entry, scenario: _scenario, ...canonical } = canonicalMetadata()
  return {
    ...canonical,
    schemaVersion: 1,
    citation: {
      ...canonical.citation,
      schemaVersion: 3,
      entry: undefined,
    },
    ...overrides,
  }
}

test('Topic scans ignore a reserved directory until topic.json is committed', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'citeciter-topic-index-'))
  context.after(() => rm(root, { recursive: true, force: true }))
  const index = new TopicIndex(root)
  await index.reserve('source-session')
  const committed = await index.reserve('source-session')
  const metadata = canonicalMetadata({ topicId: committed.topicId })
  await index.save(metadata)

  assert.deepEqual(await index.list('source-session'), [metadata])
  assert.deepEqual(await index.loadBySessionId(metadata.sessionId), metadata)
  const reopened = new TopicIndex(root)
  assert.equal((await reopened.list('source-session'))[0]?.createRequestId, 'create-request-1')
})

test('legacy v3 Topic metadata normalizes to canonical EvidenceRef and default scenario on load', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'citeciter-topic-index-v3-'))
  context.after(() => rm(root, { recursive: true, force: true }))
  const sourceDirectory = join(root, Buffer.from('source-session', 'utf8').toString('base64url'), '1')
  await mkdir(sourceDirectory, { recursive: true, mode: 0o700 })
  const legacy = legacyMetadata({ topicId: 1, sessionId: 'citeciter-legacy' })
  await writeFile(join(sourceDirectory, 'topic.json'), `${JSON.stringify(legacy)}\n`, { encoding: 'utf8', mode: 0o600 })

  const loaded = await new TopicIndex(root).loadBySessionId('citeciter-legacy')
  assert.equal(loaded.schemaVersion, 2)
  assert.equal(loaded.scenario, 'qa')
  assert.equal(loaded.documentId, null)
  assert.equal(loaded.citation.schemaVersion, 4)
  assert.deepEqual(loaded.citation.entry, { kind: 'assistant-message', anchorSeq: 2 })
  assert.equal(loaded.citation.selectionFingerprint, 'a'.repeat(64))
})

test('v2 Topic metadata stores an explicit null instead of fabricating a Citation', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'citeciter-topic-index-free-'))
  context.after(() => rm(root, { recursive: true, force: true }))
  const index = new TopicIndex(root)
  const reserved = await index.reserve('source-session')
  const metadata = canonicalMetadata({
    topicId: reserved.topicId,
    sessionId: 'citeciter-free',
    citation: null,
    temporaryTitle: '解释当前会话',
  })
  await index.save(metadata)

  assert.deepEqual(await index.loadBySessionId(metadata.sessionId), metadata)
  assert.equal((await index.list('source-session'))[0]?.citation, null)
})

test('a durable deletion marker hides metadata and can be completed after restart', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'citeciter-topic-index-delete-'))
  context.after(() => rm(root, { recursive: true, force: true }))
  const index = new TopicIndex(root)
  const reserved = await index.reserve('source-session')
  const metadata = canonicalMetadata({ topicId: reserved.topicId, sessionId: 'citeciter-delete' })
  await index.save(metadata)
  const marker = await index.markDeleting(metadata, {
    version: 0,
    id: metadata.sessionId,
    createdAt: metadata.createdAt,
    cwd: metadata.sourceCwd,
  })

  assert.deepEqual(await index.list(metadata.sourceSessionId), [])
  await assert.rejects(index.loadBySessionId(metadata.sessionId), /does not exist/u)
  const reopened = new TopicIndex(root)
  assert.deepEqual(await reopened.listDeleting(), [marker])
  await reopened.finishDeleting(marker)
  assert.deepEqual(await reopened.listDeleting(), [])
})

test('Topic metadata with a missing v4 evidence entry or a mismatched anchor is rejected', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'citeciter-topic-index-v4-bad-'))
  context.after(() => rm(root, { recursive: true, force: true }))
  const index = new TopicIndex(root)

  const missingEntry = legacyMetadata({ sessionId: 'missing-entry' })
  const missingEntryCitation = { ...missingEntry.citation, schemaVersion: 4 }
  await assert.rejects(index.save({ ...missingEntry, schemaVersion: 2, citation: missingEntryCitation }), /entry/u)

  const mismatchedAnchor = canonicalMetadata({ sessionId: 'mismatched-anchor' })
  mismatchedAnchor.citation.entry = { kind: 'assistant-message', anchorSeq: 3 }
  await assert.rejects(index.save(mismatchedAnchor), /anchorSeq/u)
})

import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { TopicIndex } from '../lib/types/topic-runtime.js'

test('Topic scans ignore a reserved directory until topic.json is committed', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'citeciter-topic-index-'))
  context.after(() => rm(root, { recursive: true, force: true }))
  const index = new TopicIndex(root)
  await index.reserve('source-session')
  const committed = await index.reserve('source-session')
  const metadata = {
    schemaVersion: 1,
    topicId: committed.topicId,
    createRequestId: 'create-request-1',
    sessionId: 'citeciter-committed',
    sourceSessionId: 'source-session',
    sourceCwd: '/workspace',
    mode: 'observer',
    citation: {
      schemaVersion: 3,
      sourceSessionId: 'source-session',
      anchorSeq: 2,
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
  }
  await index.save(metadata)

  assert.deepEqual(await index.list('source-session'), [metadata])
  assert.deepEqual(await index.loadBySessionId(metadata.sessionId), metadata)
  const reopened = new TopicIndex(root)
  assert.equal((await reopened.list('source-session'))[0]?.createRequestId, 'create-request-1')
})

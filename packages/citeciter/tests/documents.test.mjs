import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { DOCUMENT_CONTENT_MAX_BYTES, DocumentStore } from '../lib/types/documents.js'

test('the document library imports, lists, reads, and pages documents', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'citeciter-documents-'))
  context.after(() => rm(root, { recursive: true, force: true }))
  const store = new DocumentStore(root)
  assert.deepEqual(await store.list(), [])

  const first = await store.import({ title: '论文', format: 'markdown', content: '# 摘要\n正文' })
  const second = await store.import({ title: '笔记', format: 'text', content: 'plain note' })
  assert.equal(first.title, '论文')
  assert.equal(first.format, 'markdown')
  assert.equal(first.size, Buffer.byteLength('# 摘要\n正文', 'utf8'))
  assert.deepEqual((await store.list()).map((document) => document.documentId), [second.documentId, first.documentId])

  const read = await store.read(first.documentId)
  assert.equal(read.content, '# 摘要\n正文')
  assert.equal(read.record.documentId, first.documentId)

  const page = await store.get(first.documentId)
  assert.equal(page.content, '# 摘要\n正文')
  assert.equal(page.truncated, false)

  const large = await store.import({
    title: '大文档',
    format: 'text',
    content: 'x'.repeat(DOCUMENT_CONTENT_MAX_BYTES + 10),
  })
  const truncated = await store.get(large.documentId)
  assert.equal(truncated.truncated, true)
  assert.equal(truncated.content.length, DOCUMENT_CONTENT_MAX_BYTES)
})

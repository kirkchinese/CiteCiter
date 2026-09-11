import assert from 'node:assert/strict'
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises'
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
  const last = await store.get(large.documentId, 1)
  assert.equal(last.page, 1)
  assert.equal(last.pageCount, 2)
  assert.equal(last.content, 'x'.repeat(10))
  assert.equal(last.truncated, false)
  await assert.rejects(store.get(large.documentId, 2), /页码/)
})

test('Unicode pagination preserves every character exactly once across restart', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'citeciter-documents-'))
  context.after(() => rm(root, { recursive: true, force: true }))
  const content = '中😀文\n'.repeat(80_000)
  const saved = await new DocumentStore(root).import({ title: 'Unicode', format: 'text', content })
  const restarted = new DocumentStore(root)
  const first = await restarted.get(saved.documentId)
  let replay = ''
  for (let page = 0; page < first.pageCount; page++) {
    const chunk = await restarted.get(saved.documentId, page)
    assert.ok(Buffer.byteLength(chunk.content) <= DOCUMENT_CONTENT_MAX_BYTES)
    assert.equal(chunk.content.includes('\ufffd'), false)
    replay += chunk.content
  }
  assert.equal(replay, content)
})

test('document readers reject corrupted metadata and content without rewriting it', async context => {
  const root = await mkdtemp(join(tmpdir(), 'citeciter-documents-'))
  context.after(() => rm(root, { recursive: true, force: true }))
  const store = new DocumentStore(root)
  const document = await store.import({ title: 'Original', format: 'text', content: 'original' })
  const path = join(root, document.documentId, 'document.json')
  const original = await readFile(path, 'utf8')
  for (const patch of [{ schemaVersion: 2 }, { documentId: 'different' }, { format: 'unknown' }]) {
    const changed = JSON.stringify({ ...JSON.parse(original), ...patch })
    await writeFile(path, changed)
    await assert.rejects(store.read(document.documentId))
    await assert.rejects(store.list())
    assert.equal(await readFile(path, 'utf8'), changed)
  }
  await writeFile(path, original)
  await writeFile(join(root, document.documentId, 'content.txt'), 'changed')
  await assert.rejects(store.get(document.documentId), /长度/)
})

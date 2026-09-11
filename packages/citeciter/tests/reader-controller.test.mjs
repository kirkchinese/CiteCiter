import assert from 'node:assert/strict'
import test from 'node:test'
import { createInitialReaderSnapshot, createReaderController } from '../lib/types/client/reader-controller.js'

function setup(request, createFromDocument = async () => {}) {
  let state = createInitialReaderSnapshot()
  const store = { getSnapshot: () => state, subscribe: () => () => {}, update: fn => {
    const next = structuredClone(state); fn(next); state = next
  } }
  return createReaderController(request, { createFromDocument }, store)
}
const page = (documentId, page = 0) => ({ ok: true, value: { kind: 'document-content', document: {
  documentId, title: documentId, format: 'text', content: `page ${page}`, truncated: page === 0, page, pageCount: 2,
} } })
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r }); return { promise, resolve } }

test('rapid document switching keeps the most recently selected document', async () => {
  const a = deferred(), b = deferred()
  const reader = setup(command => command.documentId === 'a' ? a.promise : b.promise)
  const first = reader.openDocument('a'), second = reader.openDocument('b')
  b.resolve(page('b')); await second
  a.resolve(page('a')); await first
  assert.equal(reader.getSnapshot().active.documentId, 'b')
  await reader.dispose()
})

test('a rejected Remote request is displayed without an unhandled rejection', async () => {
  const reader = setup(async () => { throw new Error('offline') })
  await reader.refresh()
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(reader.getSnapshot().documentsStatus, 'error')
  assert.equal(reader.getSnapshot().error, 'offline')
  await reader.dispose()
})

test('page navigation clears the old selection and preserves the question', async () => {
  const calls = []
  const reader = setup(async command => { calls.push(command); return page(command.documentId, command.page) })
  await reader.openDocument('a')
  reader.setSelection({ displayText: 'page', prefixText: '', suffixText: '' })
  reader.setQuestion('explain')
  await reader.openPage(1)
  assert.equal(reader.getSnapshot().active.page, 1)
  assert.equal(reader.getSnapshot().selection, null)
  assert.equal(reader.getSnapshot().question, 'explain')
  assert.equal(calls.at(-1).page, 1)
  await reader.dispose()
})

test('document creation admits one submission and closes the Reader only after success', async () => {
  const completion = deferred(); let creates = 0
  const reader = setup(async command => command.action === 'documents'
    ? { ok: true, value: { kind: 'documents', documents: [] } } : page('a'), () => { creates++; return completion.promise })
  reader.setOpen(true)
  await reader.openDocument('a')
  reader.setSelection({ displayText: 'page', prefixText: '', suffixText: '' })
  reader.setQuestion('explain')
  const first = reader.createTopic(), second = reader.createTopic()
  assert.equal(reader.getSnapshot().creating, true)
  assert.equal(reader.getSnapshot().open, true)
  completion.resolve(); await Promise.all([first, second])
  assert.equal(creates, 1)
  assert.equal(reader.getSnapshot().open, false)
  assert.equal(reader.getSnapshot().question, '')
  await reader.dispose()
})

test('file read failures reach the Reader error state', async () => {
  const reader = setup(async () => { throw new Error('must not contact Host') })
  await reader.importLocalFile({ name: 'missing.md', size: 10, text: async () => { throw new Error('file no longer readable') } })
  assert.match(reader.getSnapshot().error, /file no longer readable/)
  assert.equal(reader.getSnapshot().importing, false)
  await reader.dispose()
})

test('failed Topic creation preserves the source selection and question for retry', async () => {
  const reader = setup(async () => page('a'), async () => { throw new Error('provider unavailable') })
  await reader.openDocument('a')
  reader.setSelection({ displayText: 'page', prefixText: '', suffixText: '' })
  reader.setQuestion('explain')
  await reader.createTopic()
  assert.equal(reader.getSnapshot().question, 'explain')
  assert.equal(reader.getSnapshot().selection.displayText, 'page')
  assert.equal(reader.getSnapshot().creating, false)
  assert.equal(reader.getSnapshot().error, 'provider unavailable')
  await reader.dispose()
})

import assert from 'node:assert/strict'
import test from 'node:test'

import { createCiteCiterEntryRegistry, createToolEvidenceEntry } from '../lib/types/client/entries.js'
import { projectDiffMeta } from '../lib/types/evidence-text.js'

function entry(id, claim) {
  return { id, claim }
}

function selection(entryId) {
  return {
    entryId,
    sourceSessionId: 'source',
    displayText: 'quote',
    kind: 'assistant-step',
    anchorKey: 'anchor',
    startOffset: 0,
    endOffset: 5,
    prefixText: '',
    suffixText: '',
    x: 0,
    y: 0,
  }
}

test('the entry registry claims in registration order and the first claim wins', () => {
  const registry = createCiteCiterEntryRegistry()
  const calls = []
  registry.register(entry('first', (event) => {
    calls.push('first')
    return event.clientX === 1 ? selection('first') : null
  }))
  registry.register(entry('second', (event) => {
    calls.push('second')
    return selection('second')
  }))

  const claim = registry.claim({ clientX: 1 }, { sessions: {}, sourceSessionId: 'source' })
  assert.equal(claim?.entry.id, 'first')
  assert.equal(claim?.selection.entryId, 'first')
  assert.deepEqual(calls, ['first'])

  const fallback = registry.claim({ clientX: 2 }, { sessions: {}, sourceSessionId: 'source' })
  assert.equal(fallback?.entry.id, 'second')
  assert.deepEqual(calls, ['first', 'first', 'second'])
  assert.deepEqual(registry.list().map((registered) => registered.id), ['first', 'second'])
})

test('registering an entry returns its exact disposer', () => {
  const registry = createCiteCiterEntryRegistry()
  const registered = entry('only', () => selection('only'))
  const dispose = registry.register(registered)
  assert.equal(registry.list().length, 1)
  assert.equal(dispose(), undefined)
  assert.equal(registry.list().length, 0)
  assert.equal(registry.claim({}, { sessions: {}, sourceSessionId: 'source' }), null)

  dispose()
  assert.equal(registry.list().length, 0)
})

test('no entry owns an event when every claim returns null', () => {
  const registry = createCiteCiterEntryRegistry()
  registry.register(entry('none', () => null))
  assert.equal(registry.claim({}, { sessions: {}, sourceSessionId: 'source' }), null)
})

class FakeElement {
  constructor(tagName, attributes = {}) {
    this.nodeType = 1
    this.tagName = tagName.toUpperCase()
    this.parentElement = null
    this.dataset = {}
    for (const [name, value] of Object.entries(attributes)) {
      if (name.startsWith('data-')) {
        const key = name.slice(5).replace(/-([a-z])/gu, (_match, letter) => letter.toUpperCase())
        this.dataset[key] = value
      }
    }
  }

  append(...children) {
    for (const child of children) child.parentElement = this
    return this
  }

  matches(selector) {
    if (!selector.startsWith('[data-') || !selector.endsWith(']')) return false
    const name = selector.slice(6, -1)
    const key = name.replace(/-([a-z])/gu, (_match, letter) => letter.toUpperCase())
    return this.dataset[key] !== undefined
  }

  closest(selector) {
    let current = this
    while (current !== null) {
      if (current.matches(selector)) return current
      current = current.parentElement
    }
    return null
  }
}

function toolNodeStore(callId, content, meta) {
  const nodes = new Map()
  nodes.set('tool-flow-key', {
    kind: 'tool-call',
    data: { root: { kind: 'tool-result', callId, content, meta } },
  })
  return {
    get: (key) => nodes.get(key),
  }
}

function toolEntryContext(callId, content, meta) {
  return {
    sessions: {
      binding: () => ({ session: { getSnapshot: () => ({ chat: { nodes: toolNodeStore(callId, content, meta) } }) } }),
    },
    sourceSessionId: 'source',
  }
}

function toolPointer(callId, projection) {
  const flow = new FakeElement('article', { 'data-chat-flow-kind': 'tool-call', 'data-chat-anchor-key': 'tool-flow-key' })
  const row = new FakeElement('div', { 'data-chat-call-id': callId })
  const body = projection === 'terminal'
    ? new FakeElement('div', { 'data-terminal': '' })
    : projection === 'diff'
      ? new FakeElement('div', { 'data-diff': '' })
      : new FakeElement('span')
  row.append(body)
  flow.append(row)
  return { target: body, flow, row }
}

test('the tool evidence entry claims whole-card tool results and skips foreign nodes', () => {
  const toolEntry = createToolEvidenceEntry()
  const plain = toolPointer('call-1')
  const plainClaim = toolEntry.claim({
    target: plain.target,
    clientX: 10,
    clientY: 20,
    preventDefault() {},
  }, toolEntryContext('call-1', [{ type: 'text', text: 'tool output' }]))
  assert.equal(plainClaim?.entryId, 'citeciter.entry.tool')
  assert.equal(plainClaim?.kind, 'tool-result')
  assert.equal(plainClaim?.callId, 'call-1')
  assert.equal(plainClaim?.projection, 'result-text')
  assert.equal(plainClaim?.displayText, 'tool output')
  assert.equal(plainClaim?.anchorKey, 'tool-flow-key')

  const terminal = toolPointer('call-2', 'terminal')
  const terminalClaim = toolEntry.claim({
    target: terminal.target,
    clientX: 11,
    clientY: 21,
    preventDefault() {},
  }, toolEntryContext('call-2', [{ type: 'text', text: 'pwd\n/home' }], { card: 'terminal', output: 'pwd\n/home' }))
  assert.equal(terminalClaim?.projection, 'terminal')
  assert.equal(terminalClaim?.displayText, 'pwd\n/home')

  const diffs = [{ path: 'a.ts', oldText: 'a', newText: 'b' }]
  const diff = toolPointer('call-3', 'diff')
  const diffClaim = toolEntry.claim({
    target: diff.target,
    clientX: 12,
    clientY: 22,
    preventDefault() {},
  }, toolEntryContext('call-3', [], { diffs }))
  assert.equal(diffClaim?.projection, 'diff')
  assert.equal(diffClaim?.displayText, projectDiffMeta({ diffs }))

  const foreign = toolEntry.claim({
    target: new FakeElement('span'),
    preventDefault() {},
  }, toolEntryContext('call-1', [{ type: 'text', text: 'tool output' }]))
  assert.equal(foreign, null)
  const unknownCall = toolEntry.claim({
    target: toolPointer('call-9').target,
    preventDefault() {},
  }, toolEntryContext('call-1', [{ type: 'text', text: 'tool output' }]))
  assert.equal(unknownCall, null)
})

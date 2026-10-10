import assert from 'node:assert/strict'
import test from 'node:test'

import {
  claimCreateFreeTopicIntent,
  claimCreateTopicIntent,
  completeRequestIntent,
} from '../lib/types/client/request-guard.js'

const selection = {
  sourceSessionId: 'source-session',
  displayText: 'quoted text',
  sourceHintText: 'source hint',
  prefixText: 'pre ',
  suffixText: ' post',
  anchorKey: 'assistant:42',
  startOffset: 0,
  endOffset: 11,
  x: 1,
  y: 2,
  kind: 'assistant-step',
}

test('one pending creation keeps its request ID across retries but not after confirmation', async () => {
  const values = new Map()
  const original = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage')
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
  })
  try {
    const first = await claimCreateTopicIntent(selection, '为什么？')
    const retry = await claimCreateTopicIntent({ ...selection }, '为什么？')
    const changed = await claimCreateTopicIntent(selection, '怎么样？')
    const routed = await claimCreateTopicIntent(selection, '为什么？', { provider: 'p', model: 'm' })
    assert.deepEqual(retry, first)
    assert.notEqual(changed.requestId, first.requestId)
    assert.notEqual(routed.requestId, first.requestId)

    const free = await claimCreateFreeTopicIntent('source-session', '为什么？')
    assert.notEqual(free.requestId, first.requestId)

    completeRequestIntent(first)
    const laterIntent = await claimCreateTopicIntent(selection, '为什么？')
    assert.equal(laterIntent.key, first.key)
    assert.notEqual(laterIntent.requestId, first.requestId)
  } finally {
    if (original === undefined) delete globalThis.sessionStorage
    else Object.defineProperty(globalThis, 'sessionStorage', original)
  }
})

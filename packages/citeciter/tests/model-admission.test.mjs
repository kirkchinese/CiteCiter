import assert from 'node:assert/strict'
import test from 'node:test'
import { isRouteUnavailable, requireSelectedModel, selectInitialModel } from '../lib/types/model-admission.js'

test('only a missing provider or retired model marks a route unavailable', () => {
  assert.equal(isRouteUnavailable({ code: 'NO_ADAPTER' }), true)
  assert.equal(isRouteUnavailable({ code: 'UNKNOWN_MODEL' }), true)
  assert.equal(isRouteUnavailable({ code: 'session/model-unavailable' }), true)
  // A provider that cannot be reached right now says nothing about the route.
  for (const code of ['TRANSPORT', 'TIMEOUT', 'SERVER', 'RATE_LIMIT', 'AUTH']) assert.equal(isRouteUnavailable({ code }), false)
  assert.equal(isRouteUnavailable(new Error('fetch failed')), false)
  assert.equal(isRouteUnavailable(undefined), false)
})

test('a retired model on first selection keeps the Topic and asks for another model', async () => {
  const metadata = { modelConfig: { provider: 'p', model: 'm' } }
  await selectInitialModel(metadata, async () => { throw Object.assign(new Error('gone'), { code: 'session/model-unavailable' }) })
  assert.equal(metadata.modelSelectionRequired, true)
  assert.throws(() => requireSelectedModel(metadata), /不可用/u)
  await assert.rejects(selectInitialModel({}, async () => { throw Object.assign(new Error('down'), { code: 'TRANSPORT' }) }), /down/u)
})

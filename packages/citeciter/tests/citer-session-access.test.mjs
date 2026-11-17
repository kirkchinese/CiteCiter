import assert from 'node:assert/strict'
import test from 'node:test'
import { CiterSessionAccess } from '../lib/types/citer-session-access.js'

/** A Host store and context with just the surface the adapter uses. */
function host() {
  const hostSessions = new Map()
  const store = {
    get(id) { return hostSessions.get(id) },
    async flush() {},
  }
  const listeners = []
  const ctx = {
    sessions: store,
    on(name, listener, options) { listeners.push({ name, listener, prepend: options?.prepend === true }) },
    effect(setup) { setup() },
  }
  return { ctx, store, hostSessions, listeners }
}

test('a Topic answers Host id lookups only inside its own request waterfall', async () => {
  const { ctx, store, hostSessions, listeners } = host()
  const access = new CiterSessionAccess(ctx, async () => {})
  const hostSession = { id: 'source' }
  hostSessions.set('source', hostSession)
  const topic = { id: 'citeciter-1' }
  const other = { id: 'citeciter-2' }
  access.enter(topic, store)
  access.enter(other, store)

  // Host sessions resolve as before; Topics stay out of ordinary lookups.
  assert.equal(store.get('source'), hostSession)
  assert.equal(store.get('citeciter-1'), undefined)

  const agentCtx = { on: ctx.on }
  access.attach(agentCtx, { id: 'citeciter-1' })
  const request = listeners.find(entry => entry.name === 'agent/request')
  assert.equal(request.prepend, true)

  let seen
  const proposal = await request.listener({}, async () => {
    // A later agent/request listener (such as dsh-codex-connect's live-root check) runs in here.
    await Promise.resolve()
    seen = { self: store.get('citeciter-1'), other: store.get('citeciter-2'), source: store.get('source') }
    return { provider: 'p', model: 'm' }
  })
  assert.deepEqual(proposal, { provider: 'p', model: 'm' })
  assert.equal(seen.self, topic)
  assert.equal(seen.other, undefined)
  assert.equal(seen.source, hostSession)

  // After the waterfall the model call, title service and session list see nothing.
  assert.equal(store.get('citeciter-1'), undefined)
})

test('a released Topic is not resolvable even inside a request', async () => {
  const { ctx, store, listeners } = host()
  const access = new CiterSessionAccess(ctx, async () => {})
  const topic = { id: 'citeciter-3' }
  const release = access.enter(topic, store)
  access.attach({ on: ctx.on }, { id: 'citeciter-3' })
  release()
  const request = listeners.find(entry => entry.name === 'agent/request')
  let seen = null
  await request.listener({}, async () => { seen = store.get('citeciter-3') })
  assert.equal(seen, undefined)
})

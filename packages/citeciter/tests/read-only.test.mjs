import assert from 'node:assert/strict'
import test from 'node:test'

import {
  readOnlyCommandStatus,
  requireReadOnlyCommand,
} from '../lib/types/read-only.js'

function event(seq, type, data) {
  return { seq, time: seq, type, data }
}

function fakeAgent(initial, seedLength = 2) {
  const events = [...initial]
  const listeners = new Set()
  const session = {
    id: 'child-session',
    header: { seedLength },
    events,
  }
  return {
    agent: {
      session,
      ctx: {
        on(name, listener) {
          assert.equal(name, 'session/event')
          listeners.add(listener)
          return () => listeners.delete(listener)
        },
      },
    },
    append(type, data) {
      const next = event(events.length, type, data)
      events.push(next)
      for (const listener of [...listeners]) listener(session, next)
    },
    listenerCount() {
      return listeners.size
    },
  }
}

const inherited = [
  event(0, 'permission/preset', { preset: 'read-only' }),
  event(1, 'session/end-seed', {}),
]

test('read-only fold ignores inherited state and requires a settled child command', () => {
  const pending = fakeAgent(inherited)
  assert.deepEqual(readOnlyCommandStatus(pending.agent), { kind: 'pending' })

  const ready = fakeAgent([
    ...inherited,
    event(2, 'command/run', {
      commandId: 'permission-1',
      name: 'permission',
      args: ' read-only',
      source: { kind: 'user' },
    }),
    event(3, 'permission/preset', { preset: 'read-only' }),
    event(4, 'sandbox/mode', { mode: 'read-only' }),
    event(5, 'command/done', { commandId: 'permission-1', kind: 'success' }),
  ])
  assert.deepEqual(readOnlyCommandStatus(ready.agent), { kind: 'ready' })
})

test('repeated read-only command accepts the already-effective child state', async () => {
  const repeated = fakeAgent([
    ...inherited,
    event(2, 'command/run', {
      commandId: 'permission-first',
      name: 'permission',
      args: ' read-only',
      source: { kind: 'user' },
    }),
    event(3, 'permission/preset', { preset: 'read-only' }),
    event(4, 'sandbox/mode', { mode: 'read-only' }),
    event(5, 'command/done', { commandId: 'permission-first', kind: 'success' }),
    event(6, 'command/run', {
      commandId: 'permission-second',
      name: 'permission',
      args: ' read-only',
      source: { kind: 'user' },
    }),
    event(7, 'command/done', { commandId: 'permission-second', kind: 'success' }),
  ])

  assert.deepEqual(readOnlyCommandStatus(repeated.agent), { kind: 'ready' })
  await requireReadOnlyCommand(repeated.agent, 5)
  assert.equal(repeated.listenerCount(), 0)
})

test('read-only fold stays pending after any later permission or sandbox downgrade', () => {
  const settled = [
    ...inherited,
    event(2, 'command/run', {
      commandId: 'permission-safe',
      name: 'permission',
      args: ' read-only',
      source: { kind: 'user' },
    }),
    event(3, 'permission/preset', { preset: 'read-only' }),
    event(4, 'sandbox/mode', { mode: 'read-only' }),
    event(5, 'command/done', { commandId: 'permission-safe', kind: 'success' }),
  ]
  const sandboxDowngrade = fakeAgent([
    ...settled,
    event(6, 'sandbox/mode', { mode: 'workspace-write' }),
  ])
  assert.deepEqual(readOnlyCommandStatus(sandboxDowngrade.agent), { kind: 'pending' })

  const laterPreset = fakeAgent([
    ...settled,
    event(6, 'command/run', {
      commandId: 'permission-write',
      name: 'permission',
      args: ' workspace-write',
      source: { kind: 'user' },
    }),
    event(7, 'permission/preset', { preset: 'workspace-write' }),
    event(8, 'sandbox/mode', { mode: 'workspace-write' }),
    event(9, 'command/done', { commandId: 'permission-write', kind: 'success' }),
  ])
  assert.deepEqual(readOnlyCommandStatus(laterPreset.agent), { kind: 'pending' })
})

test('read-only fold rejects failed or non-applying command outcomes', () => {
  const failed = fakeAgent([
    ...inherited,
    event(2, 'command/run', {
      commandId: 'permission-2',
      name: 'permission',
      args: ' read-only',
      source: { kind: 'user' },
    }),
    event(3, 'command/done', {
      commandId: 'permission-2',
      kind: 'error',
      text: 'preset denied',
    }),
  ])
  assert.deepEqual(readOnlyCommandStatus(failed.agent), {
    kind: 'error',
    message: 'preset denied',
  })

  const missingPreset = fakeAgent([
    ...inherited,
    event(2, 'command/run', {
      commandId: 'permission-3',
      name: 'permission',
      args: ' read-only',
      source: { kind: 'user' },
    }),
    event(3, 'command/done', { commandId: 'permission-3', kind: 'success' }),
  ])
  assert.deepEqual(readOnlyCommandStatus(missingPreset.agent), {
    kind: 'error',
    message: 'permission command succeeded without applying read-only',
  })
})

test('read-only wait follows durable command events and releases its listener', async () => {
  const fixture = fakeAgent([
    ...inherited,
    event(2, 'command/run', {
      commandId: 'permission-4',
      name: 'permission',
      args: ' read-only',
      source: { kind: 'user' },
    }),
  ])
  const readiness = requireReadOnlyCommand(fixture.agent, 100)
  assert.equal(fixture.listenerCount(), 1)
  fixture.append('permission/preset', { preset: 'read-only' })
  fixture.append('sandbox/mode', { mode: 'read-only' })
  fixture.append('command/done', { commandId: 'permission-4', kind: 'success' })
  await readiness
  assert.equal(fixture.listenerCount(), 0)
})

test('read-only wait times out fail closed and releases its listener', async () => {
  const fixture = fakeAgent(inherited)
  await assert.rejects(
    requireReadOnlyCommand(fixture.agent, 5),
    /timed out before durable command settlement/,
  )
  assert.equal(fixture.listenerCount(), 0)
})

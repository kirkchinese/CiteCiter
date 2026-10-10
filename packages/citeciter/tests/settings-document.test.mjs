import assert from 'node:assert/strict'
import test from 'node:test'

import { createSettingsDocumentController } from '../lib/types/client/settings-document.js'

function describeFace(initial = {
  status: 'idle',
  view: undefined,
  error: null,
}) {
  let snapshot = initial
  const listeners = new Set()
  return {
    snapshot,
    face: {
      getSnapshot: () => snapshot,
      subscribe: (listener) => {
        listeners.add(listener)
        return () => listeners.delete(listener)
      },
      ensure: async () => {
        snapshot = { status: 'ready', view: { hasDocument: true, writable: true, namespaces: [] }, error: null }
        for (const listener of listeners) listener()
      },
    },
  }
}

test('settings document action reports availability and collapses concurrent opens', async () => {
  const mirror = describeFace()
  let calls = 0
  let release
  const opening = new Promise((resolve) => { release = resolve })
  const controller = createSettingsDocumentController(mirror.face, async () => {
    calls += 1
    await opening
  })

  await controller.load()
  assert.equal(controller.getSnapshot().status, 'ready')
  assert.equal(controller.getSnapshot().opening, false)

  const first = controller.open()
  const second = controller.open()
  assert.equal(controller.getSnapshot().opening, true)
  release()
  await Promise.all([first, second])
  assert.equal(calls, 1)
  assert.equal(controller.getSnapshot().opening, false)
  assert.equal(controller.getSnapshot().message, '已打开配置文件')
  await controller.dispose()
})

test('settings document action keeps the button recoverable after host failure', async () => {
  const mirror = describeFace()
  const controller = createSettingsDocumentController(mirror.face, async () => {
    throw new Error('host refused')
  })
  await controller.load()
  await controller.open()
  assert.equal(controller.getSnapshot().opening, false)
  assert.equal(controller.getSnapshot().error, 'host refused')
  assert.equal(controller.getSnapshot().status, 'ready')
  await controller.dispose()
})

test('settings document action exposes an unavailable host state', async () => {
  let snapshot = { status: 'unavailable', view: undefined, error: 'not loopback' }
  let listener = () => undefined
  const controller = createSettingsDocumentController({
    getSnapshot: () => snapshot,
    subscribe: (next) => {
      listener = next
      return () => { listener = () => undefined }
    },
    ensure: async () => {
      snapshot = { status: 'unavailable', view: undefined, error: 'not loopback' }
      listener()
    },
  }, async () => undefined)
  await controller.load()
  assert.equal(controller.getSnapshot().status, 'unavailable')
  assert.equal(controller.getSnapshot().error, 'not loopback')
  await controller.dispose()
})

test('settings document action distinguishes loading and a missing document', async () => {
  let snapshot = { status: 'idle', view: undefined, error: null }
  let listener = () => undefined
  let release
  const pending = new Promise((resolve) => { release = resolve })
  const controller = createSettingsDocumentController({
    getSnapshot: () => snapshot,
    subscribe: (next) => {
      listener = next
      return () => { listener = () => undefined }
    },
    ensure: async () => {
      snapshot = { status: 'loading', view: undefined, error: null }
      listener()
      await pending
      snapshot = { status: 'ready', view: { hasDocument: false, writable: true, namespaces: [] }, error: null }
      listener()
    },
  }, async () => undefined)

  const loading = controller.load()
  assert.equal(controller.getSnapshot().status, 'loading')
  release()
  await loading
  assert.equal(controller.getSnapshot().status, 'missing')
  assert.equal(controller.getSnapshot().error, '配置文件不存在')
  await controller.dispose()
})

test('disposing the settings action aborts an in-flight Host open', async () => {
  const mirror = describeFace()
  let aborted = false
  const controller = createSettingsDocumentController(mirror.face, (signal) => new Promise((resolve) => {
    signal.addEventListener('abort', () => {
      aborted = true
      resolve()
    }, { once: true })
  }))
  await controller.load()
  const opening = controller.open()
  const disposing = controller.dispose()
  await Promise.all([opening, disposing])
  assert.equal(aborted, true)
})

test('disposing the settings action drains an accepted description load', async () => {
  let release
  let started
  const pending = new Promise((resolve) => { release = resolve })
  const loadStarted = new Promise((resolve) => { started = resolve })
  const controller = createSettingsDocumentController({
    getSnapshot: () => ({ status: 'idle', view: undefined, error: null }),
    subscribe: () => () => undefined,
    ensure: async () => {
      started()
      await pending
    },
  }, async () => undefined)

  const loading = controller.load()
  await loadStarted
  let disposed = false
  const disposing = controller.dispose().then(() => { disposed = true })
  await Promise.resolve()
  assert.equal(disposed, false)
  release()
  await Promise.all([loading, disposing])
  assert.equal(disposed, true)
})

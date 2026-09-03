import assert from 'node:assert/strict'
import test from 'node:test'

import {
  citeCiterUpdateCommand,
  createUpdateBrowserEnvironment,
  createUpdateController,
  INITIAL_UPDATE_SNAPSHOT,
} from '../lib/types/client/update-controller.js'

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value) },
    removeItem: (key) => { values.delete(key) },
  }
}

function snapshotStore() {
  let snapshot = { ...INITIAL_UPDATE_SNAPSHOT }
  const listeners = new Set()
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    update: (mutator) => {
      const next = { ...snapshot }
      mutator(next)
      snapshot = next
      for (const listener of [...listeners]) listener()
    },
    set: (next) => {
      snapshot = next
      for (const listener of [...listeners]) listener()
    },
  }
}

function visibleDocument() {
  const listeners = new Set()
  return {
    document: {
      visibilityState: 'visible',
      addEventListener: (_name, listener) => { listeners.add(listener) },
      removeEventListener: (_name, listener) => { listeners.delete(listener) },
    },
    show: () => { for (const listener of [...listeners]) listener() },
    listenerCount: () => listeners.size,
  }
}

function settingsScope({ mode = 'host', enabled = true, commit = true } = {}) {
  let snapshot = {
    status: mode === 'host' ? 'ready' : 'unavailable',
    value: { updateNotifications: enabled },
    base: undefined,
    user: undefined,
    revision: mode === 'host' ? 1 : undefined,
    writable: mode === 'host',
    mode,
  }
  const listeners = new Set()
  const face = {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    set: async (field, value) => {
      if (!commit) return
      snapshot = { ...snapshot, value: { ...snapshot.value, [field]: value } }
      for (const listener of [...listeners]) listener()
    },
    unset: async () => undefined,
  }
  return {
    face,
    setCommit: (value) => { commit = value },
  }
}

function environment({ session = memoryStorage(), local = memoryStorage(), clipboard, now = () => 0 } = {}) {
  const visibility = visibleDocument()
  return {
    value: {
      document: visibility.document,
      sessionStorage: session,
      localStorage: local,
      clipboard,
      now,
    },
    visibility,
  }
}

test('default browser environment survives storage getters denied during mount', () => {
  const names = ['document', 'sessionStorage', 'localStorage']
  const descriptors = new Map(names.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]))
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: visibleDocument().document,
  })
  for (const name of ['sessionStorage', 'localStorage']) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      get: () => { throw new DOMException('denied', 'SecurityError') },
    })
  }
  try {
    const browser = createUpdateBrowserEnvironment()
    assert.equal(browser.sessionStorage.getItem('anything'), null)
    assert.equal(browser.localStorage.getItem('anything'), null)
  } finally {
    for (const name of names) {
      const descriptor = descriptors.get(name)
      if (descriptor === undefined) delete globalThis[name]
      else Object.defineProperty(globalThis, name, descriptor)
    }
  }
})

test('disabled Host preference prevents the startup network check', async () => {
  const settings = settingsScope({ enabled: false })
  const browser = environment()
  let checks = 0
  const controller = createUpdateController(settings.face, async () => {
    checks += 1
    return { currentVersion: '0.4.3', latestVersion: '0.5.0' }
  }, snapshotStore(), browser.value)

  await controller.start()
  assert.equal(checks, 0)
  assert.equal(controller.getSnapshot().notificationsEnabled, false)
  assert.equal(controller.getSnapshot().available, null)
  await controller.dispose()
})

test('next-time deferral survives a same-tab reload but not a newer version', async () => {
  const session = memoryStorage()
  const settings = settingsScope()

  const first = createUpdateController(settings.face, async () => ({
    currentVersion: '0.4.3',
    latestVersion: '0.5.0',
  }), snapshotStore(), environment({ session }).value)
  await first.start()
  assert.deepEqual(first.getSnapshot().available, { currentVersion: '0.4.3', latestVersion: '0.5.0' })
  first.defer()
  assert.equal(first.getSnapshot().available, null)
  await first.dispose()

  const reload = createUpdateController(settings.face, async () => ({
    currentVersion: '0.4.3',
    latestVersion: '0.5.0',
  }), snapshotStore(), environment({ session }).value)
  await reload.start()
  assert.equal(reload.getSnapshot().available, null)
  await reload.dispose()

  const newer = createUpdateController(settings.face, async () => ({
    currentVersion: '0.4.3',
    latestVersion: '0.6.0',
  }), snapshotStore(), environment({ session }).value)
  await newer.start()
  assert.equal(newer.getSnapshot().available?.latestVersion, '0.6.0')
  await newer.dispose()
})

test('update only copies the fixed command and keeps it visible when clipboard access fails', async () => {
  const settings = settingsScope()
  const browser = environment({
    clipboard: { writeText: async () => { throw new Error('denied') } },
  })
  const controller = createUpdateController(settings.face, async () => ({
    currentVersion: '0.4.3',
    latestVersion: '0.5.0',
  }), snapshotStore(), browser.value)

  await controller.start()
  await controller.copyUpdateCommand()
  assert.equal(controller.getSnapshot().copyStatus, 'error')
  assert.match(controller.getSnapshot().copyMessage, /手动复制/u)
  assert.equal(controller.getSnapshot().available?.latestVersion, '0.5.0')
  assert.equal(
    citeCiterUpdateCommand('0.5.0'),
    'dsh plugin --profile web add @kirkchinese/dsh-citeciter@0.5.0',
  )
  await controller.dispose()
})

test('never-prompt verifies Host persistence before hiding and remains recoverable', async () => {
  const settings = settingsScope({ commit: false })
  const controller = createUpdateController(settings.face, async () => ({
    currentVersion: '0.4.3',
    latestVersion: '0.5.0',
  }), snapshotStore(), environment().value)
  await controller.start()

  assert.equal(await controller.setNotificationsEnabled(false), false)
  assert.equal(controller.getSnapshot().preferenceStatus, 'error')
  assert.notEqual(controller.getSnapshot().available, null)

  settings.setCommit(true)
  assert.equal(await controller.setNotificationsEnabled(false), true)
  assert.equal(controller.getSnapshot().notificationsEnabled, false)
  assert.equal(controller.getSnapshot().available, null)
  await controller.dispose()
})

test('remote browser opt-out uses local storage and settings can restore checks', async () => {
  const local = memoryStorage()
  const settings = settingsScope({ mode: 'memory' })
  let checks = 0
  const controller = createUpdateController(settings.face, async () => {
    checks += 1
    return { currentVersion: '0.4.3', latestVersion: '0.5.0' }
  }, snapshotStore(), environment({ local }).value)
  await controller.start()
  assert.equal(checks, 1)

  assert.equal(await controller.setNotificationsEnabled(false), true)
  assert.equal(controller.getSnapshot().available, null)
  await controller.dispose()

  const disabled = createUpdateController(settings.face, async () => {
    checks += 1
    return { currentVersion: '0.4.3', latestVersion: '0.5.0' }
  }, snapshotStore(), environment({ local }).value)
  await disabled.start()
  assert.equal(checks, 1)
  assert.equal(disabled.getSnapshot().notificationsEnabled, false)

  assert.equal(await disabled.setNotificationsEnabled(true), true)
  await Promise.resolve()
  assert.equal(checks, 2)
  assert.equal(disabled.getSnapshot().notificationsEnabled, true)
  await disabled.dispose()
})

test('visible-page checks are rate-limited and disposal aborts late work', async () => {
  const settings = settingsScope()
  let now = 0
  let checks = 0
  let release
  const browser = environment({ now: () => now })
  const controller = createUpdateController(settings.face, async (signal) => {
    checks += 1
    if (checks === 1) return null
    return new Promise((resolve) => {
      release = resolve
      signal.addEventListener('abort', () => resolve({
        currentVersion: '0.4.3', latestVersion: '0.5.0',
      }), { once: true })
    })
  }, snapshotStore(), browser.value)
  await controller.start()
  assert.equal(checks, 1)

  now = 24 * 60 * 60 * 1000 - 1
  browser.visibility.show()
  await Promise.resolve()
  assert.equal(checks, 1)

  now += 1
  browser.visibility.show()
  await Promise.resolve()
  assert.equal(checks, 2)
  const disposing = controller.dispose()
  await disposing
  release?.(null)
  assert.equal(controller.getSnapshot().available, null)
  assert.equal(browser.visibility.listenerCount(), 0)
})

import assert from 'node:assert/strict'
import test from 'node:test'

import { createCompanionController } from '../lib/types/client/companion-controller.js'
import { DEFAULT_CITECITER_SETTINGS } from '../lib/types/topic.js'

function memoryStore(initial) {
  let state = initial
  return {
    getSnapshot: () => state,
    subscribe: () => () => undefined,
    update: (mutator) => {
      const next = structuredClone(state)
      mutator(next)
      state = next
    },
    set: (next) => { state = next },
  }
}

function topic(sessionId, messages = []) {
  return {
    topic: {
      topicId: sessionId === 'topic-a' ? 1 : 2,
      sessionId,
      sourceSessionId: 'source',
      mode: 'observer',
      citation: { anchorSeq: 1 },
      title: sessionId,
      titlePending: false,
      createdAt: 1,
      updatedAt: 1,
      archived: false,
      running: false,
      sourceAvailable: true,
      observedThroughSeq: null,
      modelConfig: { provider: 'fixture', model: 'fixture' },
    },
    messages,
    pendingQuestion: null,
    error: null,
  }
}

function snapshot(active) {
  return {
    sourceSessionId: 'source',
    phase: 'ready',
    draftQuote: null,
    sourceAnchorKey: null,
    active,
    topics: [active.topic],
    topicsStatus: 'ready',
    topicsError: null,
    providers: [],
    settings: DEFAULT_CITECITER_SETTINGS,
    settingsSaveStatus: 'idle',
    settingsSaveMessage: null,
    modelRouteSaving: false,
    reasoningEffortSaving: false,
    renaming: false,
    archiving: false,
    includeArchived: false,
    error: null,
  }
}

test('follow-up submission is single-flight per Topic and retry-stable after failure', async () => {
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage')
  const values = new Map()
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
  })
  let releaseA
  let startedA
  const aStarted = new Promise((resolve) => { startedA = resolve })
  const aResponse = new Promise((resolve) => { releaseA = resolve })
  const requests = []
  let retryCalls = 0
  const request = (command) => {
    requests.push(command)
    if (command.action === 'get') return Promise.resolve({ ok: true, value: { kind: 'topic', topic: topic(command.topicSessionId) } })
    if (command.action !== 'ask') throw new Error(`unexpected ${command.action}`)
    if (command.topicSessionId === 'topic-a') {
      startedA()
      return aResponse
    }
    if (command.question === '失败后重试') {
      retryCalls += 1
      if (retryCalls === 1) return Promise.reject(new Error('network failed'))
    }
    return Promise.resolve({
      ok: true,
      value: { kind: 'topic', topic: topic(command.topicSessionId, [{ id: command.requestId, role: 'user', text: command.question, seq: 2 }]) },
    })
  }
  const settingsScope = {
    getSnapshot: () => ({ status: 'ready', value: DEFAULT_CITECITER_SETTINGS, error: null }),
    subscribe: () => () => undefined,
    set: async () => undefined,
  }
  const controller = createCompanionController(
    { binding: () => undefined },
    settingsScope,
    request,
    () => undefined,
    memoryStore(snapshot(topic('topic-a'))),
  )

  try {
    const first = controller.ask('A 的问题')
    await aStarted
    assert.equal(await controller.ask('A 的重复点击'), false)

    await controller.openTopic('topic-b')
    assert.equal(await controller.ask('B 的问题'), true)
    releaseA({ ok: true, value: { kind: 'topic', topic: topic('topic-a') } })
    assert.equal(await first, false)
    assert.equal(controller.getSnapshot().active.topic.sessionId, 'topic-b')

    assert.equal(await controller.ask('失败后重试'), false)
    const failedId = requests.at(-1).requestId
    assert.equal(await controller.ask('失败后重试'), true)
    const retryId = requests.at(-1).requestId
    assert.equal(retryId, failedId)
    assert.equal(await controller.ask('失败后重试'), true)
    assert.notEqual(requests.at(-1).requestId, retryId)

    assert.deepEqual(requests.filter((command) => command.action === 'ask').map((command) => [
      command.topicSessionId,
      command.question,
    ]), [
      ['topic-a', 'A 的问题'],
      ['topic-b', 'B 的问题'],
      ['topic-b', '失败后重试'],
      ['topic-b', '失败后重试'],
      ['topic-b', '失败后重试'],
    ])
  } finally {
    await controller.dispose()
    if (originalStorage === undefined) delete globalThis.sessionStorage
    else Object.defineProperty(globalThis, 'sessionStorage', originalStorage)
  }
})

test('dispose aborts an accepted Remote call, drains it, and rejects late state', async () => {
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage')
  const values = new Map()
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
  })
  let calls = 0
  let started
  const requestStarted = new Promise((resolve) => { started = resolve })
  const request = (command, signal) => {
    calls += 1
    started(signal)
    return new Promise((resolve) => {
      signal.addEventListener('abort', () => resolve({
        ok: true,
        value: { kind: 'topic', topic: topic(command.topicSessionId, [{ id: 'late', role: 'assistant', text: 'late', status: 'settled', seq: 3 }]) },
      }), { once: true })
    })
  }
  const settingsScope = {
    getSnapshot: () => ({ status: 'ready', value: DEFAULT_CITECITER_SETTINGS, error: null }),
    subscribe: () => () => undefined,
    set: async () => undefined,
  }
  const controller = createCompanionController(
    { binding: () => undefined },
    settingsScope,
    request,
    () => undefined,
    memoryStore(snapshot(topic('topic-a'))),
  )

  try {
    const asking = controller.ask('pending')
    const signal = await requestStarted
    const disposing = controller.dispose()
    assert.equal(signal.aborted, true)
    assert.equal(await asking, false)
    await disposing
    assert.equal(await controller.ask('after dispose'), false)
    assert.equal(calls, 1)
    assert.equal(controller.getSnapshot().active.messages.length, 0)
  } finally {
    await controller.dispose()
    if (originalStorage === undefined) delete globalThis.sessionStorage
    else Object.defineProperty(globalThis, 'sessionStorage', originalStorage)
  }
})

test('dispose waits for an accepted settings write and admits no later write', async () => {
  let calls = 0
  let release
  let started
  const writeStarted = new Promise((resolve) => { started = resolve })
  const write = new Promise((resolve) => { release = resolve })
  const settingsScope = {
    getSnapshot: () => ({ status: 'ready', value: DEFAULT_CITECITER_SETTINGS, error: null }),
    subscribe: () => () => undefined,
    set: async () => {
      calls += 1
      started()
      await write
    },
  }
  const controller = createCompanionController(
    { binding: () => undefined },
    settingsScope,
    async () => { throw new Error('unexpected Remote call') },
    () => undefined,
    memoryStore(snapshot(topic('topic-a'))),
  )

  const saving = controller.setSetting('panelWidthPercent', 45)
  await writeStarted
  let disposed = false
  const disposing = controller.dispose().then(() => { disposed = true })
  await Promise.resolve()
  assert.equal(disposed, false)
  await controller.setSetting('panelWidthPercent', 50)
  assert.equal(calls, 1)
  release()
  await Promise.all([saving, disposing])
  assert.equal(disposed, true)
})

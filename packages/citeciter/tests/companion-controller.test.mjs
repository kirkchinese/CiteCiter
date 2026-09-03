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
    topics: active === null ? [] : [active.topic],
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
    deleting: false,
    notice: null,
    includeArchived: false,
    error: null,
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

test('uncited Topic is created only on first submission with the selected scenario', async () => {
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
  let releaseCreate
  let createStarted
  const started = new Promise((resolve) => { createStarted = resolve })
  const response = new Promise((resolve) => { releaseCreate = resolve })
  const created = topic('topic-free')
  created.topic.citation = null
  created.topic.scenario = 'present'
  const requests = []
  let gets = 0
  const request = (command) => {
    requests.push(command)
    if (command.action === 'create') {
      createStarted()
      return response
    }
    if (command.action === 'list') {
      return Promise.resolve({ ok: true, value: { kind: 'topics', topics: [created.topic] } })
    }
    if (command.action === 'models') {
      return Promise.resolve({ ok: true, value: { kind: 'models', providers: [] } })
    }
    if (command.action === 'get') {
      gets += 1
      return Promise.resolve({ ok: true, value: { kind: 'topic', topic: topic('topic-a') } })
    }
    throw new Error('unexpected ' + command.action)
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
    assert.equal(requests.length, 0)
    const creating = controller.createFree('请逐步讲解曲率', 'present')
    await started
    const releaseVisible = controller.retainVisible()
    await wait(750)
    releaseVisible()
    assert.equal(gets, 0)
    assert.equal(controller.getSnapshot().active.topic.sessionId, 'topic-a')
    releaseCreate({ ok: true, value: { kind: 'topic', topic: created } })
    assert.equal(await creating, true)
    assert.deepEqual(requests[0], {
      action: 'create',
      requestId: requests[0].requestId,
      sourceSessionId: 'source',
      question: '请逐步讲解曲率',
      mode: 'observer',
      scenario: 'present',
    })
    assert.equal(controller.getSnapshot().active.topic.sessionId, 'topic-free')
    assert.equal(controller.getSnapshot().active.topic.citation, null)
  } finally {
    await controller.dispose()
    if (originalStorage === undefined) delete globalThis.sessionStorage
    else Object.defineProperty(globalThis, 'sessionStorage', originalStorage)
  }
})

test('dismissing a failed free Topic restores the empty source state', async () => {
  const initial = snapshot(null)
  initial.phase = 'idle'
  const controller = createCompanionController(
    { binding: () => undefined },
    {
      getSnapshot: () => ({ status: 'ready', value: DEFAULT_CITECITER_SETTINGS, error: null }),
      subscribe: () => () => undefined,
      set: async () => undefined,
    },
    async (command) => command.action === 'create'
      ? { ok: false, error: { message: 'Citation source has no model route' } }
      : { ok: true, value: { kind: 'topics', topics: [] } },
    () => undefined,
    memoryStore(initial),
  )

  try {
    assert.equal(await controller.createFree('解释幂等键', 'qa'), false)
    assert.equal(controller.getSnapshot().phase, 'error')
    controller.dismissError()
    assert.equal(controller.getSnapshot().phase, 'idle')
    assert.equal(controller.getSnapshot().error, null)
  } finally {
    await controller.dispose()
  }
})

test('permanent deletion clears navigation and reports pending cleanup', async () => {
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const values = new Map([['citeciter:last-topic:source', 'topic-a']])
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
  })
  const commands = []
  const request = async (command) => {
    commands.push(command)
    if (command.action === 'delete') return {
      ok: true,
      value: { kind: 'deleted', sessionId: 'topic-a', sourceSessionId: 'source', topicId: 1, cleanup: 'pending' },
    }
    if (command.action === 'list') return { ok: true, value: { kind: 'topics', topics: [] } }
    throw new Error('unexpected ' + command.action)
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
    assert.equal(await controller.deleteTopic('wrong-topic'), false)
    assert.equal(commands.length, 0)
    assert.equal(await controller.deleteTopic('topic-a'), 'pending')
    assert.deepEqual(commands[0], {
      action: 'delete',
      topicSessionId: 'topic-a',
      confirmSessionId: 'topic-a',
    })
    assert.equal(values.has('citeciter:last-topic:source'), false)
    assert.equal(controller.getSnapshot().active, null)
    assert.equal(controller.getSnapshot().notice, 'Topic 已删除；相关资源仍在后台清理。')
  } finally {
    await controller.dispose()
    if (originalStorage === undefined) delete globalThis.localStorage
    else Object.defineProperty(globalThis, 'localStorage', originalStorage)
  }
})

test('restoring an archived Topic returns to the active list without closing it', async () => {
  const archived = topic('topic-a')
  archived.topic.archived = true
  const restored = topic('topic-a')
  const initial = snapshot(archived)
  initial.includeArchived = true
  const commands = []
  const request = async (command) => {
    commands.push(command)
    if (command.action === 'archive') return { ok: true, value: { kind: 'topic', topic: restored } }
    if (command.action === 'list') return { ok: true, value: { kind: 'topics', topics: [restored.topic] } }
    throw new Error('unexpected ' + command.action)
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
    memoryStore(initial),
  )

  try {
    assert.equal(await controller.archive(false), true)
    assert.deepEqual(commands[0], { action: 'archive', topicSessionId: 'topic-a', archived: false })
    assert.equal(commands[1].action, 'list')
    assert.equal(commands[1].includeArchived, false)
    assert.equal(controller.getSnapshot().includeArchived, false)
    assert.equal(controller.getSnapshot().active.topic.sessionId, 'topic-a')
    assert.equal(controller.getSnapshot().active.topic.archived, false)
  } finally {
    await controller.dispose()
  }
})

test('late deletion converges storage and list without clearing a newly opened Topic', async () => {
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const values = new Map([['citeciter:last-topic:source', 'topic-a']])
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
  })
  let releaseDelete
  let deleteStarted
  const started = new Promise((resolve) => { deleteStarted = resolve })
  const deleted = new Promise((resolve) => { releaseDelete = resolve })
  const topicB = topic('topic-b')
  const request = (command) => {
    if (command.action === 'delete') {
      deleteStarted()
      return deleted
    }
    if (command.action === 'get') return Promise.resolve({ ok: true, value: { kind: 'topic', topic: topicB } })
    if (command.action === 'list') return Promise.resolve({ ok: true, value: { kind: 'topics', topics: [topicB.topic] } })
    throw new Error('unexpected ' + command.action)
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
    const deleting = controller.deleteTopic('topic-a')
    await started
    await controller.openTopic('topic-b')
    releaseDelete({
      ok: true,
      value: { kind: 'deleted', sessionId: 'topic-a', sourceSessionId: 'source', topicId: 1, cleanup: 'complete' },
    })
    assert.equal(await deleting, false)
    assert.equal(values.get('citeciter:last-topic:source'), 'topic-b')
    assert.equal(controller.getSnapshot().active.topic.sessionId, 'topic-b')
    assert.equal(controller.getSnapshot().notice, null)
  } finally {
    await controller.dispose()
    if (originalStorage === undefined) delete globalThis.localStorage
    else Object.defineProperty(globalThis, 'localStorage', originalStorage)
  }
})

test('visibility leases keep polling until the last mounted surface releases', async () => {
  let gets = 0
  const active = topic('topic-a')
  const request = async (command) => {
    if (command.action === 'get') {
      gets += 1
      return { ok: true, value: { kind: 'topic', topic: active } }
    }
    if (command.action === 'list') {
      return { ok: true, value: { kind: 'topics', topics: [active.topic] } }
    }
    if (command.action === 'models') {
      return { ok: true, value: { kind: 'models', providers: [] } }
    }
    throw new Error('unexpected ' + command.action)
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
    memoryStore(snapshot(active)),
  )
  const releasePanel = controller.retainVisible()
  const releaseBoard = controller.retainVisible()

  try {
    releasePanel()
    await wait(850)
    assert.ok(gets > 0, 'the board lease keeps active polling alive')

    releaseBoard()
    await wait(30)
    const afterRelease = gets
    await wait(800)
    assert.equal(gets, afterRelease)
  } finally {
    await controller.dispose()
  }
})

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

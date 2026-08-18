import assert from 'node:assert/strict'
import test from 'node:test'
import { createExplainerController } from '../lib/types/client/explainer-controller.js'

const sourceId = 'parent-a'

const selection = (overrides = {}) => ({
  sourceSessionId: sourceId,
  text: 'Riemann curvature tensor',
  kind: 'assistant-step',
  anchorKey: 'assistant:1',
  startOffset: 10,
  endOffset: 34,
  prefixText: 'The ',
  suffixText: ' measures curvature.',
  x: 1,
  y: 2,
  ...overrides,
})

const assistantFlow = ({
  key = 'assistant:1',
  anchorSeq = 42,
  status = 'settled',
  turnStatus = 'closed',
} = {}) => ({
  key,
  kind: 'assistant-step',
  anchorSeq,
  location: {
    kind: 'step',
    turn: { status: turnStatus },
    step: { status: status === 'running' ? 'open' : 'closed' },
  },
  data: { status, blocks: [{ kind: 'text', text: 'source answer' }] },
})

function snapshotStore() {
  let snapshot = {
    phase: 'idle',
    selection: null,
    activeThread: null,
    threads: [],
    transcript: [],
    error: null,
  }
  const listeners = new Set()
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    update(mutator) {
      const next = { ...snapshot }
      mutator(next)
      snapshot = next
      for (const listener of [...listeners]) listener()
    },
    set(next) {
      snapshot = next
      for (const listener of [...listeners]) listener()
    },
  }
}

function observable(getSnapshot) {
  const listeners = new Set()
  return {
    getSnapshot,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    emit() {
      for (const listener of [...listeners]) listener()
    },
    get subscriberCount() { return listeners.size },
  }
}

function fakeSession(id, options = {}) {
  let running = options.running ?? false
  let nodes = options.nodes ?? []
  let projected = options.projected
  const calls = { open: 0, command: 0, prompt: [], cancel: 0, rename: [] }
  const sessionListeners = new Set()
  const projection = observable(() => projected)
  const session = {
    sessionId: id,
    calls,
    projections: { faceOf: () => projection },
    getSnapshot() {
      return {
        chat: {
          nodes: {
            get: (key) => (options.flows ?? []).find((node) => node.key === key),
            values: () => options.flows ?? [],
          },
        },
        nodes,
        partial: null,
        running,
        promptError: null,
        lastAgentError: null,
      }
    },
    subscribe(listener) {
      sessionListeners.add(listener)
      return () => sessionListeners.delete(listener)
    },
    async open() {
      calls.open++
      options.order?.push('open')
    },
    async command(line) {
      calls.command++
      options.order?.push('permission')
      assert.equal(line, '/permission read-only')
      return options.permission ?? { ok: true, value: { matched: true } }
    },
    async prompt(content, mode) {
      calls.prompt.push({ content, mode })
      options.order?.push('prompt')
      running = true
      return { ok: true, value: { accepted: true } }
    },
    async cancel() {
      calls.cancel++
      running = false
      return options.cancelResult ?? { ok: true, value: { accepted: true } }
    },
    async rename(title) {
      calls.rename.push(title)
      return { ok: true, value: { title, seq: 100 } }
    },
    publish({ nextNodes = nodes, nextRunning = running, nextProjected = projected } = {}) {
      nodes = nextNodes
      running = nextRunning
      projected = nextProjected
      projection.emit()
      for (const listener of [...sessionListeners]) listener()
    },
  }
  return session
}

function citation(overrides = {}) {
  return {
    schemaVersion: 1,
    sourceSessionId: sourceId,
    anchorKey: 'assistant:1',
    anchorSeq: 42,
    startOffset: 10,
    endOffset: 34,
    selectionFingerprint: 'a'.repeat(64),
    selectedText: 'Riemann curvature tensor',
    prefixText: 'The ',
    suffixText: ' measures curvature.',
    createdAt: 1,
    ...overrides,
  }
}

function projectedThread(overrides = {}) {
  return {
    thread: {
      citation: citation(),
      historyStartSeq: 10,
      contextSeq: 11,
      ...overrides,
    },
  }
}

function harness({ childOptions, prepare, existing } = {}) {
  const order = []
  const parent = fakeSession(sourceId, { flows: [assistantFlow()] })
  const children = new Map()
  let serial = 0
  const listState = {
    ids: [sourceId],
    byId: {
      [sourceId]: {
        id: sourceId,
        displayTitle: 'Geometry discussion',
        running: false,
        blank: false,
        updatedAt: 1,
      },
    },
    current: sourceId,
    phase: 'ready',
    subagentsByParent: {},
    jobsBySession: {},
  }
  const list = observable(() => listState)
  const forks = []

  if (existing !== undefined) {
    children.set(existing.id, existing.session)
    listState.ids.push(existing.id)
    listState.byId[existing.id] = {
      id: existing.id,
      displayTitle: existing.title ?? 'Recovered thread',
      ...(existing.title === undefined ? {} : { title: existing.title }),
      parentId: sourceId,
      running: false,
      blank: false,
      updatedAt: 20,
      projectionValues: { citeciter: existing.projected },
    }
  }

  const sessions = {
    list,
    binding(id) {
      const session = id === sourceId ? parent : children.get(id)
      return session === undefined ? undefined : { session }
    },
    async fork(opts) {
      order.push('fork')
      forks.push(opts)
      const id = `child-${++serial}`
      const child = fakeSession(id, { order, ...childOptions })
      children.set(id, child)
      listState.ids.push(id)
      listState.byId[id] = {
        id,
        displayTitle: id,
        parentId: sourceId,
        running: false,
        blank: false,
        updatedAt: 10 + serial,
      }
      list.emit()
      return id
    },
  }

  const archived = []
  const workspaceState = {
    items: [],
    archivedSessionIds: [],
    state: 'idle',
    phase: 'ready',
    error: null,
    baselinesReady: true,
    recentWorkspaceId: undefined,
  }
  const workspaceList = observable(() => workspaceState)
  const workspaces = {
    list: workspaceList,
    async archiveSession(id) {
      archived.push(id)
      workspaceState.archivedSessionIds = [...workspaceState.archivedSessionIds, id]
      workspaceList.emit()
    },
  }
  let prepareCalls = 0
  const prepareThread = prepare ?? (async () => {
    prepareCalls++
    order.push('prepare')
    return { ok: true, value: { ready: true, citation: citation() } }
  })
  const controller = createExplainerController(sessions, workspaces, prepareThread, snapshotStore())
  return {
    controller,
    sessions,
    workspaces,
    parent,
    children,
    forks,
    order,
    archived,
    get prepareCalls() { return prepareCalls },
  }
}

test('custom first question follows fail-closed ordering and stays a genuine user prompt', async () => {
  const app = harness()
  app.controller.select(selection())
  await app.controller.ask('Why does this tensor measure curvature?')

  const child = app.children.get('child-1')
  assert.deepEqual(app.forks, [{ sessionId: sourceId, atSeq: 42 }])
  assert.deepEqual(app.order, ['fork', 'open', 'permission', 'prepare', 'prompt'])
  assert.deepEqual(child.calls.prompt, [{
    content: [{ type: 'text', text: 'Why does this tensor measure curvature?' }],
    mode: 'queue',
  }])
  assert.equal(app.parent.calls.command, 0)
  assert.equal(app.parent.calls.prompt.length, 0)
})

test('read-only command rejection and unmatched command both block preparation and prompt', async () => {
  for (const permission of [
    { ok: false, error: { message: 'denied' } },
    { ok: true, value: { matched: false } },
  ]) {
    let prepares = 0
    const app = harness({
      childOptions: { permission },
      prepare: async () => {
        prepares++
        return { ok: true, value: { ready: true, citation: citation() } }
      },
    })
    app.controller.select(selection())
    await app.controller.ask('Explain it')
    const child = app.children.get('child-1')
    assert.equal(prepares, 0)
    assert.equal(child.calls.prompt.length, 0)
    assert.equal(app.controller.getSnapshot().phase, 'error')
  }
})

test('Host preparation failure blocks the first model-visible question', async () => {
  const app = harness({
    prepare: async () => ({ ok: false, error: { message: 'scope refused' } }),
  })
  app.controller.select(selection())
  await app.controller.ask('Explain it')
  assert.equal(app.children.get('child-1').calls.prompt.length, 0)
  assert.match(app.controller.getSnapshot().error, /scope refused/)
})

test('missing, running, and open-turn source nodes never fork', async () => {
  for (const flow of [
    undefined,
    assistantFlow({ status: 'running', turnStatus: 'open' }),
    assistantFlow({ status: 'settled', turnStatus: 'open' }),
  ]) {
    const app = harness()
    app.parent.getSnapshot = () => ({
      chat: { nodes: { get: () => flow, values: () => flow === undefined ? [] : [flow] } },
      nodes: [],
      partial: null,
      running: false,
      promptError: null,
      lastAgentError: null,
    })
    app.controller.select(selection())
    await app.controller.ask('Explain it')
    assert.equal(app.forks.length, 0)
    assert.equal(app.controller.getSnapshot().phase, 'error')
  }
})

test('follow-ups remain in the same child and are sent as independent user turns', async () => {
  const app = harness()
  app.controller.select(selection())
  await app.controller.ask('First question')
  await app.controller.ask('Follow-up question')

  const child = app.children.get('child-1')
  assert.equal(app.forks.length, 1)
  assert.deepEqual(child.calls.prompt.map((call) => call.content[0].text), [
    'First question',
    'Follow-up question',
  ])
  assert.equal(child.calls.command, 2)
})

test('different ranges in one assistant answer produce different children', async () => {
  const app = harness()
  app.controller.select(selection())
  await app.controller.ask('Explain first range')
  app.controller.select(selection({ text: 'tensor', startOffset: 18, endOffset: 24 }))
  await app.controller.ask('Explain second range')

  assert.equal(app.forks.length, 2)
  assert.deepEqual(app.forks.map((entry) => entry.atSeq), [42, 42])
})

test('projected Thread recovery does not fork and filters inherited history', async () => {
  const projection = projectedThread()
  const recovered = fakeSession('thread-1', {
    projected: projection,
    nodes: [
      { kind: 'assistant', seq: 5, blocks: [{ kind: 'text', text: 'inherited answer' }] },
      { kind: 'user', seq: 10, content: [{ type: 'text', text: 'first question' }] },
      { kind: 'context', seq: 11, content: [], source: {}, provenance: {}, form: 'snapshot' },
      { kind: 'assistant', seq: 12, blocks: [{ kind: 'text', text: 'thread answer' }] },
    ],
  })
  const app = harness({ existing: { id: 'thread-1', session: recovered, projected: projection, title: 'Curvature' } })

  await app.controller.switchThread('thread-1')
  assert.equal(app.forks.length, 0)
  assert.deepEqual(app.controller.getSnapshot().transcript.map((entry) => entry.text), [
    'first question',
    'thread answer',
  ])
  await app.controller.ask('A real follow-up')
  assert.equal(recovered.calls.prompt[0].content[0].text, 'A real follow-up')
})

test('rename and archive use existing durable session verbs', async () => {
  const projection = projectedThread()
  const recovered = fakeSession('thread-1', { projected: projection })
  const app = harness({ existing: { id: 'thread-1', session: recovered, projected: projection } })
  await app.controller.switchThread('thread-1')
  await app.controller.renameActive('My tensor notes')
  assert.deepEqual(recovered.calls.rename, ['My tensor notes'])
  assert.equal(app.controller.getSnapshot().activeThread.title, 'My tensor notes')

  await app.controller.archiveActive()
  assert.deepEqual(app.archived, ['thread-1'])
  assert.equal(app.controller.getSnapshot().activeThread, null)
  assert.equal(app.controller.getSnapshot().threads.length, 0)
})

test('dispose invalidates an in-flight fork before late binding or prompt', async () => {
  let resolveFork
  const forked = new Promise((resolve) => { resolveFork = resolve })
  const app = harness()
  let childBindings = 0
  app.sessions.fork = async (opts) => {
    app.forks.push(opts)
    return forked
  }
  const originalBinding = app.sessions.binding
  app.sessions.binding = (id) => {
    if (id !== sourceId) childBindings++
    return originalBinding(id)
  }

  app.controller.select(selection())
  const asking = app.controller.ask('Explain it')
  while (app.forks.length === 0) await new Promise((resolve) => setImmediate(resolve))
  const disposing = app.controller.dispose()
  resolveFork('child-late')
  await Promise.all([asking, disposing])

  assert.equal(childBindings, 0)
})

import assert from 'node:assert/strict'
import test from 'node:test'
import { readAssistantAnswer } from '../lib/types/client/answer.js'
import { createExplainerController } from '../lib/types/client/explainer-controller.js'

const selection = (anchorKey = '14:assistant-step2:1', text = 'Riemann curvature tensor') => ({
  text,
  kind: 'assistant-step',
  anchorKey,
  x: 1,
  y: 2,
})

const assistantNode = (
  key,
  anchorSeq,
  text = 'source answer',
  status = 'settled',
  turnStatus = 'closed',
) => ({
  key,
  kind: 'assistant-step',
  anchorSeq,
  location: {
    kind: 'step',
    turn: { status: turnStatus },
    step: { status: status === 'running' ? 'open' : 'closed' },
  },
  data: { status, blocks: [{ kind: 'text', text }] },
})

function createExplainer(sessions) {
  let snapshot = {
    phase: 'idle',
    childId: null,
    selection: null,
    answerText: null,
    error: null,
  }
  const listeners = new Set()
  return createExplainerController(sessions, {
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
  })
}

function fakeSession(options = {}) {
  let nodes = options.nodes ?? []
  let running = options.running ?? false
  const listeners = new Set()
  const calls = { open: 0, command: 0, prompt: 0, cancel: 0 }
  const session = {
    calls,
    get subscriberCount() { return listeners.size },
    getSnapshot() {
      return {
        chat: { nodes: { get: (key) => nodes.find((node) => node.key === key), values: () => nodes } },
        running,
        promptError: null,
        lastAgentError: null,
      }
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    async open() { calls.open++ },
    async command() {
      calls.command++
      return options.permission ?? { ok: true, value: { matched: true } }
    },
    async prompt() {
      calls.prompt++
      running = true
      return { ok: true, value: { accepted: true } }
    },
    async cancel() {
      calls.cancel++
      if (options.cancel !== undefined) return options.cancel()
      running = false
      return { ok: true, value: { accepted: true } }
    },
    publish(nextNodes, nextRunning = false) {
      nodes = nextNodes
      running = nextRunning
      for (const listener of [...listeners]) listener()
    },
  }
  return session
}

function fakeSessions(sessionFactory = () => fakeSession()) {
  let current = 'parent-a'
  let serial = 0
  const children = new Map()
  const parents = new Map([
    ['parent-a', fakeSession({ nodes: [
      assistantNode('14:assistant-step2:1', 42),
      assistantNode('14:assistant-step4:1', 70),
    ] })],
    ['parent-b', fakeSession({ nodes: [assistantNode('14:assistant-step3:1', 90)] })],
  ])
  const forks = []
  let bindingCalls = 0
  return {
    forks,
    children,
    parents,
    get bindingCalls() { return bindingCalls },
    setCurrent(id) { current = id },
    list: { getSnapshot: () => ({ current }) },
    async fork(opts) {
      forks.push(opts)
      const id = `child-${++serial}`
      children.set(id, sessionFactory(id))
      return id
    },
    binding(id) {
      bindingCalls++
      const session = parents.get(id) ?? children.get(id)
      return session === undefined ? undefined : { session }
    },
  }
}

test('explainer reads newly streamed assistant text before settlement', () => {
  assert.deepEqual(readAssistantAnswer({
    status: 'running',
    blocks: [
      { kind: 'reasoning', text: 'hidden chain' },
      { kind: 'text', text: 'A curvature measure' },
      { kind: 'text', text: ' of a manifold.' },
    ],
  }), {
    status: 'running',
    text: 'A curvature measure of a manifold.',
  })
})

test('explainer recognizes settled and interrupted output but ignores empty/non-assistant data', () => {
  assert.deepEqual(readAssistantAnswer({ status: 'settled', blocks: [{ kind: 'text', text: 'Done' }] }), {
    status: 'settled',
    text: 'Done',
  })
  assert.deepEqual(readAssistantAnswer({ status: 'interrupted', blocks: [{ kind: 'text', text: 'Partial' }] }), {
    status: 'interrupted',
    text: 'Partial',
  })
  assert.equal(readAssistantAnswer({ status: 'running', blocks: [{ kind: 'reasoning', text: 'only reasoning' }] }), null)
  assert.equal(readAssistantAnswer({ status: 'unknown', blocks: [{ kind: 'text', text: 'ignore' }] }), null)
})

test('an unavailable or running source node cannot fork an arbitrary prefix', async () => {
  const missingSessions = fakeSessions()
  const missingExplainer = createExplainer(missingSessions)
  await missingExplainer.start(selection('14:assistant-step99:1', 'missing'))
  assert.equal(missingSessions.forks.length, 0)
  assert.match(missingExplainer.getSnapshot().error, /context is no longer available/)

  const runningSessions = fakeSessions()
  runningSessions.parents.get('parent-a').publish([
    assistantNode('14:assistant-step2:1', 42, 'partial', 'running', 'open'),
  ], true)
  const runningExplainer = createExplainer(runningSessions)
  await runningExplainer.start(selection())
  assert.equal(runningSessions.forks.length, 0)
  assert.match(runningExplainer.getSnapshot().error, /response is not complete/)

  const openTurnSessions = fakeSessions()
  openTurnSessions.parents.get('parent-a').publish([
    assistantNode('14:assistant-step2:1', 42, 'settled step in an open turn', 'settled', 'open'),
  ], true)
  const openTurnExplainer = createExplainer(openTurnSessions)
  await openTurnExplainer.start(selection())
  assert.equal(openTurnSessions.forks.length, 0)
  assert.match(openTurnExplainer.getSnapshot().error, /turn is not complete/)
})

test('read-only failure blocks the model-visible explanation prompt', async () => {
  const child = fakeSession({ permission: { ok: false, error: { message: 'denied' } } })
  const sessions = fakeSessions(() => child)
  const explainer = createExplainer(sessions)

  await explainer.start(selection())

  assert.equal(child.calls.command, 1)
  assert.equal(child.calls.prompt, 0)
  assert.equal(explainer.getSnapshot().phase, 'error')
  assert.match(explainer.getSnapshot().error, /read-only switch failed: denied/)
})

test('an unrecognized permission command blocks the explanation prompt', async () => {
  const child = fakeSession({ permission: { ok: true, value: { matched: false } } })
  const sessions = fakeSessions(() => child)
  const explainer = createExplainer(sessions)

  await explainer.start(selection())

  assert.equal(child.calls.prompt, 0)
  assert.match(explainer.getSnapshot().error, /permission command was not recognized/)
})

test('a repeated explanation ignores the preceding assistant answer', async () => {
  const child = fakeSession()
  const sessions = fakeSessions(() => child)
  const explainer = createExplainer(sessions)

  await explainer.start(selection())
  child.publish([
    assistantNode('14:assistant-step3:1', 50, 'first answer'),
  ])
  assert.equal(explainer.getSnapshot().answerText, 'first answer')

  await explainer.start(selection('14:assistant-step2:1', 'Ricci contraction'))
  assert.equal(sessions.forks.length, 1)
  assert.equal(child.calls.prompt, 2)
  assert.equal(explainer.getSnapshot().phase, 'running')
  assert.equal(explainer.getSnapshot().answerText, null)

  child.publish([
    assistantNode('14:assistant-step3:1', 50, 'first answer'),
    assistantNode('14:assistant-step4:1', 60, 'second answer', 'running', 'open'),
  ], true)
  assert.equal(explainer.getSnapshot().answerText, 'second answer')
})

test('different real conversation keys with the same kind-length prefix fork at their node sequences', async () => {
  const sessions = fakeSessions()
  const explainer = createExplainer(sessions)

  await explainer.start(selection('14:assistant-step2:1', 'first turn'))
  const first = sessions.children.get('child-1')
  await explainer.start(selection('14:assistant-step4:1', 'later turn'))
  const second = sessions.children.get('child-2')

  assert.deepEqual(sessions.forks, [
    { sessionId: 'parent-a', atSeq: 42 },
    { sessionId: 'parent-a', atSeq: 70 },
  ])
  assert.equal(first.subscriberCount, 0)
  assert.equal(second.subscriberCount, 1)
})

test('changing the selected parent detaches the old child and forks a new child', async () => {
  const sessions = fakeSessions()
  const explainer = createExplainer(sessions)

  await explainer.start(selection())
  const first = sessions.children.get('child-1')
  assert.equal(first.subscriberCount, 1)

  sessions.setCurrent('parent-b')
  await explainer.start(selection('14:assistant-step3:1', 'new parent term'))
  const second = sessions.children.get('child-2')

  assert.deepEqual(sessions.forks.map(({ sessionId }) => sessionId), ['parent-a', 'parent-b'])
  assert.equal(first.subscriberCount, 0)
  assert.equal(second.subscriberCount, 1)
  assert.equal(explainer.getSnapshot().childId, 'child-2')
})

test('dispose invalidates an in-flight fork before it can bind or prompt', async () => {
  let resolveFork
  const forked = new Promise((resolve) => { resolveFork = resolve })
  let bindingCalls = 0
  const parent = fakeSession({ nodes: [assistantNode('14:assistant-step2:1', 42)] })
  const sessions = {
    list: { getSnapshot: () => ({ current: 'parent-a' }) },
    fork: () => forked,
    binding(id) {
      if (id === 'parent-a') return { session: parent }
      bindingCalls++
      return { session: fakeSession() }
    },
  }
  const explainer = createExplainer(sessions)
  const started = explainer.start(selection())
  await Promise.resolve()

  const disposing = explainer.dispose()
  let disposeSettled = false
  void disposing.then(() => { disposeSettled = true })
  await Promise.resolve()
  assert.equal(disposeSettled, false)

  resolveFork('child-late')
  await disposing
  await started

  assert.equal(disposeSettled, true)
  assert.equal(bindingCalls, 0)
})

test('dispose waits for an accepted cancellation to reach quiescence', async () => {
  let resolveCancel
  const cancelled = new Promise((resolve) => { resolveCancel = resolve })
  const child = fakeSession({ cancel: () => cancelled })
  const sessions = fakeSessions(() => child)
  const explainer = createExplainer(sessions)
  await explainer.start(selection())

  const stopping = explainer.stop()
  await Promise.resolve()
  const disposing = explainer.dispose()
  let disposeSettled = false
  void disposing.then(() => { disposeSettled = true })
  await Promise.resolve()
  assert.equal(disposeSettled, false)

  resolveCancel({ ok: true, value: { accepted: true } })
  await stopping
  await disposing
  assert.equal(disposeSettled, true)
})

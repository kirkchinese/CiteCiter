import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  TopicRuntime,
  citeCiterToolAvailable,
  firstPostSeedUserQuestion,
  foldTopicTitle,
  postSeedUserQuestionById,
  resolveTopicModeAndSeed,
  selectTopicTitleMessage,
} from '../lib/types/topic-runtime.js'

function deferred() {
  let resolve
  let reject
  const promise = new Promise((resolveValue, rejectValue) => {
    resolve = resolveValue
    reject = rejectValue
  })
  return { promise, resolve, reject }
}

function lifecycleRuntime() {
  const runtime = Object.create(TopicRuntime.prototype)
  Object.assign(runtime, {
    lifecycleAbort: new AbortController(),
    requests: new Set(),
    cleanupFailures: [],
    creations: new Map(),
    asks: new Map(),
    topicAdmissions: new Map(),
    modelChanges: new Map(),
    sourceAvailabilityChecks: new Map(),
    titleRefreshes: new Map(),
    opening: new Map(),
    pendingQuestions: new Map(),
    handles: new Map(),
    fibers: [],
    ready: Promise.resolve(),
    disposal: undefined,
    releasing: undefined,
    releaseQuestionProvider: undefined,
    releaseSandboxPolicy: undefined,
    releaseSubprocess: undefined,
    releaseFs: undefined,
    releaseLlm: undefined,
    closed: false,
  })
  return runtime
}

test('source-file settings drive the same visible and executable tool allowlist', () => {
  for (const name of ['read_source_session', 'ask_user_question']) {
    assert.equal(citeCiterToolAvailable(name, false), true)
  }
  for (const name of ['read', 'glob', 'grep']) {
    assert.equal(citeCiterToolAvailable(name, true), true)
    assert.equal(citeCiterToolAvailable(name, false), false)
  }
  for (const name of ['bash', 'write', 'edit', 'delete']) {
    assert.equal(citeCiterToolAvailable(name, true), false)
  }
})

test('Exact Fork uses a closed source turn and otherwise falls back only when requested', () => {
  const assistant = {
    seq: 2,
    type: 'assistant/message',
    data: { turn: 1, message: { content: [] } },
  }
  const closed = {
    session: { id: 'source' },
    events: [assistant, { seq: 3, type: 'step/end', data: { turn: 1, step: 1 } }, {
      seq: 4,
      type: 'turn/end',
      data: { turn: 1, reason: { kind: 'completed' } },
    }],
  }
  assert.deepEqual(resolveTopicModeAndSeed({ mode: 'exact-fork' }, closed, 2), {
    mode: 'exact-fork',
    forkThroughSeq: 4,
    seed: closed.events,
  })
  const open = { ...closed, events: [assistant] }
  assert.deepEqual(resolveTopicModeAndSeed({ mode: 'exact-when-available' }, open, 2), {
    mode: 'observer',
    forkThroughSeq: null,
    seed: [],
  })
  assert.throws(() => resolveTopicModeAndSeed({ mode: 'exact-fork' }, open, 2), /open model call|source turn/u)
})

test('Exact Topics ignore inherited titles and title the first post-seed question', () => {
  const inheritedTitle = {
    seq: 2,
    time: 2,
    type: 'session/title',
    data: { title: '来源会话标题', messageSeqs: [1], source: { kind: 'provider', provider: 'source' } },
    surfaceOp: 'append',
  }
  const topicTitle = {
    seq: 8,
    time: 8,
    type: 'session/title',
    data: { title: '签署位为何为假', messageSeqs: [4], source: { kind: 'provider', provider: 'citeciter' } },
    surfaceOp: 'append',
  }
  const metadata = { mode: 'exact-fork', forkThroughSeq: 3 }
  assert.equal(foldTopicTitle(metadata, [inheritedTitle]), undefined)
  assert.equal(foldTopicTitle(metadata, [inheritedTitle, topicTitle])?.title, '签署位为何为假')

  const selected = selectTopicTitleMessage({
    session: {
      header: { seedLength: 3 },
      events: [{ seq: 0 }, { seq: 1 }, { seq: 2 }, { seq: 4 }],
    },
    messages: [
      { seq: 1, text: '来源问题' },
      { seq: 4, text: '这个签署位为什么仍为 false？' },
    ],
  })
  assert.deepEqual(selected, { seq: 4, text: '这个签署位为什么仍为 false？' })
})

test('creation recovery ignores inherited source questions and finds the first Topic question', () => {
  const sourceQuestion = {
    seq: 1,
    type: 'user/message',
    data: { source: { kind: 'user' }, content: [{ type: 'text', text: '来源问题' }] },
  }
  const topicQuestion = {
    seq: 4,
    type: 'user/message',
    data: { source: { kind: 'user' }, content: [{ type: 'text', text: 'Topic 首问' }] },
  }
  assert.equal(firstPostSeedUserQuestion({
    header: { seedLength: 3 },
    events: [sourceQuestion, { seq: 2 }, { seq: 3 }, topicQuestion],
  }), 'Topic 首问')
  assert.equal(firstPostSeedUserQuestion({
    header: { seedLength: 3 },
    events: [sourceQuestion, { seq: 2 }, { seq: 3 }],
  }), null)
})

test('follow-up request identity survives browser and Host restarts in the Topic log', () => {
  const inherited = {
    seq: 1,
    type: 'user/message',
    data: { id: 'same-request', source: { kind: 'user' }, content: [{ type: 'text', text: '来源问题' }] },
  }
  const followup = {
    seq: 4,
    type: 'user/message',
    data: { id: 'same-request', source: { kind: 'user' }, content: [{ type: 'text', text: 'Topic 追问' }] },
  }
  const log = { header: { seedLength: 3 }, events: [inherited, { seq: 2 }, { seq: 3 }, followup] }
  assert.equal(postSeedUserQuestionById(log, 'same-request'), 'Topic 追问')
  assert.equal(postSeedUserQuestionById(log, 'missing-request'), null)

  const queued = {
    seq: 4,
    type: 'agent/inbox/spliced',
    data: {
      target: 'next-turn',
      start: 0,
      inserted: [{ id: 'queued-request', role: 'user', content: [{ type: 'text', text: '待处理追问' }], source: { kind: 'user' } }],
    },
  }
  const queuedLog = { header: { seedLength: 3 }, events: [inherited, { seq: 2 }, { seq: 3 }, queued] }
  assert.equal(firstPostSeedUserQuestion(queuedLog), '待处理追问')
  assert.equal(postSeedUserQuestionById(queuedLog, 'queued-request'), '待处理追问')

  const canceledLog = {
    ...queuedLog,
    events: [...queuedLog.events, {
      seq: 5,
      type: 'agent/inbox/spliced',
      data: { target: 'next-turn', start: 0, removedCount: 1, inserted: [], outcome: 'canceled' },
    }],
  }
  assert.equal(firstPostSeedUserQuestion(canceledLog), null)
  assert.equal(postSeedUserQuestionById(canceledLog, 'queued-request'), null)

  const pluginLog = {
    header: { seedLength: 0 },
    events: [{
      seq: 1,
      type: 'agent/inbox/spliced',
      data: {
        target: 'next-step',
        start: 0,
        inserted: [{ id: 'plugin-context', role: 'user', content: [{ type: 'text', text: '内部上下文' }], source: { kind: 'plugin', id: 'test' } }],
      },
    }],
  }
  assert.equal(firstPostSeedUserQuestion(pluginLog), null)
  assert.equal(postSeedUserQuestionById(pluginLog, 'plugin-context'), null)
})

test('Host acknowledges a follow-up only after its user message is durable', async () => {
  const listeners = new Map()
  const on = (event, listener) => {
    const bucket = listeners.get(event) ?? new Set()
    bucket.add(listener)
    listeners.set(event, bucket)
    return () => bucket.delete(listener)
  }
  const emit = (event, ...args) => {
    for (const listener of [...(listeners.get(event) ?? [])]) listener(...args)
  }
  const session = {}
  const message = {
    id: 'claimed-request',
    role: 'user',
    content: [{ type: 'text', text: '不会重复的问题' }],
    source: { kind: 'user' },
  }
  let flushes = 0
  const runtime = lifecycleRuntime()
  runtime.runtime = { sessions: { flush: async (subject) => {
    assert.equal(subject, session)
    flushes += 1
  } } }
  const handle = { agent: {
    ctx: { on },
    session,
    followup: (input) => emit('agent/inbox/claimed', { message: input, turn: 1 }),
  } }

  let acknowledged = false
  const pending = runtime.commitFollowup(handle, message).then(() => { acknowledged = true })
  await Promise.resolve()
  assert.equal(acknowledged, false)
  emit('session/event', session, {
    type: 'user/message',
    data: message,
  })
  await pending
  assert.equal(acknowledged, true)
  assert.equal(flushes, 1)
})

test('caller cancellation after claim preserves the idempotent follow-up', async () => {
  const runtime = lifecycleRuntime()
  const listeners = new Map()
  const on = (event, listener) => {
    const bucket = listeners.get(event) ?? new Set()
    bucket.add(listener)
    listeners.set(event, bucket)
    return () => bucket.delete(listener)
  }
  const emit = (event, ...args) => {
    for (const listener of [...(listeners.get(event) ?? [])]) listener(...args)
  }
  const claimed = deferred()
  const session = {}
  let followups = 0
  let removals = 0
  let flushes = 0
  let saves = 0
  let claimedMessage
  const handle = { agent: {
    ctx: { on },
    session,
    inbox: { remove: () => { removals += 1; return false } },
    followup: (message) => {
      followups += 1
      claimedMessage = message
      emit('agent/inbox/claimed', { message, turn: 1 })
      claimed.resolve()
    },
  } }
  runtime.handles.set('topic', handle)
  runtime.index = {
    loadBySessionId: async () => ({ sessionId: 'topic' }),
    save: async () => { saves += 1 },
  }
  runtime.readLog = async () => ({ header: { seedLength: 0 }, events: [] })
  runtime.runtime = { sessions: { flush: async () => { flushes += 1 } } }
  runtime.snapshot = (metadata) => metadata
  const request = {
    action: 'ask', topicSessionId: 'topic', requestId: 'same', question: '只应排队一次',
  }

  const firstCaller = new AbortController()
  const first = runtime.askIdempotent(request, firstCaller.signal)
  await claimed.promise
  firstCaller.abort(new Error('caller stopped waiting'))
  await assert.rejects(first, /caller stopped waiting/u)
  assert.equal(runtime.asks.size, 1)

  const retry = runtime.askIdempotent(structuredClone(request), new AbortController().signal)
  await Promise.resolve()
  assert.equal(followups, 1)
  assert.equal(removals, 1)
  emit('session/event', session, { type: 'user/message', data: claimedMessage })
  assert.equal((await retry).sessionId, 'topic')
  assert.equal(followups, 1)
  assert.equal(flushes, 1)
  assert.equal(saves, 1)
  assert.equal(runtime.asks.size, 0)
  assert.equal([...listeners.values()].every((bucket) => bucket.size === 0), true)
})

test('concurrent creation rejects one request ID reused for a different intent', async () => {
  const runtime = Object.create(TopicRuntime.prototype)
  runtime.creations = new Map()
  let release
  runtime.resumeOrCreate = () => new Promise((resolve) => { release = resolve })
  const request = {
    action: 'create',
    requestId: 'topic-one',
    selectionClaim: {
      sourceSessionId: 'source',
      anchorSeq: 1,
      displayText: 'quote',
      prefixText: '',
      suffixText: '',
    },
    question: '为什么？',
    mode: 'observer',
  }
  const first = runtime.createIdempotent(request)
  assert.equal(runtime.createIdempotent(structuredClone(request)), first)
  assert.throws(
    () => runtime.createIdempotent({ ...request, question: '另一个问题？' }),
    /requestId was reused for a different request/u,
  )
  await Promise.resolve()
  release({})
  await first
})

test('Host serializes follow-up admission per Topic', async () => {
  const runtime = Object.create(TopicRuntime.prototype)
  runtime.asks = new Map()
  runtime.topicAdmissions = new Map()
  const calls = []
  let releaseFirst
  runtime.ask = (_sessionId, question) => {
    calls.push(question)
    if (question !== '第一问') return Promise.resolve({ question })
    return new Promise((resolve) => { releaseFirst = () => resolve({ question }) })
  }
  const first = runtime.askIdempotent({
    action: 'ask', topicSessionId: 'topic', requestId: 'first', question: '第一问',
  })
  const second = runtime.askIdempotent({
    action: 'ask', topicSessionId: 'topic', requestId: 'second', question: '第二问',
  })
  await Promise.resolve()
  await Promise.resolve()
  assert.deepEqual(calls, ['第一问'])
  releaseFirst()
  await first
  await second
  assert.deepEqual(calls, ['第一问', '第二问'])
})

test('Host disposal aborts a stuck Agent resume and reaches quiescence', async () => {
  const runtime = lifecycleRuntime()
  let resumeSignal
  runtime.runtime = { agents: { resume: ({ signal }) => {
    resumeSignal = signal
    return new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true })
    })
  } } }
  const opening = runtime.ensureHandle({
    sessionId: 'topic',
    modelConfig: { provider: 'test', model: 'test' },
  }, runtime.lifecycleAbort.signal)
  const rejected = assert.rejects(opening, /CiteCiter is shutting down/u)

  const disposal = runtime.dispose()
  assert.equal(runtime.dispose(), disposal)
  await Promise.all([rejected, disposal])

  assert.equal(resumeSignal, runtime.lifecycleAbort.signal)
  assert.equal(resumeSignal.aborted, true)
  assert.equal(runtime.opening.size, 0)
  assert.equal(runtime.handles.size, 0)
})

test('an Agent handle resolving after shutdown is disposed instead of published', async () => {
  const runtime = lifecycleRuntime()
  const resumed = deferred()
  let disposals = 0
  const handle = { dispose: async () => { disposals += 1 } }
  runtime.runtime = { agents: { resume: () => resumed.promise } }
  const opening = runtime.ensureHandle({
    sessionId: 'topic',
    modelConfig: { provider: 'test', model: 'test' },
  }, runtime.lifecycleAbort.signal)
  const rejected = assert.rejects(opening, /CiteCiter is shutting down/u)
  let disposed = false
  const disposal = runtime.dispose().then(() => { disposed = true })
  await Promise.resolve()
  assert.equal(disposed, false)

  resumed.resolve(handle)
  await Promise.all([rejected, disposal])
  assert.equal(disposals, 1)
  assert.equal(runtime.opening.size, 0)
  assert.equal(runtime.handles.size, 0)

  const creatingRuntime = lifecycleRuntime()
  const created = deferred()
  let createSignal
  let createdDisposals = 0
  creatingRuntime.runtime = { agents: { create: (options) => {
    createSignal = options.signal
    return created.promise
  } } }
  const creating = creatingRuntime.createHandle({
    sessionId: 'created-topic',
    sourceSessionId: 'source',
    sourceCwd: '',
    mode: 'observer',
    modelConfig: { provider: 'test', model: 'test' },
  }, [], creatingRuntime.lifecycleAbort.signal)
  const createRejected = assert.rejects(creating, /CiteCiter is shutting down/u)
  creatingRuntime.beginClosing()
  created.resolve({ dispose: async () => { createdDisposals += 1 } })
  await createRejected
  await creatingRuntime.dispose()
  assert.equal(createSignal, creatingRuntime.lifecycleAbort.signal)
  assert.equal(createdDisposals, 1)
  assert.equal(creatingRuntime.handles.size, 0)
})

test('Host disposal reports a late Agent handle cleanup failure', async () => {
  const runtime = lifecycleRuntime()
  const resumed = deferred()
  runtime.runtime = { agents: { resume: () => resumed.promise } }
  const opening = runtime.ensureHandle({
    sessionId: 'topic',
    modelConfig: { provider: 'test', model: 'test' },
  }, runtime.lifecycleAbort.signal)
  const openingRejected = assert.rejects(opening, /late dispose failed/u)
  const disposalRejected = assert.rejects(runtime.dispose(), /Topic runtime cleanup failed/u)
  resumed.resolve({ dispose: async () => { throw new Error('late dispose failed') } })

  await Promise.all([openingRejected, disposalRejected])
  assert.equal(runtime.cleanupFailures.length, 0)
  assert.equal(runtime.handles.size, 0)
})

test('Host disposal drains a public Remote request before releasing runtime services', async () => {
  const runtime = lifecycleRuntime()
  const started = deferred()
  const response = deferred()
  runtime.executeRequest = () => {
    started.resolve()
    return response.promise
  }
  const request = runtime.request({ action: 'models' }, new AbortController().signal)
  await started.promise
  let disposed = false
  const disposal = runtime.dispose().then(() => { disposed = true })
  await Promise.resolve()
  assert.equal(disposed, false)

  response.resolve({ kind: 'models', providers: [] })
  assert.deepEqual(await request, { kind: 'models', providers: [] })
  await disposal
  assert.equal(runtime.requests.size, 0)
})

test('Host disposal aborts an admitted follow-up before durable commit', async () => {
  const runtime = lifecycleRuntime()
  const listeners = new Map()
  const on = (event, listener) => {
    const bucket = listeners.get(event) ?? new Set()
    bucket.add(listener)
    listeners.set(event, bucket)
    return () => bucket.delete(listener)
  }
  const started = deferred()
  let flushes = 0
  let saves = 0
  const session = {}
  const handle = {
    agent: {
      ctx: { on },
      session,
      inbox: { remove: () => false },
      followup: () => started.resolve(),
    },
    dispose: async () => {},
  }
  runtime.handles.set('topic', handle)
  runtime.index = {
    loadBySessionId: async () => ({ sessionId: 'topic' }),
    save: async () => { saves += 1 },
  }
  runtime.runtime = { sessions: { flush: async () => { flushes += 1 } } }
  const asking = runtime.askIdempotent({
    action: 'ask', topicSessionId: 'topic', question: 'pending',
  }, runtime.lifecycleAbort.signal)
  const rejected = assert.rejects(asking, /CiteCiter is shutting down/u)
  await started.promise
  await runtime.dispose()
  await rejected

  assert.equal(flushes, 0)
  assert.equal(saves, 0)
  assert.equal([...listeners.values()].every((bucket) => bucket.size === 0), true)
})

test('Host disposal drains admitted creation and rejects queued Topic work', async () => {
  const runtime = lifecycleRuntime()
  const creationGate = deferred()
  const askGate = deferred()
  const modelGate = deferred()
  runtime.resumeOrCreate = () => creationGate.promise
  const asks = []
  runtime.ask = (_sessionId, question) => {
    asks.push(question)
    return question === 'first' ? askGate.promise : Promise.resolve({ question })
  }
  const models = []
  const applyModel = (name, gate) => () => {
    models.push(name)
    return gate === undefined ? Promise.resolve({ name }) : gate.promise
  }
  const createRequest = {
    action: 'create',
    requestId: 'create',
    selectionClaim: {
      sourceSessionId: 'source', anchorSeq: 1, displayText: 'quote', prefixText: '', suffixText: '',
    },
    question: 'why',
    mode: 'observer',
  }
  const creation = runtime.createIdempotent(createRequest, runtime.lifecycleAbort.signal)
  const firstAsk = runtime.askIdempotent({
    action: 'ask', topicSessionId: 'topic', requestId: 'first', question: 'first',
  }, runtime.lifecycleAbort.signal)
  const secondAsk = runtime.askIdempotent({
    action: 'ask', topicSessionId: 'topic', requestId: 'second', question: 'second',
  }, runtime.lifecycleAbort.signal)
  const firstModel = runtime.enqueueModelChange(
    'topic',
    applyModel('first', modelGate),
    runtime.lifecycleAbort.signal,
  )
  const secondModel = runtime.enqueueModelChange(
    'topic',
    applyModel('second'),
    runtime.lifecycleAbort.signal,
  )
  const creationRejected = assert.rejects(creation, /CiteCiter is shutting down/u)
  const firstAskRejected = assert.rejects(firstAsk, /CiteCiter is shutting down/u)
  const secondAskRejected = assert.rejects(secondAsk, /CiteCiter is shutting down/u)
  const secondModelRejected = assert.rejects(secondModel, /CiteCiter is shutting down/u)
  await Promise.resolve()
  await Promise.resolve()
  assert.deepEqual(asks, ['first'])
  assert.deepEqual(models, ['first'])

  let disposed = false
  const disposal = runtime.dispose().then(() => { disposed = true })
  await Promise.resolve()
  assert.equal(disposed, false)
  creationGate.resolve({})
  askGate.resolve({})
  modelGate.resolve({})
  await Promise.all([
    creationRejected,
    firstAskRejected,
    firstModel,
    secondAskRejected,
    secondModelRejected,
    disposal,
  ])

  assert.deepEqual(asks, ['first'])
  assert.deepEqual(models, ['first'])
  assert.equal(runtime.creations.size, 0)
  assert.equal(runtime.asks.size, 0)
  assert.equal(runtime.topicAdmissions.size, 0)
  assert.equal(runtime.modelChanges.size, 0)
})

test('Host disposal drains a detached source availability check', async () => {
  const runtime = lifecycleRuntime()
  const sourceRead = deferred()
  let reads = 0
  let remembers = 0
  runtime.host = { sessionQuery: { readSession: () => {
    reads += 1
    return sourceRead.promise
  } } }
  runtime.sourceAvailability = new Map()
  runtime.rememberSourceAvailability = async () => { remembers += 1 }
  const metadata = { sessionId: 'topic', sourceSessionId: 'source' }
  runtime.scheduleSourceAvailabilityCheck(metadata)
  let disposed = false
  const disposal = runtime.dispose().then(() => { disposed = true })
  await Promise.resolve()
  assert.equal(disposed, false)

  sourceRead.resolve({})
  await disposal
  assert.equal(remembers, 0)
  assert.equal(runtime.sourceAvailabilityChecks.size, 0)
  runtime.scheduleSourceAvailabilityCheck(metadata)
  assert.equal(reads, 1)
})

test('creation recovery and follow-up admission share the Topic queue', async () => {
  const runtime = Object.create(TopicRuntime.prototype)
  runtime.asks = new Map()
  runtime.topicAdmissions = new Map()
  runtime.index = { list: async () => [{ sessionId: 'topic', createRequestId: 'create' }] }
  runtime.readLog = async () => ({ header: { seedLength: 0 }, events: [] })
  runtime.ensureHandle = async () => ({ agent: { inbox: { remove: () => false } } })
  runtime.snapshot = async () => ({})
  let releaseRepair
  let markRepairStarted
  const repairStarted = new Promise((resolve) => { markRepairStarted = resolve })
  runtime.commitFollowup = () => new Promise((resolve) => {
    releaseRepair = resolve
    markRepairStarted()
  })
  let asks = 0
  runtime.ask = async () => { asks += 1; return {} }

  const repair = runtime.resumeOrCreate({
    action: 'create',
    requestId: 'create',
    selectionClaim: {
      sourceSessionId: 'source', anchorSeq: 1, displayText: 'quote', prefixText: '', suffixText: '',
    },
    question: '恢复首问',
    mode: 'observer',
  })
  await repairStarted
  const followUp = runtime.askIdempotent({
    action: 'ask', topicSessionId: 'topic', requestId: 'ask', question: '后续问题',
  })
  await Promise.resolve()
  assert.equal(asks, 0)
  releaseRepair()
  await repair
  await followUp
  assert.equal(asks, 1)
})

test('live committed create and ask retries flush before the Host acknowledges them', async () => {
  const session = {}
  const metadata = { sessionId: 'topic' }
  let flushes = 0
  const runtime = Object.create(TopicRuntime.prototype)
  runtime.topicAdmissions = new Map()
  runtime.index = {
    list: async () => [{ ...metadata, createRequestId: 'retry' }],
    loadBySessionId: async () => metadata,
  }
  runtime.handles = new Map([['topic', { agent: { session } }]])
  runtime.runtime = { sessions: { flush: async (subject) => {
    assert.equal(subject, session)
    flushes += 1
  } } }
  runtime.readLog = async () => ({
    header: { seedLength: 0 },
    events: [{
      seq: 1,
      type: 'user/message',
      data: {
        id: 'retry', role: 'user', content: [{ type: 'text', text: '已提交' }], source: { kind: 'user' },
      },
    }],
  })
  runtime.snapshot = async () => ({})
  await runtime.ask('topic', '已提交', 'retry')
  assert.equal(flushes, 1)
  await runtime.resumeOrCreate({
    action: 'create',
    requestId: 'retry',
    selectionClaim: {
      sourceSessionId: 'source', anchorSeq: 1, displayText: 'quote', prefixText: '', suffixText: '',
    },
    question: '已提交',
    mode: 'observer',
  })
  assert.equal(flushes, 2)
})

test('Topic list summaries do not replay every Topic or source Session', async () => {
  const source = await readFile(new URL('../src/topic-runtime.ts', import.meta.url), 'utf8')
  const list = source.slice(
    source.indexOf('private async list('),
    source.indexOf('private async get('),
  )
  assert.doesNotMatch(list, /this\.snapshot\(/u)
  assert.doesNotMatch(list, /sessionQuery\.readSession/u)
  assert.match(list, /this\.summary\(topic, signal\)/u)
})

test('Topic metadata is committed before the first Agent request can use source tools', async () => {
  const source = await readFile(new URL('../src/topic-runtime.ts', import.meta.url), 'utf8')
  const create = source.slice(
    source.indexOf('private async create(request:'),
    source.indexOf('private createIdempotent('),
  )
  const saved = create.indexOf('await this.index.save(metadata)')
  const admitted = create.indexOf('await this.commitFollowup(')
  assert.notEqual(saved, -1)
  assert.notEqual(admitted, -1)
  assert.ok(saved < admitted)
})

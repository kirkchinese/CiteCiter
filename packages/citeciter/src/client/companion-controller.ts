import {
  createSnapshotStore,
  type ISessions,
  type SessionId,
  type SettingsScope,
  type SnapshotStore,
} from '@deepseek-ai/dsh-client-runtime/client'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import {
  DEFAULT_CITECITER_SETTINGS,
  type CiteCiterRequest,
  type CiteCiterResponse,
  type CiteCiterSettings,
  type ProviderOption,
  type QuestionAnswer,
  type TopicSnapshot,
  type TopicSummary,
} from '../topic.ts'
import { readAssistantAnswer } from './answer.ts'
import { createCitationDraft, normalizeSelectionAgainstAnswer } from './citation.ts'
import { normalizeQuestion } from './prompt.ts'
import { isCurrentTopicResponse, shouldReopenLastTopic } from './response-guard.ts'
import type { CiteSelection } from './types.ts'

export type CompanionPhase = 'idle' | 'creating' | 'ready' | 'running' | 'error'
export type CreateMode = 'observer' | 'exact-fork' | 'exact-when-available'

export interface CompanionSnapshot {
  sourceSessionId: SessionId | null
  phase: CompanionPhase
  draftQuote: string | null
  active: TopicSnapshot | null
  topics: readonly TopicSummary[]
  providers: readonly ProviderOption[]
  settings: CiteCiterSettings
  includeArchived: boolean
  error: string | null
}

type RemoteRequest = (request: CiteCiterRequest) => Promise<RemoteResult<CiteCiterResponse>>

export interface CompanionFace {
  getSnapshot(): CompanionSnapshot
  subscribe(listener: () => void): () => void
  setSource(sessionId: SessionId | null): void
  setVisible(visible: boolean): void
  create(selection: CiteSelection, question: string, mode?: CreateMode): Promise<void>
  openTopic(sessionId: string): Promise<void>
  ask(question: string): Promise<void>
  answerQuestion(key: string, answer: QuestionAnswer): Promise<void>
  cancelQuestion(key: string): Promise<void>
  stop(): Promise<void>
  rename(title: string): Promise<void>
  archive(archived: boolean): Promise<void>
  setIncludeArchived(include: boolean): void
  selectModel(provider: string, model: string, reasoningEffort: string | null): Promise<void>
  setSetting<Key extends keyof CiteCiterSettings>(key: Key, value: CiteCiterSettings[Key]): Promise<void>
  dispose(): Promise<void>
}

const EMPTY: CompanionSnapshot = {
  sourceSessionId: null,
  phase: 'idle',
  draftQuote: null,
  active: null,
  topics: [],
  providers: [],
  settings: DEFAULT_CITECITER_SETTINGS,
  includeArchived: false,
  error: null,
}

function remoteValue(result: RemoteResult<CiteCiterResponse>): CiteCiterResponse {
  if (!result.ok) throw new Error(result.error.message)
  return result.value
}

function lastTopicKey(sourceSessionId: string): string {
  return 'citeciter:last-topic:' + sourceSessionId
}

function readLastTopic(sourceSessionId: string): string | null {
  try {
    return localStorage.getItem(lastTopicKey(sourceSessionId))
  } catch {
    // Browsers that deny localStorage simply skip the convenience pointer.
    return null
  }
}

function writeLastTopic(sourceSessionId: string, topicSessionId: string): void {
  try {
    localStorage.setItem(lastTopicKey(sourceSessionId), topicSessionId)
  } catch {
    // Topic durability is Host-owned; a blocked convenience pointer loses no data.
  }
}

/** Bind private Topic Remote calls to one browser snapshot and polling lifecycle. */
export function createCompanionController(
  sessions: ISessions,
  settingsScope: SettingsScope<CiteCiterSettings>,
  request: RemoteRequest,
  store: SnapshotStore<CompanionSnapshot> = createSnapshotStore(EMPTY),
): CompanionFace {
  let disposed = false
  let visible = false
  let epoch = 0
  let pollTimer: ReturnType<typeof setInterval> | null = null
  let polling = false
  let pollCount = 0

  const update = (mutator: (draft: CompanionSnapshot) => void) => {
    if (!disposed) store.update(mutator)
  }
  const fail = (error: unknown, operationEpoch = epoch) => {
    if (disposed || operationEpoch !== epoch) return
    update((draft) => {
      draft.phase = 'error'
      draft.error = error instanceof Error ? error.message : String(error)
    })
  }
  const acceptTopic = (topic: TopicSnapshot, operationEpoch: number, expectedSessionId?: string) => {
    const current = store.getSnapshot()
    if (disposed || !isCurrentTopicResponse(
      operationEpoch,
      epoch,
      current.sourceSessionId,
      topic.topic.sourceSessionId,
      topic.topic.sessionId,
      expectedSessionId,
    )) return
    update((draft) => {
      draft.active = topic
      draft.draftQuote = null
      draft.phase = topic.topic.running ? 'running' : topic.error === null ? 'ready' : 'error'
      draft.error = topic.error
    })
    writeLastTopic(topic.topic.sourceSessionId, topic.topic.sessionId)
  }

  const call = async (command: CiteCiterRequest): Promise<CiteCiterResponse> => remoteValue(await request(command))

  const openTopic = async (sessionId: string, operationEpoch = epoch): Promise<void> => {
    update((draft) => {
      draft.phase = 'creating'
      draft.error = null
    })
    try {
      const response = await call({ action: 'get', topicSessionId: sessionId })
      if (response.kind !== 'topic') throw new Error('CiteCiter 返回了错误的 Topic 响应')
      acceptTopic(response.topic, operationEpoch, sessionId)
    } catch (error) {
      fail(error, operationEpoch)
    }
  }

  const refreshTopics = async (operationEpoch = epoch): Promise<void> => {
    const snapshot = store.getSnapshot()
    if (snapshot.sourceSessionId === null) return
    const response = await call({
      action: 'list',
      sourceSessionId: snapshot.sourceSessionId,
      includeArchived: snapshot.includeArchived,
    })
    if (response.kind !== 'topics' || operationEpoch !== epoch || disposed) return
    update((draft) => {
      draft.topics = response.topics
    })
    const current = store.getSnapshot()
    if (!shouldReopenLastTopic(
      current.active !== null,
      current.phase === 'idle',
      current.settings.reopenLastTopic,
    )) return
    const remembered = readLastTopic(snapshot.sourceSessionId)
    const target = response.topics.find((topic) => topic.sessionId === remembered) ?? response.topics[0]
    if (target !== undefined) await openTopic(target.sessionId, operationEpoch)
  }

  const refreshActive = async (operationEpoch = epoch): Promise<void> => {
    const active = store.getSnapshot().active
    if (active === null) return
    const response = await call({ action: 'get', topicSessionId: active.topic.sessionId })
    if (response.kind === 'topic') acceptTopic(response.topic, operationEpoch, active.topic.sessionId)
  }

  const poll = async () => {
    if (!visible || disposed || polling) return
    polling = true
    const operationEpoch = epoch
    try {
      await refreshActive(operationEpoch)
      if (pollCount++ % 6 === 0) await refreshTopics(operationEpoch)
    } catch (error) {
      fail(error, operationEpoch)
    } finally {
      polling = false
    }
  }

  const loadModels = async () => {
    if (store.getSnapshot().providers.length > 0) return
    const operationEpoch = epoch
    try {
      const response = await call({ action: 'models' })
      if (response.kind === 'models') update((draft) => {
        draft.providers = response.providers
      })
    } catch (error) {
      fail(error, operationEpoch)
    }
  }

  const settingsSnapshot = settingsScope.getSnapshot()
  const initialSettings = settingsSnapshot.value ?? DEFAULT_CITECITER_SETTINGS
  update((draft) => {
    draft.settings = initialSettings
  })
  const unsubscribeSettings = settingsScope.subscribe(() => {
    const value = settingsScope.getSnapshot().value
    if (value !== undefined) update((draft) => {
      draft.settings = value
    })
  })

  const setSource = (sessionId: SessionId | null) => {
    if (disposed || store.getSnapshot().sourceSessionId === sessionId) return
    epoch++
    update((draft) => {
      draft.sourceSessionId = sessionId
      draft.phase = 'idle'
      draft.draftQuote = null
      draft.active = null
      draft.topics = []
      draft.error = null
    })
    if (visible && sessionId !== null) void refreshTopics().catch(fail)
  }

  const setVisible = (next: boolean) => {
    if (disposed || visible === next) return
    visible = next
    if (!visible) {
      if (pollTimer !== null) clearInterval(pollTimer)
      pollTimer = null
      return
    }
    void refreshTopics().catch(fail)
    void loadModels()
    pollTimer = setInterval(() => { void poll() }, 700)
  }

  const create = async (selection: CiteSelection, rawQuestion: string, mode?: CreateMode): Promise<void> => {
    const question = normalizeQuestion(rawQuestion)
    epoch++
    const operationEpoch = epoch
    update((draft) => {
      draft.sourceSessionId = selection.sourceSessionId
      draft.phase = 'creating'
      draft.draftQuote = selection.displayText
      draft.active = null
      draft.error = null
    })
    try {
      const binding = sessions.binding(selection.sourceSessionId)
      const node = binding?.session.getSnapshot().chat.nodes.get(selection.anchorKey)
      if (node === undefined || node.kind !== 'assistant-step') throw new Error('选中的模型回答已不在当前会话快照中')
      const answer = readAssistantAnswer(node.data)
      if (answer === null || answer.status !== 'settled') {
        throw new Error('请在一次模型调用完成后引用；无需等待整轮长任务结束')
      }
      const citation = await createCitationDraft(normalizeSelectionAgainstAnswer(selection, answer.text), node.anchorSeq)
      const response = await call({
        action: 'create',
        citation,
        question,
        mode: mode ?? store.getSnapshot().settings.defaultMode,
      })
      if (response.kind !== 'topic') throw new Error('CiteCiter 返回了错误的创建响应')
      acceptTopic(response.topic, operationEpoch)
      await refreshTopics(operationEpoch)
    } catch (error) {
      fail(error, operationEpoch)
    }
  }

  const ask = async (rawQuestion: string): Promise<void> => {
    const active = store.getSnapshot().active
    if (active === null) {
      fail('请先从选区创建 Topic，或打开一个旧 Topic')
      return
    }
    const question = normalizeQuestion(rawQuestion)
    const operationEpoch = ++epoch
    update((draft) => {
      draft.phase = 'running'
      draft.error = null
    })
    try {
      const response = await call({ action: 'ask', topicSessionId: active.topic.sessionId, question })
      if (response.kind === 'topic') acceptTopic(response.topic, operationEpoch, active.topic.sessionId)
    } catch (error) {
      fail(error, operationEpoch)
    }
  }

  const stop = async (): Promise<void> => {
    const active = store.getSnapshot().active
    if (active === null) return
    const operationEpoch = ++epoch
    try {
      const response = await call({ action: 'stop', topicSessionId: active.topic.sessionId })
      if (response.kind === 'topic') acceptTopic(response.topic, operationEpoch, active.topic.sessionId)
    } catch (error) {
      fail(error, operationEpoch)
    }
  }

  const answerQuestion = async (key: string, answer: QuestionAnswer): Promise<void> => {
    const active = store.getSnapshot().active
    if (active === null) return
    const operationEpoch = ++epoch
    try {
      const response = await call({
        action: 'answer-question',
        topicSessionId: active.topic.sessionId,
        key,
        answer,
      })
      if (response.kind === 'topic') acceptTopic(response.topic, operationEpoch, active.topic.sessionId)
    } catch (error) {
      fail(error, operationEpoch)
    }
  }

  const cancelQuestion = async (key: string): Promise<void> => {
    const active = store.getSnapshot().active
    if (active === null) return
    const operationEpoch = ++epoch
    try {
      const response = await call({
        action: 'cancel-question',
        topicSessionId: active.topic.sessionId,
        key,
      })
      if (response.kind === 'topic') acceptTopic(response.topic, operationEpoch, active.topic.sessionId)
    } catch (error) {
      fail(error, operationEpoch)
    }
  }

  const rename = async (rawTitle: string): Promise<void> => {
    const active = store.getSnapshot().active
    const title = rawTitle.trim()
    if (active === null || title === '') return
    const operationEpoch = ++epoch
    try {
      const response = await call({ action: 'rename', topicSessionId: active.topic.sessionId, title })
      if (response.kind === 'topic') acceptTopic(response.topic, operationEpoch, active.topic.sessionId)
      await refreshTopics(operationEpoch)
    } catch (error) {
      fail(error, operationEpoch)
    }
  }

  const archive = async (archived: boolean): Promise<void> => {
    const active = store.getSnapshot().active
    if (active === null) return
    const operationEpoch = ++epoch
    try {
      const response = await call({ action: 'archive', topicSessionId: active.topic.sessionId, archived })
      if (response.kind === 'topic') acceptTopic(response.topic, operationEpoch, active.topic.sessionId)
      if (archived !== store.getSnapshot().includeArchived) update((draft) => {
        draft.active = null
        draft.phase = 'idle'
      })
      await refreshTopics(operationEpoch)
    } catch (error) {
      fail(error, operationEpoch)
    }
  }

  const selectModel = async (provider: string, model: string, reasoningEffort: string | null): Promise<void> => {
    const active = store.getSnapshot().active
    if (active === null) return
    const operationEpoch = ++epoch
    try {
      const response = await call({
        action: 'select-model',
        topicSessionId: active.topic.sessionId,
        provider,
        model,
        reasoningEffort,
      })
      if (response.kind === 'topic') acceptTopic(response.topic, operationEpoch, active.topic.sessionId)
    } catch (error) {
      fail(error, operationEpoch)
    }
  }

  return {
    getSnapshot: store.getSnapshot,
    subscribe: store.subscribe,
    setSource,
    setVisible,
    create,
    openTopic: (sessionId) => openTopic(sessionId, ++epoch),
    ask,
    answerQuestion,
    cancelQuestion,
    stop,
    rename,
    archive,
    setIncludeArchived: (include) => {
      const operationEpoch = ++epoch
      update((draft) => {
        draft.includeArchived = include
        draft.active = null
        draft.topics = []
        draft.phase = 'idle'
      })
      void refreshTopics(operationEpoch).catch((error) => fail(error, operationEpoch))
    },
    selectModel,
    setSetting: (key, value) => settingsScope.set(key, value),
    dispose: async () => {
      if (disposed) return
      disposed = true
      if (pollTimer !== null) clearInterval(pollTimer)
      unsubscribeSettings()
    },
  }
}

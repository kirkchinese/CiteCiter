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
import { normalizeQuestion } from './prompt.ts'
import { isCurrentTopicResponse, shouldReopenLastTopic } from './response-guard.ts'
import type { CiteSelection } from './types.ts'

export type CompanionPhase = 'idle' | 'creating' | 'ready' | 'running' | 'stopping' | 'stopped' | 'error'
export type CreateMode = 'observer' | 'exact-fork' | 'exact-when-available'
export type TopicsStatus = 'idle' | 'loading' | 'ready' | 'error'
export type SettingsSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface CompanionSnapshot {
  sourceSessionId: SessionId | null
  phase: CompanionPhase
  draftQuote: string | null
  sourceAnchorKey: string | null
  active: TopicSnapshot | null
  topics: readonly TopicSummary[]
  topicsStatus: TopicsStatus
  topicsError: string | null
  providers: readonly ProviderOption[]
  settings: CiteCiterSettings
  settingsSaveStatus: SettingsSaveStatus
  settingsSaveMessage: string | null
  modelRouteSaving: boolean
  reasoningEffortSaving: boolean
  renaming: boolean
  archiving: boolean
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
  ask(question: string): Promise<boolean>
  answerQuestion(key: string, answer: QuestionAnswer): Promise<void>
  cancelQuestion(key: string): Promise<void>
  stop(): Promise<void>
  rename(title: string): Promise<boolean>
  archive(archived: boolean): Promise<boolean>
  setIncludeArchived(include: boolean): void
  setModelRoute(provider: string, model: string): Promise<void>
  setReasoningEffort(reasoningEffort: string | null): Promise<void>
  setSetting<Key extends keyof CiteCiterSettings>(key: Key, value: CiteCiterSettings[Key]): Promise<void>
  dispose(): Promise<void>
}

const EMPTY: CompanionSnapshot = {
  sourceSessionId: null,
  phase: 'idle',
  draftQuote: null,
  sourceAnchorKey: null,
  active: null,
  topics: [],
  topicsStatus: 'idle',
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

function citationAnchorKey(sourceSessionId: string, anchorSeq: number): string {
  return `citeciter:source-anchor:${sourceSessionId}:${anchorSeq}`
}

function readCitationAnchor(sourceSessionId: string, anchorSeq: number): string | null {
  try {
    return localStorage.getItem(citationAnchorKey(sourceSessionId, anchorSeq))
  } catch {
    return null
  }
}

function writeCitationAnchor(sourceSessionId: string, anchorSeq: number, anchorKey: string): void {
  try {
    localStorage.setItem(citationAnchorKey(sourceSessionId, anchorSeq), anchorKey)
  } catch {
    // This hover-only visual hint never owns Citation durability.
  }
}

/** Bind private Topic Remote calls to one browser snapshot and polling lifecycle. */
export function createCompanionController(
  sessions: ISessions,
  settingsScope: SettingsScope<CiteCiterSettings>,
  request: RemoteRequest,
  onAutoOpen: () => void = () => undefined,
  store: SnapshotStore<CompanionSnapshot> = createSnapshotStore(EMPTY),
): CompanionFace {
  let disposed = false
  let visible = false
  let sourceGeneration = 0
  let activeGeneration = 0
  let pollTimer: ReturnType<typeof setInterval> | null = null
  let polling = false
  let pollCount = 0
  let topicsRefresh: Promise<void> | null = null
  let topicsRefreshAgain = false
  let topicsShowLoading = false
  let reopenAttemptedGeneration = -1
  let reopenSuppressedGeneration = -1
  let settingOperation = 0
  let settingsReady = false
  const pendingSettings = new Map<keyof CiteCiterSettings, { readonly operation: number, readonly value: CiteCiterSettings[keyof CiteCiterSettings] }>()
  let routeOperation = 0
  let effortOperation = 0
  let pendingRoute: { readonly operation: number, readonly sessionId: string, readonly provider: string, readonly model: string } | null = null
  let pendingEffort: { readonly operation: number, readonly sessionId: string, readonly reasoningEffort: string | null } | null = null

  const update = (mutator: (draft: CompanionSnapshot) => void) => {
    if (!disposed) store.update(mutator)
  }
  const fail = (error: unknown, operationGeneration = activeGeneration) => {
    if (disposed || operationGeneration !== activeGeneration) return
    update((draft) => {
      draft.phase = 'error'
      draft.error = error instanceof Error ? error.message : String(error)
    })
  }
  const withPendingModelConfig = (topic: TopicSnapshot): TopicSnapshot => {
    if (pendingRoute?.sessionId !== topic.topic.sessionId && pendingEffort?.sessionId !== topic.topic.sessionId) return topic
    const modelConfig = { ...topic.topic.modelConfig }
    if (pendingRoute?.sessionId === topic.topic.sessionId) {
      modelConfig.provider = pendingRoute.provider
      modelConfig.model = pendingRoute.model
      delete modelConfig.reasoningEffort
    }
    if (pendingEffort?.sessionId === topic.topic.sessionId) {
      if (pendingEffort.reasoningEffort === null) delete modelConfig.reasoningEffort
      else modelConfig.reasoningEffort = pendingEffort.reasoningEffort
    }
    return { ...topic, topic: { ...topic.topic, modelConfig } }
  }
  const upsertTopic = (draft: CompanionSnapshot, topic: TopicSummary) => {
    const belongs = topic.archived === draft.includeArchived
    const topics = draft.topics.filter((candidate) => candidate.sessionId !== topic.sessionId)
    draft.topics = belongs ? [...topics, topic].sort((left, right) => right.updatedAt - left.updatedAt) : topics
  }
  const acceptTopic = (rawTopic: TopicSnapshot, operationGeneration: number, expectedSessionId?: string) => {
    const topic = withPendingModelConfig(rawTopic)
    const current = store.getSnapshot()
    if (disposed || !isCurrentTopicResponse(
      operationGeneration,
      activeGeneration,
      current.sourceSessionId,
      topic.topic.sourceSessionId,
      topic.topic.sessionId,
      expectedSessionId,
    )) return
    update((draft) => {
      const lastMessage = topic.messages.at(-1)
      draft.active = topic
      draft.draftQuote = null
      draft.sourceAnchorKey = readCitationAnchor(topic.topic.sourceSessionId, topic.topic.citation.anchorSeq)
      const stopped = lastMessage?.role === 'error' && lastMessage.status === 'stopped'
      draft.phase = topic.topic.running ? 'running' : stopped ? 'stopped' : topic.error === null ? 'ready' : 'error'
      draft.error = topic.error
      upsertTopic(draft, topic.topic)
    })
    writeLastTopic(topic.topic.sourceSessionId, topic.topic.sessionId)
  }

  const call = async (command: CiteCiterRequest): Promise<CiteCiterResponse> => remoteValue(await request(command))

  const openTopic = async (sessionId: string, operationGeneration = activeGeneration): Promise<void> => {
    update((draft) => {
      draft.phase = 'creating'
      draft.error = null
    })
    try {
      const response = await call({ action: 'get', topicSessionId: sessionId })
      if (response.kind !== 'topic') throw new Error('CiteCiter 返回了错误的 Topic 响应')
      acceptTopic(response.topic, operationGeneration, sessionId)
    } catch (error) {
      fail(error, operationGeneration)
    }
  }

  const refreshTopicsOnce = async (showLoading: boolean): Promise<void> => {
    const snapshot = store.getSnapshot()
    if (snapshot.sourceSessionId === null) return
    const generation = sourceGeneration
    const sourceSessionId = snapshot.sourceSessionId
    const includeArchived = snapshot.includeArchived
    if (showLoading && snapshot.topics.length === 0) update((draft) => {
      draft.topicsStatus = 'loading'
      draft.topicsError = null
    })
    let response: CiteCiterResponse
    try {
      response = await call({
        action: 'list',
        sourceSessionId,
        includeArchived,
      })
    } catch (error) {
      const current = store.getSnapshot()
      if (
        generation === sourceGeneration
        && current.sourceSessionId === sourceSessionId
        && current.includeArchived === includeArchived
        && !disposed
      ) update((draft) => {
        draft.topicsStatus = 'error'
        draft.topicsError = error instanceof Error ? error.message : String(error)
      })
      return
    }
    const current = store.getSnapshot()
    if (
      response.kind !== 'topics'
      || generation !== sourceGeneration
      || current.sourceSessionId !== sourceSessionId
      || current.includeArchived !== includeArchived
      || disposed
    ) return
    update((draft) => {
      draft.topics = response.topics
      draft.topicsStatus = 'ready'
      draft.topicsError = null
    })
    const accepted = store.getSnapshot()
    if (!settingsReady || !shouldReopenLastTopic(
      accepted.active !== null,
      accepted.phase === 'idle',
      accepted.settings.reopenLastTopic,
      includeArchived,
      reopenAttemptedGeneration === generation,
      reopenSuppressedGeneration === generation,
    )) return
    reopenAttemptedGeneration = generation
    const remembered = readLastTopic(sourceSessionId)
    const target = response.topics.find((topic) => topic.sessionId === remembered) ?? response.topics[0]
    if (target !== undefined) {
      onAutoOpen()
      await openTopic(target.sessionId, ++activeGeneration)
    }
  }

  const refreshTopics = (showLoading = false): Promise<void> => {
    topicsRefreshAgain = true
    topicsShowLoading ||= showLoading
    if (topicsRefresh !== null) return topicsRefresh
    const refresh = (async () => {
      while (topicsRefreshAgain && !disposed) {
        topicsRefreshAgain = false
        const loading = topicsShowLoading
        topicsShowLoading = false
        await refreshTopicsOnce(loading)
      }
    })().finally(() => {
      if (topicsRefresh === refresh) topicsRefresh = null
    })
    topicsRefresh = refresh
    return refresh
  }

  const refreshActive = async (operationGeneration = activeGeneration): Promise<void> => {
    const active = store.getSnapshot().active
    if (active === null) return
    const response = await call({ action: 'get', topicSessionId: active.topic.sessionId })
    if (response.kind === 'topic') acceptTopic(response.topic, operationGeneration, active.topic.sessionId)
  }

  const poll = async () => {
    if (!visible || disposed || polling) return
    polling = true
    const operationGeneration = activeGeneration
    try {
      await refreshActive(operationGeneration)
      if (pollCount++ % 6 === 0) await refreshTopics()
    } catch (error) {
      fail(error, operationGeneration)
    } finally {
      polling = false
    }
  }

  const loadModels = async () => {
    if (store.getSnapshot().providers.length > 0) return
    const generation = sourceGeneration
    try {
      const response = await call({ action: 'models' })
      if (response.kind === 'models' && generation === sourceGeneration) update((draft) => {
        draft.providers = response.providers
      })
    } catch (error) {
      if (generation === sourceGeneration) fail(error)
    }
  }

  const settingsSnapshot = settingsScope.getSnapshot()
  settingsReady = settingsSnapshot.status !== 'loading'
  const initialSettings = settingsSnapshot.value ?? DEFAULT_CITECITER_SETTINGS
  update((draft) => {
    draft.settings = initialSettings
  })
  const settingsWithPending = (value: CiteCiterSettings): CiteCiterSettings => {
    const merged = { ...value }
    for (const [key, pending] of pendingSettings) {
      Object.assign(merged, { [key]: pending.value })
    }
    return merged
  }
  const unsubscribeSettings = settingsScope.subscribe(() => {
    const scopeSnapshot = settingsScope.getSnapshot()
    const becameReady = !settingsReady && scopeSnapshot.status !== 'loading'
    settingsReady = scopeSnapshot.status !== 'loading'
    const value = scopeSnapshot.value
    if (value !== undefined) update((draft) => {
      draft.settings = settingsWithPending(value)
    })
    if (becameReady) void refreshTopics()
  })

  const setSource = (sessionId: SessionId | null) => {
    if (disposed || store.getSnapshot().sourceSessionId === sessionId) return
    sourceGeneration++
    activeGeneration++
    routeOperation++
    effortOperation++
    pendingRoute = null
    pendingEffort = null
    reopenAttemptedGeneration = -1
    reopenSuppressedGeneration = -1
    update((draft) => {
      draft.sourceSessionId = sessionId
      draft.phase = 'idle'
      draft.draftQuote = null
      draft.sourceAnchorKey = null
      draft.active = null
      draft.topics = []
      draft.topicsStatus = 'idle'
      draft.topicsError = null
      draft.modelRouteSaving = false
      draft.reasoningEffortSaving = false
      draft.renaming = false
      draft.archiving = false
      draft.error = null
    })
    if (sessionId !== null) void refreshTopics(true)
  }

  const setVisible = (next: boolean) => {
    if (disposed || visible === next) return
    visible = next
    if (!visible) {
      reopenSuppressedGeneration = sourceGeneration
      if (pollTimer !== null) clearInterval(pollTimer)
      pollTimer = null
      return
    }
    void refreshTopics(true)
    void loadModels()
    pollTimer = setInterval(() => { void poll() }, 700)
  }

  const create = async (selection: CiteSelection, rawQuestion: string, mode?: CreateMode): Promise<void> => {
    if (store.getSnapshot().phase === 'creating') return
    const question = normalizeQuestion(rawQuestion)
    const operationGeneration = ++activeGeneration
    update((draft) => {
      draft.sourceSessionId = selection.sourceSessionId
      draft.phase = 'creating'
      draft.draftQuote = selection.displayText
      draft.sourceAnchorKey = selection.anchorKey
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
      const response = await call({
        action: 'create',
        requestId: crypto.randomUUID(),
        selectionClaim: {
          sourceSessionId: selection.sourceSessionId,
          anchorSeq: node.anchorSeq,
          displayText: selection.displayText,
          ...(selection.sourceHintText === undefined ? {} : { sourceHintText: selection.sourceHintText }),
          prefixText: selection.prefixText,
          suffixText: selection.suffixText,
        },
        question,
        mode: mode ?? store.getSnapshot().settings.defaultMode,
      })
      if (response.kind !== 'topic') throw new Error('CiteCiter 返回了错误的创建响应')
      writeCitationAnchor(selection.sourceSessionId, response.topic.topic.citation.anchorSeq, selection.anchorKey)
      acceptTopic(response.topic, operationGeneration)
      await refreshTopics()
    } catch (error) {
      fail(error, operationGeneration)
    }
  }

  const ask = async (rawQuestion: string): Promise<boolean> => {
    const active = store.getSnapshot().active
    if (active === null) {
      fail('请先从选区创建 Topic，或打开一个旧 Topic')
      return false
    }
    const question = normalizeQuestion(rawQuestion)
    const operationGeneration = ++activeGeneration
    update((draft) => {
      draft.phase = 'running'
      draft.error = null
    })
    try {
      const response = await call({ action: 'ask', topicSessionId: active.topic.sessionId, question })
      if (response.kind === 'topic') acceptTopic(response.topic, operationGeneration, active.topic.sessionId)
      return response.kind === 'topic' && operationGeneration === activeGeneration
    } catch (error) {
      fail(error, operationGeneration)
      return false
    }
  }

  const stop = async (): Promise<void> => {
    const active = store.getSnapshot().active
    if (active === null) return
    const operationGeneration = ++activeGeneration
    update((draft) => {
      draft.phase = 'stopping'
      draft.error = null
    })
    try {
      const response = await call({ action: 'stop', topicSessionId: active.topic.sessionId })
      if (response.kind === 'topic') acceptTopic(response.topic, operationGeneration, active.topic.sessionId)
    } catch (error) {
      fail(error, operationGeneration)
    }
  }

  const answerQuestion = async (key: string, answer: QuestionAnswer): Promise<void> => {
    const active = store.getSnapshot().active
    if (active === null) return
    const operationGeneration = ++activeGeneration
    try {
      const response = await call({
        action: 'answer-question',
        topicSessionId: active.topic.sessionId,
        key,
        answer,
      })
      if (response.kind === 'topic') acceptTopic(response.topic, operationGeneration, active.topic.sessionId)
    } catch (error) {
      fail(error, operationGeneration)
    }
  }

  const cancelQuestion = async (key: string): Promise<void> => {
    const active = store.getSnapshot().active
    if (active === null) return
    const operationGeneration = ++activeGeneration
    try {
      const response = await call({
        action: 'cancel-question',
        topicSessionId: active.topic.sessionId,
        key,
      })
      if (response.kind === 'topic') acceptTopic(response.topic, operationGeneration, active.topic.sessionId)
    } catch (error) {
      fail(error, operationGeneration)
    }
  }

  const rename = async (rawTitle: string): Promise<boolean> => {
    const active = store.getSnapshot().active
    const title = rawTitle.trim()
    if (active === null || title === '') return false
    const operationGeneration = ++activeGeneration
    update((draft) => {
      draft.renaming = true
      draft.error = null
    })
    try {
      const response = await call({ action: 'rename', topicSessionId: active.topic.sessionId, title })
      if (response.kind === 'topic') acceptTopic(response.topic, operationGeneration, active.topic.sessionId)
      await refreshTopics()
      if (operationGeneration === activeGeneration) update((draft) => {
        draft.renaming = false
      })
      return response.kind === 'topic' && operationGeneration === activeGeneration
    } catch (error) {
      if (operationGeneration === activeGeneration) update((draft) => {
        draft.renaming = false
      })
      fail(error, operationGeneration)
      return false
    }
  }

  const archive = async (archived: boolean): Promise<boolean> => {
    const active = store.getSnapshot().active
    if (active === null) return false
    const operationGeneration = ++activeGeneration
    update((draft) => {
      draft.archiving = true
      draft.error = null
    })
    try {
      const response = await call({ action: 'archive', topicSessionId: active.topic.sessionId, archived })
      if (response.kind === 'topic') acceptTopic(response.topic, operationGeneration, active.topic.sessionId)
      if (archived !== store.getSnapshot().includeArchived) update((draft) => {
        draft.active = null
        draft.phase = 'idle'
      })
      await refreshTopics()
      if (operationGeneration === activeGeneration) update((draft) => {
        draft.archiving = false
      })
      return response.kind === 'topic' && operationGeneration === activeGeneration
    } catch (error) {
      if (operationGeneration === activeGeneration) update((draft) => {
        draft.archiving = false
      })
      fail(error, operationGeneration)
      return false
    }
  }

  const updateModelConfig = (
    sessionId: string,
    mutate: (modelConfig: TopicSummary['modelConfig']) => void,
  ) => {
    update((draft) => {
      if (draft.active?.topic.sessionId === sessionId) mutate(draft.active.topic.modelConfig)
      const summary = draft.topics.find((topic) => topic.sessionId === sessionId)
      if (summary !== undefined) mutate(summary.modelConfig)
    })
  }

  const setModelRoute = async (provider: string, model: string): Promise<void> => {
    const active = store.getSnapshot().active
    if (active === null) return
    const operation = ++routeOperation
    const operationGeneration = activeGeneration
    const sessionId = active.topic.sessionId
    effortOperation++
    pendingEffort = null
    pendingRoute = { operation, sessionId, provider, model }
    update((draft) => {
      draft.modelRouteSaving = true
      draft.reasoningEffortSaving = false
    })
    updateModelConfig(sessionId, (modelConfig) => {
      modelConfig.provider = provider
      modelConfig.model = model
      delete modelConfig.reasoningEffort
    })
    try {
      const response = await call({
        action: 'set-model-route',
        topicSessionId: sessionId,
        provider,
        model,
      })
      if (pendingRoute?.operation !== operation || pendingRoute.sessionId !== sessionId) return
      pendingRoute = null
      update((draft) => {
        draft.modelRouteSaving = false
      })
      if (response.kind === 'topic') acceptTopic(response.topic, operationGeneration, sessionId)
    } catch (error) {
      if (pendingRoute?.operation !== operation || pendingRoute.sessionId !== sessionId) return
      pendingRoute = null
      update((draft) => {
        draft.modelRouteSaving = false
      })
      fail(error, operationGeneration)
      await refreshActive(activeGeneration)
    }
  }

  const setReasoningEffort = async (reasoningEffort: string | null): Promise<void> => {
    const active = store.getSnapshot().active
    if (active === null) return
    const operation = ++effortOperation
    const operationGeneration = activeGeneration
    const sessionId = active.topic.sessionId
    pendingEffort = { operation, sessionId, reasoningEffort }
    update((draft) => {
      draft.reasoningEffortSaving = true
    })
    updateModelConfig(sessionId, (modelConfig) => {
      if (reasoningEffort === null) delete modelConfig.reasoningEffort
      else modelConfig.reasoningEffort = reasoningEffort
    })
    try {
      const response = await call({
        action: 'set-reasoning-effort',
        topicSessionId: sessionId,
        reasoningEffort,
      })
      if (pendingEffort?.operation !== operation || pendingEffort.sessionId !== sessionId) return
      pendingEffort = null
      update((draft) => {
        draft.reasoningEffortSaving = false
      })
      if (response.kind === 'topic') acceptTopic(response.topic, operationGeneration, sessionId)
    } catch (error) {
      if (pendingEffort?.operation !== operation || pendingEffort.sessionId !== sessionId) return
      pendingEffort = null
      update((draft) => {
        draft.reasoningEffortSaving = false
      })
      fail(error, operationGeneration)
      await refreshActive(activeGeneration)
    }
  }

  return {
    getSnapshot: store.getSnapshot,
    subscribe: store.subscribe,
    setSource,
    setVisible,
    create,
    openTopic: (sessionId) => openTopic(sessionId, ++activeGeneration),
    ask,
    answerQuestion,
    cancelQuestion,
    stop,
    rename,
    archive,
    setIncludeArchived: (include) => {
      activeGeneration++
      update((draft) => {
        draft.includeArchived = include
        draft.active = null
        draft.topics = []
        draft.topicsStatus = 'loading'
        draft.topicsError = null
        draft.phase = 'idle'
      })
      void refreshTopics(true)
    },
    setModelRoute,
    setReasoningEffort,
    setSetting: async (key, value) => {
      const operation = ++settingOperation
      pendingSettings.set(key, { operation, value })
      update((draft) => {
        draft.settings = { ...draft.settings, [key]: value }
        draft.settingsSaveStatus = 'saving'
        draft.settingsSaveMessage = '正在保存…'
      })
      try {
        await settingsScope.set(key, value)
        if (pendingSettings.get(key)?.operation !== operation || disposed) return
        pendingSettings.delete(key)
        const authoritative = settingsScope.getSnapshot().value ?? DEFAULT_CITECITER_SETTINGS
        update((draft) => {
          draft.settings = settingsWithPending(authoritative)
          draft.settingsSaveStatus = pendingSettings.size === 0 ? 'saved' : 'saving'
          draft.settingsSaveMessage = pendingSettings.size === 0 ? '已保存' : '正在保存…'
        })
      } catch (error) {
        if (pendingSettings.get(key)?.operation !== operation || disposed) return
        pendingSettings.delete(key)
        const restored = settingsScope.getSnapshot().value ?? DEFAULT_CITECITER_SETTINGS
        update((draft) => {
          draft.settings = settingsWithPending(restored)
          draft.settingsSaveStatus = 'error'
          draft.settingsSaveMessage = `保存失败，已恢复：${error instanceof Error ? error.message : String(error)}`
        })
      }
    },
    dispose: async () => {
      if (disposed) return
      disposed = true
      if (pollTimer !== null) clearInterval(pollTimer)
      unsubscribeSettings()
    },
  }
}

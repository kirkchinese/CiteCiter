/** Topic use cases on native DSH Sessions: creation, questions, drafts, deletion and model routing. */
import { randomUUID } from 'node:crypto'
import { resolve } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import type { Agent, AgentHandle } from '@deepseek-ai/dsh-agent'
import type { SessionRequestId } from '@deepseek-ai/dsh-api-session-controller'
import type { LlmCallConfig, LlmModelInfo, ToolCallId } from '@deepseek-ai/dsh-llm'
import { setSandboxMode } from '@deepseek-ai/dsh-sandbox-policy'
import { SESSION_FORMAT_VERSION, SessionId, foldRequestHeader, type SessionHeader } from '@deepseek-ai/dsh-session'
import {
  UserQuestionError,
  type AskUserQuestionAnswer,
  type AskUserQuestionItem,
  type AskUserQuestionRequest,
} from '@deepseek-ai/dsh-user-questions'
import { createBlackboardApplyTool } from './blackboard-tool.ts'
import { BoardCaptureBroker } from './board-capture.ts'
import { recoverBlockingQuestion } from './blocking-question-recovery.ts'
import { resolveReadableDocument } from './document-access.ts'
import { createDocumentReadTool, createDocumentSearchTool, type AuthorizedDocumentReader } from './document-tools.ts'
import { DocumentStore } from './documents.ts'
import { DraftStore } from './draft-store.ts'
import { HostSessionAdapter } from './host-session-adapter.ts'
import { createLearningCardsTool } from './learning-cards-tool.ts'
import { migrateLegacyTopics } from './legacy-migration.ts'
import { requireSelectedModel, selectInitialModel } from './model-admission.ts'
import { readNativeAttachment } from './native-attachment-read.ts'
import { readNativeState } from './native-session-read.ts'
import {
  fingerprintCitationRecord,
  resolveDocumentEvidence,
  resolveObserverCitation,
  resolveToolEvidence,
  type ObserverSourceSnapshot,
} from './observer.ts'
import { removeOwnedSessionTree } from './owned-session-cleanup.ts'
import type { QuestionDraftContent } from './question-draft-contract.ts'
import { questionDraftLogStatus, questionDraftReceiptKey } from './question-draft-lifecycle.ts'
import { QuestionDraftStore } from './question-draft-store.ts'
import { createSourceReadTool, SOURCE_READ_PROMPT, SOURCE_READ_SECTION_NAME } from './source-read-tool.ts'
import { readSourceSession, hasSentSource } from './source-session.ts'
import { SourceStorage } from './source-storage.ts'
import { toolCallRecord } from './tool-events.ts'
import { latestTopicSubmission, topicSubmissionTime } from './topic-archive.ts'
import { TopicIndex, type TopicDeletionMarker, unlinkIfPresent, rmdirIfEmpty } from './topic-index.ts'
import { foldTopicTitle, latestObservedSeq, projectBoardFromLog, titleSourceKind, topicMessages, type TopicLog } from './topic-log.ts'
import { composeHostedTopicPrompt } from './topic-prompts.ts'
import { bindTopicQuestionBridge } from './topic-question-bridge.ts'
import { continuedQuestions, openQuestion, questionKey, TopicQuestionReplies, validateQuestionAnswer } from './topic-questions.ts'
import { TopicStreamProjection } from './topic-stream.ts'
import {
  CITATION_SCHEMA_VERSION,
  DEFAULT_CITECITER_SETTINGS,
  TOPIC_METADATA_SCHEMA_VERSION,
  TUTOR_SECTION_NAME,
  citeCiterRequestSchema,
  topicMetadataSchema,
  type CiteCiterRequest,
  type CiteCiterResponse,
  type CiteCiterSettings,
  type CitationEvidence,
  type CitationRecord,
  type DocumentSummary,
  type ProviderOption,
  type PendingQuestion,
  type TopicMetadata,
  type TopicSnapshot,
  type TopicSummary,
} from './topic.ts'

type CreateRequest = Extract<CiteCiterRequest, { action: 'create' }>
type AskRequest = Extract<CiteCiterRequest, { action: 'ask' }>
type DeleteResponse = Extract<CiteCiterResponse, { kind: 'deleted' }>
type TopicChangeListener = (
  name: 'created' | 'updated' | 'deleted',
  payload: { topic: TopicSummary } | Omit<DeleteResponse, 'kind'>,
) => void

const CITECITER_SHUTTING_DOWN = 'CiteCiter is shutting down'

function citeCiterShuttingDownError(): Error {
  return new Error(CITECITER_SHUTTING_DOWN)
}

interface RuntimePendingQuestion {
  readonly key: string
  readonly callId: string
  readonly sessionId: string
  readonly questions: readonly AskUserQuestionItem[]
  readonly wait: AskUserQuestionRequest['wait']
  readonly resolve: (answer: AskUserQuestionAnswer) => void
  readonly reject: (error: UserQuestionError) => void
  readonly signal: AbortSignal | undefined
  readonly onAbort: () => void
}

function modelConfigFromSource(source: ObserverSourceSnapshot, anchorSeq: number): LlmCallConfig {
  const header = foldRequestHeader(source.events.filter((event) => event.seq <= anchorSeq))
  if (header !== undefined) return header.config
  const anchor = source.events.find((event) => event.seq === anchorSeq)
  if (anchor?.type === 'assistant/message') {
    return {
      provider: anchor.data.message.source.provider,
      model: anchor.data.message.source.model,
    }
  }
  for (let index = source.events.length - 1; index >= 0; index -= 1) {
    const event = source.events[index]
    if (event !== undefined && event.seq <= anchorSeq && event.type === 'assistant/message') {
      return {
        provider: event.data.message.source.provider,
        model: event.data.message.source.model,
      }
    }
  }
  throw new Error('Citation source has no model route')
}

/** Resolve the origin session's latest committed model route for free and document Topics. */
function modelConfigFromLatest(source: ObserverSourceSnapshot): LlmCallConfig {
  const header = foldRequestHeader(source.events)
  if (header !== undefined) return header.config
  return modelConfigFromSource(source, Number.MAX_SAFE_INTEGER)
}

function createSourceSessionId(request: CreateRequest): string {
  if ('sourceSessionId' in request) return request.sourceSessionId
  if ('selectionClaim' in request) return request.selectionClaim.sourceSessionId
  if ('toolClaim' in request) return request.toolClaim.sourceSessionId
  return request.documentClaim.sourceSessionId
}

/** Process-local Topic coordinator over native DSH Sessions stored in each source's Citer directory. */
export class TopicRuntime {
  private readonly native: HostSessionAdapter
  private readonly index = new TopicIndex()
  private readonly sourceStorage: SourceStorage
  private readonly documents = new DocumentStore()
  private readonly lifecycleAbort = new AbortController()
  private readonly handles = new Map<string, AgentHandle>()
  private readonly opening = new Map<string, Promise<AgentHandle>>()
  private readonly requests = new Set<Promise<unknown>>()
  private readonly pendingQuestions = new Map<string, RuntimePendingQuestion>()
  private readonly questionReplies = new TopicQuestionReplies()
  private readonly creations = new Map<string, { readonly intent: string, readonly result: Promise<TopicSnapshot> }>()
  private readonly asks = new Map<string, { readonly question: string, readonly result: Promise<TopicSnapshot> }>()
  private readonly topicAdmissions = new Map<string, Promise<void>>()
  private readonly deleting = new Set<string>()
  private readonly titleHydrated = new Set<string>()
  private readonly sourceAvailability = new Map<string, boolean>()
  private readonly sourceAvailabilityChecks = new Map<string, Promise<void>>()
  private readonly ready: Promise<void>
  private readonly topicListeners = new Set<TopicChangeListener>()
  private readonly streams = new Map<string, TopicStreamProjection>()
  private readonly boardCapture = new BoardCaptureBroker()
  private disposal: Promise<void> | undefined
  private releasing: Promise<void> | undefined
  private closed = false

  /** @param host - owning DSH context. @param settings - current user preferences. */
  constructor(
    private readonly host: Context,
    private readonly settings: () => CiteCiterSettings = () => DEFAULT_CITECITER_SETTINGS,
  ) {
    this.sourceStorage = new SourceStorage(host)
    this.native = new HostSessionAdapter(host, settings, (scope, agent, metadata) => this.setupAgent(scope, agent, metadata), metadata => resolve(this.index.ownedDirectory(metadata.sourceSessionId, metadata.topicId), 'sessions'))
    this.ready = this.start()
    void this.ready.catch(() => undefined)
  }

  /** Wait until source roots are bound and interrupted deletions and migrations have finished. */
  initialize(): Promise<void> {
    return this.ready
  }

  /** Execute one validated browser command against Topics. */
  async request(rawRequest: CiteCiterRequest, callerSignal: AbortSignal): Promise<CiteCiterResponse> {
    const request = citeCiterRequestSchema.parse(rawRequest) as CiteCiterRequest
    await this.ready
    const signal = AbortSignal.any([this.lifecycleAbort.signal, callerSignal])
    this.assertOpen(signal)
    const operation = this.executeRequest(request, signal).then((response) => {
      if (response.kind === 'topic') {
        const name = request.action === 'create' ? 'created' as const : 'updated' as const
        const payload = { topic: response.topic.topic }
        for (const listener of [...this.topicListeners]) listener(name, payload)
      } else if (response.kind === 'deleted') {
        const { kind: _kind, ...payload } = response
        for (const listener of [...this.topicListeners]) listener('deleted', payload)
      }
      return response
    })
    this.requests.add(operation)
    void operation.then(
      () => this.requests.delete(operation),
      () => this.requests.delete(operation),
    )
    return operation
  }

  /**
   * Observe committed Topic state changes.
   * @param listener - receives the change kind and durable summary.
   * @returns disposer removing the exact listener.
   */
  onTopicChange(listener: TopicChangeListener): () => void {
    this.topicListeners.add(listener)
    return () => this.topicListeners.delete(listener)
  }

  private async executeRequest(request: CiteCiterRequest, signal: AbortSignal): Promise<CiteCiterResponse> {
    this.assertOpen(signal)
    switch (request.action) {
      case 'question-draft-get':
      case 'question-draft-save':
        return this.withOwnedTopic(request.topicSessionId, async (metadata) => {
          const drafts = new QuestionDraftStore(this.index.ownedDirectory(metadata.sourceSessionId, metadata.topicId))
          let current = await drafts.read(request.key)
          if (current.closed) return { kind: 'question-draft', state: current.state, closed: true, conflict: request.action === 'question-draft-save' }
          const handle = await this.ensureHandle(metadata, signal)
          const live = this.pendingQuestions.get(metadata.sessionId)
          // Recovery must include a displayed card that has not been edited yet.
          // A failed eager registration is retried here and surfaces in its form.
          if (live?.key === request.key && live.wait === undefined) current = await drafts.registerBlocking(request.key)
          const status = questionDraftLogStatus(metadata.sessionId, request.key, handle.agent.session.snapshotEvents(), handle.agent.session.inheritedEventCount, current.blocking)
          if (status === 'closed') {
            const closed = await drafts.close(request.key)
            return { kind: 'question-draft', state: closed.state, closed: true, conflict: request.action === 'question-draft-save' }
          }
          const projection = handle.agent.ctx.get('sessionProjections')?.stateOf(handle.agent.session, 'userQuestions')
          const questions = live?.key === request.key ? live.questions
            : projection?.questions.active.find(question => questionKey(metadata.sessionId, question.callId) === request.key)?.questions
              ?? recoverBlockingQuestion(metadata.sessionId, current, handle.agent.session.snapshotEvents(), handle.agent.session.inheritedEventCount)?.questions
          if (request.action === 'question-draft-save') {
            if (questions === undefined) throw new Error('尚不能确认此问题仍可回答，已保留草稿，请重新打开后重试')
            this.validateQuestionDraft(request.state.content, questions)
            return { kind: 'question-draft', ...await drafts.save(request.key, request.state, live?.key === request.key ? live.wait === undefined : current.blocking) }
          }
          if (questions === undefined && status === 'unknown' && current.state.revision === 0) throw new Error('这个 Topic 中没有可确认的问题草稿身份')
          return { kind: 'question-draft', state: current.state, closed: false, conflict: false }
        }, signal)
      case 'draft-get':
      case 'draft-save':
      case 'draft-file-put':
      case 'draft-file-get':
        return this.withOwnedTopic(request.topicSessionId, async (metadata) => {
          const drafts = new DraftStore(this.index.ownedDirectory(metadata.sourceSessionId, metadata.topicId))
          if (request.action === 'draft-file-put') {
            await drafts.put(request.file, request.offset, request.data)
            return { kind: 'draft-file-saved' }
          }
          if (request.action === 'draft-file-get') return { kind: 'draft-file', data: await drafts.chunk(request.fileId, request.offset) }
          if (request.action === 'draft-save') {
            if (request.state.pending !== null) requireSelectedModel(metadata)
            return { kind: 'draft', ...await drafts.save(request.state.revision, request.state) }
          }
          let state = await drafts.read()
          if (state.pending !== null) {
            const handle = await this.ensureHandle(metadata, signal)
            if (readNativeState(handle.agent, [state.pending.requestId]).receipts.length > 0) state = await drafts.acknowledge(state)
          }
          return { kind: 'draft', state, conflict: false }
        }, signal)
      case 'create':
        return { kind: 'topic', topic: await this.createIdempotent(request, signal) }
      case 'list':
        return { kind: 'topics', topics: await this.list(request.sourceSessionId, request.includeArchived ?? false, signal) }
      case 'board-capture-pending':
        return { kind: 'board-captures', jobs: this.boardCapture.jobs() }
      case 'board-capture': {
        const metadata = await this.index.loadBySessionId(request.topicSessionId)
        this.boardCapture.reply(metadata.sessionId, request.id, request.png, request.error)
        return { kind: 'board-capture-accepted' }
      }
      case 'get':
        return this.withOwnedTopic(request.topicSessionId, async (metadata) => {
          await this.ensureHandle(metadata, signal)
          return { kind: 'topic', topic: await this.snapshot(metadata, signal, true) }
        }, signal)
      case 'native-state':
      case 'native-attachment':
        return this.withOwnedTopic(request.topicSessionId, async (metadata) => {
          const handle = await this.ensureHandle(metadata, signal)
          return request.action === 'native-state'
            ? { kind: 'native-state', state: { ...readNativeState(handle.agent, request.requestIds), modelSelectionRequired: metadata.modelSelectionRequired === true } }
            : { kind: 'native-attachment', ...await readNativeAttachment(handle.agent.ctx, handle.agent.session, request.attachmentId, signal) }
        }, signal)
      case 'ask':
        return { kind: 'topic', topic: await this.askIdempotent(request, signal) }
      case 'stop':
        return { kind: 'topic', topic: await this.queueTopicAdmission(
          request.topicSessionId,
          () => this.stop(request.topicSessionId, signal),
          signal,
        ) }
      case 'answer-question':
        return this.queueTopicAdmission(
          request.topicSessionId,
          async () => {
            // Check and accept within one admission slot: another window cannot
            // save a newer revision between this comparison and Host submission.
            const metadata = await this.index.loadBySessionId(request.topicSessionId)
            const drafts = new QuestionDraftStore(this.index.ownedDirectory(metadata.sourceSessionId, metadata.topicId))
            const conflict = await drafts.checkSubmission(request.key, request.draftRevision)
            if (conflict !== undefined && request.draftRevision === undefined) throw new Error(conflict.closed
              ? '此提问已结束，未重复提交回答'
              : '此问题已有持久化回答草稿，请刷新界面后再提交；原草稿已保留')
            if (conflict !== undefined) return { kind: 'question-draft', ...conflict }
            return { kind: 'topic', topic: await this.answerQuestion(request, signal) }
          },
          signal,
        )
      case 'cancel-question':
        return { kind: 'topic', topic: await this.queueTopicAdmission(
          request.topicSessionId,
          () => this.cancelQuestion(request.topicSessionId, request.key, signal),
          signal,
        ) }
      case 'timeout-question':
        return { kind: 'topic', topic: await this.queueTopicAdmission(
          request.topicSessionId,
          () => this.timeoutQuestion(request.topicSessionId, request.key, signal),
          signal,
        ) }
      case 'rename':
        return { kind: 'topic', topic: await this.queueTopicAdmission(
          request.topicSessionId,
          () => this.rename(request.topicSessionId, request.title, signal),
          signal,
        ) }
      case 'archive':
        return { kind: 'topic', topic: await this.queueTopicAdmission(
          request.topicSessionId,
          () => this.archive(request.topicSessionId, request.archived, signal),
          signal,
        ) }
      case 'delete':
        return this.delete(request.topicSessionId, request.confirmSessionId, signal)
      case 'models':
        return { kind: 'models', providers: await this.models(signal) }
      case 'set-permission':
        return this.queueTopicAdmission(request.topicSessionId, async () => {
          const metadata = await this.index.loadBySessionId(request.topicSessionId)
          const handle = await this.ensureHandle(metadata, signal)
          setSandboxMode(handle.agent.session, request.mode)
          await handle.agent.ctx.sessions.flush(handle.agent.session)
          return { kind: 'topic', topic: await this.snapshot(metadata, signal, true) }
        }, signal)
      case 'set-model-route':
        return { kind: 'topic', topic: await this.queueTopicAdmission(request.topicSessionId, () => this.setModelRoute(request, signal), signal) }
      case 'set-reasoning-effort':
        return { kind: 'topic', topic: await this.queueTopicAdmission(request.topicSessionId, () => this.setReasoningEffort(request, signal), signal) }
      case 'document-import':
        return { kind: 'document', document: await this.importDocument(request, signal) }
      case 'documents':
        return { kind: 'documents', documents: await this.documents.list() }
      case 'document-get':
        return { kind: 'document-content', document: await this.documents.get(request.documentId, request.page) }
      default:
        return request satisfies never
    }
  }

  /** Stop every owned Agent before releasing bridged services. */
  dispose(): Promise<void> {
    this.boardCapture.dispose()
    this.disposal ??= this.disposeOwned()
    return this.disposal
  }

  private async disposeOwned(): Promise<void> {
    this.beginClosing()
    await this.ready.catch(() => undefined)
    await this.releaseRuntime()
  }

  private beginClosing(): void {
    if (this.closed) return
    this.closed = true
    this.lifecycleAbort.abort(citeCiterShuttingDownError())
  }

  private assertOpen(signal?: AbortSignal): void {
    if (this.closed) throw citeCiterShuttingDownError()
    signal?.throwIfAborted()
  }

  private async start(): Promise<void> {
    try {
      for (const [id, root] of await this.sourceStorage.discover()) this.index.bindSource(id, root)
      await this.recoverDeletions()
      await migrateLegacyTopics(this.host, this.index, this.sourceStorage, this.native)
      for (const metadata of await this.index.all()) this.native.remember(metadata)
    } catch (error) {
      this.beginClosing()
      try {
        await this.releaseRuntime()
      } catch (cleanupError) {
        throw new AggregateError([error, cleanupError], 'CiteCiter Topic runtime failed to start and clean up')
      }
      throw error
    }
  }

  private releaseRuntime(): Promise<void> {
    this.releasing ??= this.releaseOwnedRuntime()
    return this.releasing
  }

  private async releaseOwnedRuntime(): Promise<void> {
    const failures: unknown[] = []
    for (const pending of this.pendingQuestions.values()) {
      pending.signal?.removeEventListener('abort', pending.onAbort)
      pending.reject(new UserQuestionError(CITECITER_SHUTTING_DOWN, 'ASK_ABORTED'))
    }
    this.pendingQuestions.clear()
    const handleDisposals: Promise<void>[] = []
    for (const handle of [...this.handles.values()]) {
      try {
        handleDisposals.push(handle.dispose().catch((error: unknown) => {
          failures.push(error)
        }))
      } catch (error) {
        failures.push(error)
      }
    }
    this.handles.clear()
    await this.settleOwnedOperations()
    await Promise.all(handleDisposals)
    this.requests.clear()
    this.topicListeners.clear()
    this.streams.clear()
    this.creations.clear()
    this.asks.clear()
    this.topicAdmissions.clear()
    this.deleting.clear()
    this.sourceAvailabilityChecks.clear()
    this.opening.clear()
    if (failures.length > 0) throw new AggregateError(failures, 'CiteCiter Topic runtime cleanup failed')
  }

  private async settleOwnedOperations(): Promise<void> {
    while (true) {
      const operations = new Set<Promise<unknown>>([
        ...this.requests,
        ...[...this.creations.values()].map(({ result }) => result),
        ...[...this.asks.values()].map(({ result }) => result),
        ...this.topicAdmissions.values(),
        ...this.sourceAvailabilityChecks.values(),
        ...this.opening.values(),
      ])
      if (operations.size === 0) return
      await Promise.allSettled(operations)
    }
  }

  private async create(request: CreateRequest, signal?: AbortSignal): Promise<TopicSnapshot> {
    const sourceSessionId = createSourceSessionId(request)
    const source = await readSourceSession(this.host, sourceSessionId)
    this.assertOpen(signal)
    this.sourceAvailability.set(sourceSessionId, true)
    const documentClaim = 'documentClaim' in request ? request.documentClaim : undefined
    let evidence: CitationEvidence | undefined
    if (documentClaim !== undefined) {
      evidence = resolveDocumentEvidence(
        (await this.documents.read(documentClaim.documentId)).content,
        documentClaim,
      ).evidence
    } else if ('selectionClaim' in request) {
      const validated = resolveObserverCitation(source, request.selectionClaim)
      evidence = {
        ...validated.citation,
        entry: { kind: 'assistant-message', anchorSeq: validated.assistantMessageSeq } as const,
      }
    } else if ('toolClaim' in request) {
      evidence = resolveToolEvidence(source, request.toolClaim).evidence
    }
    if (request.modelRoute !== undefined) await this.host.llm.resolveModelInfo(request.modelRoute.provider, request.modelRoute.model, signal)
    const sourceRoot = await this.sourceStorage.root(sourceSessionId, true)
    if (sourceRoot === undefined) throw new Error('Citer 来源存储不可用')
    this.index.bindSource(sourceSessionId, sourceRoot)
    const { topicId, directory } = await this.index.reserve(sourceSessionId)
    const createdAt = Date.now()
    const sessionId = SessionId(`citeciter-${randomUUID()}`)
    const route: LlmCallConfig = request.modelRoute ?? (evidence === undefined || documentClaim !== undefined
      ? modelConfigFromLatest(source)
      : modelConfigFromSource(source, evidence.anchorSeq))
    const citation: CitationRecord | null = evidence === undefined
      ? null
      : {
          ...evidence,
          schemaVersion: CITATION_SCHEMA_VERSION,
          createdAt,
          selectionFingerprint: fingerprintCitationRecord(evidence),
        }
    // mode, forkThroughSeq and scenario keep the on-disk format readable by earlier versions.
    const metadata: TopicMetadata = {
      hosted: true,
      storage: 'source',
      schemaVersion: TOPIC_METADATA_SCHEMA_VERSION,
      topicId,
      createRequestId: request.requestId,
      sessionId,
      sourceSessionId: source.session.id,
      sourceCwd: source.session.cwd ?? '',
      mode: 'observer',
      scenario: documentClaim === undefined ? 'qa' : 'read',
      documentId: documentClaim?.documentId ?? null,
      citation,
      modelConfig: {
        provider: route.provider,
        model: route.model,
        ...(route.reasoningEffort === undefined ? {} : { reasoningEffort: String(route.reasoningEffort) }),
        ...(route.temperature === undefined ? {} : { temperature: route.temperature }),
        ...(route.maxTokens === undefined ? {} : { maxTokens: route.maxTokens }),
        ...(route.stop === undefined ? {} : { stop: [...route.stop] }),
      },
      forkThroughSeq: null,
      temporaryTitle: (evidence?.displayText ?? (request.question || '新 Topic')).slice(0, 80),
      cachedTitle: null,
      cachedTitleSource: null,
      cachedTitleEventSeq: null,
      createdAt,
      updatedAt: createdAt,
      archivedAt: null,
      sourceAvailable: true,
      observedThroughSeq: null,
    }
    return this.queueTopicAdmission(metadata.sessionId, async () => {
      let handle: AgentHandle | undefined
      try {
        handle = await this.createHandle(metadata, signal)
        await handle.agent.ctx.sessions.flush(handle.agent.session)
        this.assertOpen(signal)
        await this.index.save(metadata)
        // Creation prepares a Session only. A separate user submission admits model input.
        return this.snapshot(metadata, signal, true)
      } catch (error) {
        this.host.logger.error('CiteCiter Topic creation failed', error)
        try {
          handle ??= this.handles.get(metadata.sessionId)
          if (handle !== undefined) {
            await handle.dispose()
            this.handles.delete(metadata.sessionId)
            // The Host owns native persistence and has no public deletion API.
            // Retain an archived index so a failed admission can be retried or recovered.
            await this.index.save({ ...metadata, archivedAt: Date.now() })
          } else {
            await unlinkIfPresent(resolve(directory, 'topic.json'))
            await rmdirIfEmpty(directory)
          }
        } catch (cleanupError) {
          throw new AggregateError([error, cleanupError], 'CiteCiter Topic creation failed and could not roll back')
        }
        throw error
      }
    }, signal)
  }

  /** Let a caller stop waiting without cancelling an accepted idempotent mutation. */
  private waitForCaller<T>(operation: Promise<T>, signal?: AbortSignal): Promise<T> {
    if (signal === undefined) return operation
    return new Promise<T>((resolve, reject) => {
      const cleanup = () => signal.removeEventListener('abort', onAbort)
      const onAbort = () => {
        cleanup()
        reject(signal.reason)
      }
      signal.addEventListener('abort', onAbort, { once: true })
      if (signal.aborted) onAbort()
      void operation.then(
        (value) => {
          cleanup()
          resolve(value)
        },
        (error: unknown) => {
          cleanup()
          reject(error)
        },
      )
    })
  }

  private createIdempotent(request: CreateRequest, signal?: AbortSignal): Promise<TopicSnapshot> {
    const key = `${createSourceSessionId(request)}\0${request.requestId}`
    const pending = this.creations.get(key)
    const intent = JSON.stringify(request)
    if (pending !== undefined) {
      if (pending.intent !== intent) throw new Error('CiteCiter create requestId was reused for a different request')
      return this.waitForCaller(pending.result, signal)
    }
    const creation = Promise.resolve().then(() => {
      this.assertOpen(signal)
      return this.resumeOrCreate(request, signal)
    })
      .finally(() => this.creations.delete(key))
    this.creations.set(key, { intent, result: creation })
    return this.waitForCaller(creation, signal)
  }

  /** A retried request returns the Topic its first attempt committed. */
  private async resumeOrCreate(request: CreateRequest, signal?: AbortSignal): Promise<TopicSnapshot> {
    const committed = (await this.index.list(createSourceSessionId(request)))
      .find((topic) => topic.createRequestId === request.requestId)
    this.assertOpen(signal)
    return committed === undefined ? this.create(request, signal) : this.snapshot(committed, signal)
  }

  private async createHandle(metadata: TopicMetadata, signal?: AbortSignal): Promise<AgentHandle> {
    this.assertOpen(signal)
    const handle = await this.native.create(metadata, signal)
    this.handles.set(metadata.sessionId, handle)
    await selectInitialModel(metadata, () => this.host.sessionController.selectModel({ sessionId: SessionId(metadata.sessionId), provider: metadata.modelConfig.provider, model: metadata.modelConfig.model, ...(metadata.modelConfig.reasoningEffort === undefined ? {} : { reasoningEffort: metadata.modelConfig.reasoningEffort }) }))
    return handle
  }

  /** Contribute Citer prompts, tools and observers to one native Topic Agent. */
  private async setupAgent(agentCtx: Context, agent: Agent, metadata: TopicMetadata): Promise<void> {
    await this.questionReplies.attach(agentCtx, agent)
    this.trackQuestionDraftReceipts(agentCtx, agent, metadata)
    // The owned Session's event carrier belongs to its factory service view, not
    // the Agent child scope. Public global observation still filters the exact
    // owned object and is disposed with this contribution.
    agentCtx.on('session/event', (session, event) => {
      if (session !== agent.session) return
      const submittedAt = topicSubmissionTime(event)
      if (submittedAt === null) return
      // Never await the admission chain inside the host's synchronous log dispatch.
      void this.restoreSubmittedTopic(metadata, submittedAt).catch((error: unknown) => {
        if (!this.closed && !this.deleting.has(metadata.sessionId)) this.host.logger.warn('CiteCiter could not restore a submitted Topic', error)
      })
    }, { global: true })
    const stream = new TopicStreamProjection()
    this.streams.set(metadata.sessionId, stream)
    agentCtx.on('agent/assistant-stream', ({ frame }) => stream.accept(frame, agent.session.snapshotEvents().length))
    agentCtx.effect(() => () => {
      if (this.streams.get(metadata.sessionId) === stream) this.streams.delete(metadata.sessionId)
    }, 'citeciter: native Topic stream')
    agentCtx.systemPrompt.section({
      name: TUTOR_SECTION_NAME,
      order: 20,
      text: () => composeHostedTopicPrompt(this.settings().tutorPrompt, Boolean(this.settings().followupQuestions ?? DEFAULT_CITECITER_SETTINGS.followupQuestions), this.settings().learningRoute ?? false),
    })
    this.registerSourceTool(agentCtx, metadata, agent)
    this.registerDocumentTools(agentCtx)
    agentCtx.tools.register(createBlackboardApplyTool())
    agentCtx.tools.register(this.boardCapture.tool(agentCtx, current => projectBoardFromLog({
      header: current.session.header, events: current.session.snapshotEvents(), inheritedEventCount: current.session.inheritedEventCount,
    })))
    agentCtx.tools.register(createLearningCardsTool())
    bindTopicQuestionBridge(agentCtx, agent, (request, callId) => this.askUser(request, callId))
  }

  /** Keep storage and submitted-reference authorization outside the shared document tool contract. */
  private registerDocumentTools(agentCtx: Context): void {
    const read: AuthorizedDocumentReader = async (requested, session) => {
      const documentId = resolveReadableDocument(session, requested)
      const { content } = await this.documents.read(documentId)
      return { documentId, content }
    }
    agentCtx.tools.register(createDocumentReadTool(read))
    agentCtx.tools.register(createDocumentSearchTool(read))
  }

  /** Read the source only after the user has sent its address as an attachment. */
  private registerSourceTool(agentCtx: Context, metadata: TopicMetadata, agent: Agent): void {
    agentCtx.systemPrompt.section({ name: SOURCE_READ_SECTION_NAME, order: 21, text: SOURCE_READ_PROMPT })
    agentCtx.tools.register(createSourceReadTool({
      includeReasoning: () => this.settings().includeSourceReasoning,
      read: async (signal) => {
        if (!hasSentSource(agent.session, `dsh://session/${encodeURIComponent(metadata.sourceSessionId)}`)) {
          throw new Error('来源会话未作为附件发送。请让用户附加来源后再读取。')
        }
        let source: ObserverSourceSnapshot
        try {
          source = await readSourceSession(this.host, metadata.sourceSessionId)
        } catch (error) {
          signal.throwIfAborted()
          await this.rememberSourceAvailability(metadata, false)
          throw error
        }
        signal.throwIfAborted()
        await this.rememberSourceAvailability(metadata, true)
        return source
      },
    }))
  }

  private async ensureHandle(metadata: TopicMetadata, signal?: AbortSignal): Promise<AgentHandle> {
    this.assertOpen(signal)
    const existing = this.handles.get(metadata.sessionId)
    if (existing !== undefined) return existing
    const pending = this.opening.get(metadata.sessionId)
    if (pending !== undefined) return pending
    const operation = this.native.resume(metadata, signal).then(handle => {
      this.handles.set(metadata.sessionId, handle)
      return handle
    }).catch(error => {
      this.host.logger.error(`Citer could not resume ${metadata.sessionId}: ${error instanceof Error ? error.stack : String(error)}`)
      throw error
    }).finally(() => this.opening.delete(metadata.sessionId))
    this.opening.set(metadata.sessionId, operation)
    return operation
  }

  /** Submit a question through the Host session controller, as the composer would. */
  private async ask(sessionId: string, question: string, requestId?: string, signal?: AbortSignal): Promise<TopicSnapshot> {
    const metadata = await this.index.loadBySessionId(sessionId)
    this.assertOpen(signal)
    await this.ensureHandle(metadata, signal)
    await this.host.sessionController.prompt({ sessionId: SessionId(sessionId), requestId: (requestId ?? randomUUID()) as SessionRequestId, mode: 'queue', content: [{ type: 'text', text: question }] }, signal ?? this.lifecycleAbort.signal)
    return this.snapshot(metadata, signal, true)
  }

  private async askIdempotent(request: AskRequest, signal?: AbortSignal): Promise<TopicSnapshot> {
    if (request.requestId === undefined) return this.queueAsk(request, signal)
    const key = `${request.topicSessionId}\0${request.requestId}`
    const existing = this.asks.get(key)
    if (existing !== undefined) {
      if (existing.question !== request.question) {
        throw new Error('CiteCiter ask requestId was reused for a different question')
      }
      return this.waitForCaller(existing.result, signal)
    }
    const result = this.queueAsk(request, signal)
      .finally(() => this.asks.delete(key))
    this.asks.set(key, { question: request.question, result })
    return this.waitForCaller(result, signal)
  }

  private queueAsk(request: AskRequest, signal?: AbortSignal): Promise<TopicSnapshot> {
    return this.queueTopicAdmission(request.topicSessionId, () => this.ask(
      request.topicSessionId,
      request.question,
      request.requestId,
      signal,
    ), signal)
  }

  private queueTopicAdmission<T>(
    sessionId: string,
    operation: () => Promise<T>,
    signal?: AbortSignal,
    allowDeleting = false,
  ): Promise<T> {
    if (!allowDeleting && this.deleting.has(sessionId)) {
      return Promise.reject(new Error(`CiteCiter Topic "${sessionId}" is being deleted`))
    }
    const previous = this.topicAdmissions.get(sessionId) ?? Promise.resolve()
    const result = previous.then(() => {
      this.assertOpen(signal)
      if (!allowDeleting && this.deleting.has(sessionId)) {
        throw new Error(`CiteCiter Topic "${sessionId}" is being deleted`)
      }
      return operation()
    })
    const settled = result.then(() => undefined, () => undefined)
    this.topicAdmissions.set(sessionId, settled)
    void settled.then(() => {
      if (this.topicAdmissions.get(sessionId) === settled) this.topicAdmissions.delete(sessionId)
    })
    return result
  }

  /** Validate partial selections against the exact Host question, without normalizing unsent text. */
  private validateQuestionDraft(content: QuestionDraftContent, questions: readonly { readonly id: string; readonly options?: readonly { readonly label: string }[] | undefined }[]): void {
    if (content.page >= questions.length) throw new Error('问题草稿页码超出当前问题范围')
    const byId = new Map(questions.map(question => [question.id, question]))
    for (const [id, answer] of Object.entries(content.answers)) {
      const question = byId.get(id)
      if (question === undefined) throw new Error('问题草稿包含不属于当前提问的答案')
      const labels = new Set(question.options?.map(option => option.label) ?? [])
      if (new Set(answer.selected).size !== answer.selected.length || answer.selected.some(label => !labels.has(label))) throw new Error('问题草稿包含未知或重复选项')
    }
  }

  /** Commit cleanup through the same admission queue as saves and permanent deletion. */
  private trackQuestionDraftReceipts(agentCtx: Context, agent: Agent, metadata: TopicMetadata): void {
    const questionKeys = new Set(agent.session.snapshotEvents().slice(agent.session.inheritedEventCount).flatMap(event => {
      const call = toolCallRecord(event)
      return call?.name === 'ask_user_question' ? [questionKey(metadata.sessionId, call.callId)] : []
    }))
    // Reconcile receipts committed just before a crash; never infer completion from a missing live card.
    void this.queueTopicAdmission(metadata.sessionId, async () => {
      const latest = await this.index.loadBySessionId(metadata.sessionId)
      const drafts = new QuestionDraftStore(this.index.ownedDirectory(latest.sourceSessionId, latest.topicId))
      for (const record of await drafts.records()) {
        if (!record.closed && questionDraftLogStatus(metadata.sessionId, record.key, agent.session.snapshotEvents(), agent.session.inheritedEventCount, record.blocking) === 'closed') await drafts.close(record.key, true)
      }
    }, this.lifecycleAbort.signal).catch((error: unknown) => {
      if (!this.closed && !this.deleting.has(metadata.sessionId)) this.host.logger.warn('CiteCiter could not reconcile question drafts after reopening', error)
    })
    // See setupAgent: the owned Session store has a distinct event scope.
    agentCtx.on('session/event', (session, event) => {
      if (session !== agent.session) return
      const call = toolCallRecord(event)
      if (call?.name === 'ask_user_question') questionKeys.add(questionKey(metadata.sessionId, call.callId))
      const key = questionDraftReceiptKey(metadata.sessionId, event)
      if (event.type !== 'turn/end' && (key === undefined || !questionKeys.has(key))) return
      // The Host dispatches synchronously; awaiting our admission queue here would deadlock submission.
      void this.queueTopicAdmission(metadata.sessionId, async () => {
        const latest = await this.index.loadBySessionId(metadata.sessionId)
        const drafts = new QuestionDraftStore(this.index.ownedDirectory(latest.sourceSessionId, latest.topicId))
        const records = key === undefined ? await drafts.records() : [await drafts.read(key)]
        for (const record of records) {
          if (!record.closed && questionDraftLogStatus(metadata.sessionId, record.key, session.snapshotEvents(), session.inheritedEventCount, record.blocking) === 'closed') await drafts.close(record.key, true)
        }
      }, this.lifecycleAbort.signal).catch((error: unknown) => {
        if (!this.closed && !this.deleting.has(metadata.sessionId)) this.host.logger.warn('CiteCiter could not retire a completed question draft', error)
      })
    }, { global: true })
  }

  private askUser(request: AskUserQuestionRequest, callId: string): Promise<AskUserQuestionAnswer> {
    if (this.closed) throw new UserQuestionError(CITECITER_SHUTTING_DOWN, 'ASK_ABORTED')
    const sessionId = request.agent === undefined ? undefined : String(request.agent.session.header.id)
    if (sessionId === undefined || !this.handles.has(sessionId)) {
      throw new UserQuestionError('CiteCiter cannot identify the asking Topic', 'CALLER_NOT_LIVE')
    }
    if (this.pendingQuestions.has(sessionId)) {
      throw new UserQuestionError('this Topic already has a pending question', 'DUPLICATE_QUESTION')
    }
    return new Promise((resolveAnswer, rejectAnswer) => {
      const key = questionKey(sessionId, callId)
      const finish = () => {
        const pending = this.pendingQuestions.get(sessionId)
        if (pending?.key === key) this.pendingQuestions.delete(sessionId)
        request.signal?.removeEventListener('abort', onAbort)
      }
      const resolve = (answer: AskUserQuestionAnswer) => {
        finish()
        resolveAnswer(answer)
      }
      const reject = (error: UserQuestionError) => {
        finish()
        rejectAnswer(error)
      }
      const onAbort = () => reject(new UserQuestionError('ask_user_question was aborted before the user answered', 'ASK_ABORTED'))
      const pending: RuntimePendingQuestion = {
        key,
        callId,
        sessionId,
        questions: request.questions,
        wait: request.wait,
        resolve,
        reject,
        signal: request.signal,
        onAbort,
      }
      this.pendingQuestions.set(sessionId, pending)
      if (request.wait === undefined) {
        // A live ask can begin during another admission. Enqueue only the short
        // identity write; never hold admission while waiting for the user's answer.
        void this.queueTopicAdmission(sessionId, async () => {
          const metadata = await this.index.loadBySessionId(sessionId)
          const drafts = new QuestionDraftStore(this.index.ownedDirectory(metadata.sourceSessionId, metadata.topicId))
          const record = await drafts.registerBlocking(key)
          const session = request.agent!.session
          if (!record.closed && questionDraftLogStatus(sessionId, key, session.snapshotEvents(), session.inheritedEventCount, true) === 'closed') await drafts.close(key, true)
        }, this.lifecycleAbort.signal).catch((error: unknown) => {
          if (!this.closed && !this.deleting.has(sessionId)) this.host.logger.warn('CiteCiter could not register a blocking question draft', error)
        })
      }
      request.signal?.addEventListener('abort', onAbort, { once: true })
      if (request.signal?.aborted === true) onAbort()
    })
  }

  private async answerQuestion(
    request: CiteCiterRequest & { action: 'answer-question' },
    signal?: AbortSignal,
  ): Promise<TopicSnapshot> {
    const metadata = await this.index.loadBySessionId(request.topicSessionId)
    this.assertOpen(signal)
    const pending = this.pendingQuestions.get(request.topicSessionId)
    if (pending?.key === request.key) {
      pending.resolve(validateQuestionAnswer(pending.questions, request.answer, pending.wait !== undefined))
    } else {
      const handle = await this.ensureHandle(metadata, signal)
      const continued = [...continuedQuestions(handle.agent), ...await this.recoveredBlockingQuestions(metadata, handle.agent)].find(question => question.key === request.key)
      if (continued?.callId === undefined) throw new Error('这个提问已结束或已被替换')
      const answer = validateQuestionAnswer(continued.questions, request.answer, continued.blocking !== true)
      if (continued.blocking === true) this.questionReplies.answerRecoveredBlocking(handle.agent, continued, answer)
      else if (!this.questionReplies.answer(handle.agent, continued.callId as ToolCallId, answer)) throw new Error('这个提问已结束或已被替换')
    }
    return this.snapshot(metadata, signal, true)
  }

  private async cancelQuestion(sessionId: string, key: string, signal?: AbortSignal): Promise<TopicSnapshot> {
    const metadata = await this.index.loadBySessionId(sessionId)
    this.assertOpen(signal)
    const pending = this.pendingQuestions.get(sessionId)
    if (pending === undefined || pending.key !== key) throw new Error('这个提问已结束或已被替换')
    pending.reject(new UserQuestionError('the user cancelled ask_user_question', 'ASK_CANCELLED'))
    return this.snapshot(metadata, signal, true)
  }

  private async timeoutQuestion(sessionId: string, key: string, signal?: AbortSignal): Promise<TopicSnapshot> {
    const metadata = await this.index.loadBySessionId(sessionId)
    this.assertOpen(signal)
    const pending = this.pendingQuestions.get(sessionId)
    // A stale countdown cannot cancel the replacement question or an ordinary blocking request.
    if (pending?.key === key && pending.wait?.timed === true) {
      pending.reject(new UserQuestionError('ask_user_question timed out before the user answered', 'ASK_TIMED_OUT'))
    }
    return this.snapshot(metadata, signal, true)
  }

  private async stop(sessionId: string, signal?: AbortSignal): Promise<TopicSnapshot> {
    const metadata = await this.index.loadBySessionId(sessionId)
    this.assertOpen(signal)
    await this.host.sessionController.cancel({ sessionId: SessionId(sessionId) })
    return this.snapshot(metadata, signal, true)
  }

  private async rename(sessionId: string, title: string, signal?: AbortSignal): Promise<TopicSnapshot> {
    const metadata = await this.index.loadBySessionId(sessionId)
    this.assertOpen(signal)
    const handle = await this.ensureHandle(metadata, signal)
    this.assertOpen(signal)
    const renamed = (await this.native.context(metadata)).sessionTitle.rename(handle.agent.session, title)
    await handle.agent.ctx.sessions.flush(handle.agent.session)
    const updated: TopicMetadata = {
      ...metadata,
      cachedTitle: renamed.title,
      cachedTitleSource: 'user',
      cachedTitleEventSeq: renamed.eventSeq,
      updatedAt: Date.now(),
    }
    await this.index.save(updated)
    return this.snapshot(updated, signal, true)
  }

  private async archive(sessionId: string, archived: boolean, signal?: AbortSignal): Promise<TopicSnapshot> {
    const metadata = await this.index.loadBySessionId(sessionId)
    this.assertOpen(signal)
    const updated = { ...metadata, archivedAt: archived ? Date.now() : null, updatedAt: Date.now() }
    await this.index.save(updated)
    return this.snapshot(updated, signal, true)
  }

  /** Restore only admissions newer than the latest explicit archive; serialize with rename/delete/archive. */
  private restoreSubmittedTopic(metadata: TopicMetadata, submittedAt: number | null, admitted = false): Promise<TopicMetadata> {
    const restore = async () => {
      const latest = await this.index.loadBySessionId(metadata.sessionId)
      if (submittedAt === null || latest.archivedAt === null || submittedAt <= latest.archivedAt) return latest
      return this.patchMetadata(latest, { archivedAt: null, updatedAt: Math.max(latest.updatedAt, submittedAt) })
    }
    return admitted ? restore() : this.queueTopicAdmission(metadata.sessionId, restore, this.lifecycleAbort.signal)
  }

  private async delete(
    sessionId: string,
    confirmSessionId: string,
    signal?: AbortSignal,
  ): Promise<DeleteResponse> {
    if (sessionId !== confirmSessionId) throw new Error('Topic deletion confirmation does not match the target Session')
    await this.index.loadBySessionId(sessionId)
    if (this.deleting.has(sessionId)) throw new Error(`CiteCiter Topic "${sessionId}" is being deleted`)
    // Publish intent before joining the admission chain so queued and later mutations cannot revive the Topic.
    this.deleting.add(sessionId)
    let committed = false
    try {
      this.pendingQuestions.get(sessionId)?.reject(
        new UserQuestionError('the Topic was permanently deleted', 'ASK_ABORTED'),
      )
      this.handles.get(sessionId)?.agent.cancel({ kind: 'user' })
      return await this.queueTopicAdmission(
        sessionId,
        () => this.deleteAdmitted(sessionId, signal, () => { committed = true }),
        signal,
        true,
      )
    } catch (error) {
      if (!committed) this.deleting.delete(sessionId)
      throw error
    }
  }

  private async deleteAdmitted(
    sessionId: string,
    signal: AbortSignal | undefined,
    onCommit: () => void,
  ): Promise<DeleteResponse> {
    const metadata = await this.index.loadBySessionId(sessionId)
    this.assertOpen(signal)
    const opening = this.opening.get(sessionId)
    const handle = this.handles.get(sessionId) ?? (opening === undefined ? undefined : await opening)
    this.assertOpen(signal)
    if (handle !== undefined) {
      await handle.dispose()
      this.handles.delete(sessionId)
    }
    const sessionHeader = await this.readRetiredSessionHeader(metadata, signal)
    await this.native.retire(metadata)
    this.assertOpen(signal)
    const marker = await this.index.markDeleting(metadata, sessionHeader)
    onCommit()
    let cleanup: DeleteResponse['cleanup'] = 'complete'
    try {
      await this.finishDeletion(marker)
    } catch (error) {
      cleanup = 'pending'
      this.host.logger.warn(`CiteCiter deferred physical cleanup for deleted Topic ${sessionId}`, error)
    }
    this.clearDeletedTopicState(sessionId)
    return {
      kind: 'deleted',
      sessionId,
      sourceSessionId: metadata.sourceSessionId,
      topicId: metadata.topicId,
      cleanup,
    }
  }

  /** Observe the retired Session after its Agent has released write ownership. */
  private async readRetiredSessionHeader(metadata: TopicMetadata, signal?: AbortSignal): Promise<SessionHeader> {
    const backend = (await this.native.context(metadata)).sessionPersistence
    const stored = await backend.stat(SessionId(metadata.sessionId), signal === undefined ? {} : { signal })
    return stored?.header ?? {
      version: SESSION_FORMAT_VERSION,
      id: SessionId(metadata.sessionId),
      createdAt: metadata.createdAt,
      isSeeded: false,
      ...(metadata.sourceCwd === '' ? {} : { cwd: metadata.sourceCwd }),
    }
  }

  private async finishDeletion(marker: TopicDeletionMarker): Promise<void> {
    const root = await this.sourceStorage.root(marker.sourceSessionId)
    if (root === undefined) throw new Error('Citer 来源所有权标记不可用，已保留待清理记录')
    this.index.bindSource(marker.sourceSessionId, root)
    await this.index.forgetLegacy(marker)
    const directory = this.index.ownedDirectory(marker.sourceSessionId, marker.topicId)
    await new DraftStore(directory).remove()
    await new QuestionDraftStore(directory).remove()
    await removeOwnedSessionTree(directory)
    await this.index.finishDeleting(marker)
  }

  private async recoverDeletions(): Promise<void> {
    for (const marker of await this.index.listDeleting()) {
      this.deleting.add(marker.sessionId)
      try {
        await this.finishDeletion(marker)
      } catch (error) {
        this.host.logger.warn(`CiteCiter could not resume physical cleanup for Topic ${marker.sessionId}`, error)
      }
    }
  }

  private clearDeletedTopicState(sessionId: string): void {
    this.handles.delete(sessionId)
    this.opening.delete(sessionId)
    this.pendingQuestions.delete(sessionId)
    this.titleHydrated.delete(sessionId)
    for (const key of this.asks.keys()) {
      if (key.startsWith(`${sessionId}\0`)) this.asks.delete(key)
    }
  }

  private async setModelRoute(
    request: CiteCiterRequest & { action: 'set-model-route' },
    signal?: AbortSignal,
  ): Promise<TopicSnapshot> {
    const metadata = await this.index.loadBySessionId(request.topicSessionId)
    this.assertOpen(signal)
    await this.host.llm.resolveModelInfo(request.provider, request.model, signal)
    await this.ensureHandle(metadata, signal)
    this.assertOpen(signal)
    const modelConfig = { ...metadata.modelConfig, provider: request.provider, model: request.model }
    delete modelConfig.reasoningEffort
    const updated = { ...metadata, modelConfig, modelSelectionRequired: false, updatedAt: Date.now() }
    // The host may reject a retired catalog entry. Do not persist a selection it did not accept.
    await this.host.sessionController.selectModel({ sessionId: SessionId(metadata.sessionId), provider: request.provider, model: request.model })
    await this.index.save(updated)
    return this.snapshot(updated, signal, true)
  }

  private async setReasoningEffort(
    request: CiteCiterRequest & { action: 'set-reasoning-effort' },
    signal?: AbortSignal,
  ): Promise<TopicSnapshot> {
    const metadata = await this.index.loadBySessionId(request.topicSessionId)
    this.assertOpen(signal)
    const model = await this.host.llm.resolveModelInfo(
      metadata.modelConfig.provider,
      metadata.modelConfig.model,
      signal,
    )
    if (
      request.reasoningEffort !== null
      && model.reasoning?.efforts.some((effort) => String(effort.id) === request.reasoningEffort) !== true
    ) throw new Error(`模型不支持思考强度 ${request.reasoningEffort}`)
    await this.ensureHandle(metadata, signal)
    this.assertOpen(signal)
    const modelConfig = { ...metadata.modelConfig }
    if (request.reasoningEffort === null) delete modelConfig.reasoningEffort
    else modelConfig.reasoningEffort = request.reasoningEffort
    const updated = { ...metadata, modelConfig, modelSelectionRequired: false, updatedAt: Date.now() }
    await this.host.sessionController.selectModel({ sessionId: SessionId(metadata.sessionId), provider: modelConfig.provider, model: modelConfig.model, ...(modelConfig.reasoningEffort === undefined ? {} : { reasoningEffort: modelConfig.reasoningEffort }) })
    await this.index.save(updated)
    return this.snapshot(updated, signal, true)
  }

  private async importDocument(
    request: CiteCiterRequest & { action: 'document-import' },
    signal?: AbortSignal,
  ): Promise<DocumentSummary> {
    this.assertOpen(signal)
    return this.documents.import({
      title: request.title,
      format: request.format,
      content: request.content,
    })
  }

  private async models(signal?: AbortSignal): Promise<ProviderOption[]> {
    const providers: ProviderOption[] = []
    for (const provider of this.host.llm.listProviders()) {
      this.assertOpen(signal)
      let catalog: LlmModelInfo[]
      try {
        catalog = await this.host.llm.listModels(provider.id)
        this.assertOpen(signal)
      } catch (error) {
        signal?.throwIfAborted()
        this.host.logger.warn(`CiteCiter could not list models for ${provider.id}`, error)
        catalog = []
      }
      const models = []
      for (const model of catalog) {
        let resolved
        try {
          resolved = await this.host.llm.resolveModelInfo(provider.id, model.id, signal)
        } catch (error) {
          signal?.throwIfAborted()
          this.host.logger.warn(`CiteCiter could not resolve ${provider.id}/${model.id}`, error)
        }
        models.push({
          id: model.id,
          name: model.name,
          ...(model.description === undefined ? {} : { description: model.description }),
          reasoningEfforts: resolved?.reasoning?.efforts.map((effort) => ({
            id: String(effort.id),
            name: effort.name,
          })) ?? [],
        })
      }
      providers.push({ id: provider.id, name: provider.name, models })
    }
    return providers
  }

  private async list(
    sourceSessionId: string,
    includeArchived: boolean,
    signal?: AbortSignal,
  ): Promise<TopicSummary[]> {
    const metadata = await this.index.list(sourceSessionId)
    this.assertOpen(signal)
    const summaries = await Promise.all(metadata
      .filter((topic) => includeArchived ? topic.archivedAt !== null : topic.archivedAt === null)
      .map((topic) => this.summary(topic, signal)))
    return summaries.sort((left, right) => right.updatedAt - left.updatedAt)
  }

  private summary(metadata: TopicMetadata, signal?: AbortSignal): Promise<TopicSummary> {
    // List metadata can become stale while deletion waits. Re-read inside the
    // Topic queue before a title read can construct an owned Session realm.
    return this.queueTopicAdmission(metadata.sessionId, async () => {
      let current = await this.index.loadBySessionId(metadata.sessionId)
      if (current.cachedTitle === null && !this.titleHydrated.has(current.sessionId)) {
        const log = await this.readLog(current, signal)
        const title = foldTopicTitle(log)
        current = await this.patchMetadataSerialized(current, {
          cachedTitle: title?.title ?? null,
          cachedTitleSource: titleSourceKind(title),
          cachedTitleEventSeq: title?.eventSeq ?? null,
        }, signal, true)
        this.titleHydrated.add(current.sessionId)
      }
      return this.summaryFromMetadata(current)
    }, signal)
  }

  private summaryFromMetadata(metadata: TopicMetadata): TopicSummary {
    const agent = this.handles.get(metadata.sessionId)?.agent ?? this.host.agents.get(SessionId(metadata.sessionId))
    const title = metadata.cachedTitle
    return {
      permission: agent === undefined ? 'read-only' : this.host.sandboxPolicy.resolve({ session: agent.session }).mode,
      topicId: metadata.topicId,
      sessionId: metadata.sessionId,
      sourceSessionId: metadata.sourceSessionId,
      documentId: metadata.documentId,
      citation: metadata.citation,
      title: title ?? metadata.temporaryTitle,
      titlePending: title === null,
      createdAt: metadata.createdAt,
      updatedAt: metadata.updatedAt,
      archived: metadata.archivedAt !== null,
      running: agent?.status === 'running',
      sourceAvailable: this.sourceAvailability.get(metadata.sourceSessionId) ?? metadata.sourceAvailable,
      observedThroughSeq: metadata.observedThroughSeq ?? null,
      modelConfig: metadata.modelConfig,
      modelSelectionRequired: metadata.modelSelectionRequired === true,
    }
  }

  /** Serialize reads/saves with deletion and report only durable, exact deletion evidence. */
  private withOwnedTopic(
    sessionId: string,
    read: (metadata: TopicMetadata) => Promise<CiteCiterResponse>,
    signal: AbortSignal,
  ): Promise<CiteCiterResponse> {
    return this.queueTopicAdmission(sessionId, async () => {
      const metadata = await this.index.findBySessionId(sessionId)
      if (metadata === undefined) {
        const receipt = await this.index.findDeleted(sessionId)
        if (receipt !== undefined) {
          const { version: _, ...identity } = receipt
          return { kind: 'deleted', ...identity }
        }
        throw new Error(`CiteCiter Topic "${sessionId}" does not exist`)
      }
      // Uncommitted deletion intent is not proof that deletion succeeded.
      if (this.deleting.has(sessionId)) throw new Error(`CiteCiter Topic "${sessionId}" is being deleted`)
      return read(metadata)
    }, signal, true)
  }

  private async readLog(metadata: TopicMetadata, signal?: AbortSignal): Promise<TopicLog> {
    if (signal !== undefined) this.assertOpen(signal)
    const live = this.handles.get(metadata.sessionId)?.agent.session ?? this.host.agents.get(SessionId(metadata.sessionId))?.session
    if (live !== undefined) return {
      header: live.header, events: live.snapshotEvents(), inheritedEventCount: live.inheritedEventCount,
      liveMessage: this.streams.get(metadata.sessionId)?.snapshot(),
      renderKeys: this.streams.get(metadata.sessionId)?.renderKeys,
    }
    const options = signal === undefined ? {} : { signal }
    const reader = await (await this.native.context(metadata)).sessionPersistence.open(SessionId(metadata.sessionId), 'read', options)
    try {
      const { events } = await reader.read(0, undefined, options)
      if (signal !== undefined) this.assertOpen(signal)
      return { header: reader.header, events, inheritedEventCount: reader.inheritedEventCount }
    } finally {
      await reader.close()
    }
  }

  private scheduleSourceAvailabilityCheck(metadata: TopicMetadata): void {
    if (
      this.closed
      || metadata.documentId !== null
      || this.sourceAvailability.has(metadata.sourceSessionId)
      || this.sourceAvailabilityChecks.has(metadata.sourceSessionId)
    ) return
    const check = (async () => {
      let available = true
      try {
        await readSourceSession(this.host, metadata.sourceSessionId)
      } catch {
        available = false
      }
      if (this.closed) return
      try {
        await this.rememberSourceAvailability(metadata, available)
      } catch (error) {
        this.host.logger.warn(`CiteCiter could not record source availability for ${metadata.sessionId}`, error)
      }
    })()
      .finally(() => {
        this.sourceAvailabilityChecks.delete(metadata.sourceSessionId)
      })
    this.sourceAvailabilityChecks.set(metadata.sourceSessionId, check)
  }

  private async rememberSourceAvailability(metadata: TopicMetadata, available: boolean): Promise<void> {
    this.sourceAvailability.set(metadata.sourceSessionId, available)
    await this.queueTopicAdmission(metadata.sessionId, async () => {
      const latest = await this.index.loadBySessionId(metadata.sessionId)
      if (latest.sourceAvailable !== available) await this.patchMetadata(latest, { sourceAvailable: available })
    }, this.lifecycleAbort.signal)
  }

  private async snapshot(
    metadata: TopicMetadata,
    signal?: AbortSignal,
    admitted = false,
  ): Promise<TopicSnapshot> {
    let current = metadata
    this.scheduleSourceAvailabilityCheck(current)
    const log = await this.readLog(current, signal)
    if (current.archivedAt !== null) {
      current = await this.restoreSubmittedTopic(current, latestTopicSubmission(log.events, log.inheritedEventCount), admitted)
    }
    const title = foldTopicTitle(log)
    const latest = log.events.at(-1)?.time ?? metadata.updatedAt
    const observedThroughSeq = latestObservedSeq(log.events)
    const cachedTitleSource = titleSourceKind(title)
    if (latest > current.updatedAt || observedThroughSeq !== (current.observedThroughSeq ?? null) || (
      title !== undefined && (
        title.title !== current.cachedTitle
        || cachedTitleSource !== current.cachedTitleSource
        || title.eventSeq !== current.cachedTitleEventSeq
      )
    )) {
      current = await this.patchMetadataSerialized(current, {
        updatedAt: Math.max(current.updatedAt, latest),
        observedThroughSeq,
        ...(title === undefined
          ? {}
          : {
              cachedTitle: title.title,
              cachedTitleSource,
              cachedTitleEventSeq: title.eventSeq,
            }),
      }, signal, admitted)
    }
    const pending = this.pendingQuestions.get(current.sessionId)
    const ownedAgent = this.handles.get(current.sessionId)?.agent
    const questions = [
      ...(pending === undefined ? [] : [openQuestion(pending.key, pending.questions, pending.wait, pending.callId)]),
      ...(ownedAgent === undefined ? [] : continuedQuestions(ownedAgent)),
      ...(ownedAgent === undefined ? [] : await this.recoveredBlockingQuestions(current, ownedAgent)),
    ]
    const captureId = this.boardCapture.id(current.sessionId)
    const document = current.documentId === null ? null : await this.documents.summary(current.documentId)
    return {
      ...(captureId === undefined ? {} : { captureId }),
      ...(document === null ? {} : { documentTitle: document.title }),
      topic: this.summaryFromMetadata(current),
      ...topicMessages(log),
      board: projectBoardFromLog(log),
      pendingQuestion: questions[0] ?? null,
      pendingQuestions: questions,
    }
  }

  /** Recover persisted blocking cards only; rendering never enqueues a model request. */
  private async recoveredBlockingQuestions(metadata: TopicMetadata, agent: Agent): Promise<PendingQuestion[]> {
    const records = await new QuestionDraftStore(this.index.ownedDirectory(metadata.sourceSessionId, metadata.topicId)).records()
    const events = agent.session.snapshotEvents()
    const liveKey = this.pendingQuestions.get(metadata.sessionId)?.key
    return records.flatMap(record => {
      if (record.key === liveKey) return []
      const question = recoverBlockingQuestion(metadata.sessionId, record, events, agent.session.inheritedEventCount)
      return question?.callId === undefined || this.questionReplies.isQueued(agent, question.callId) ? [] : [question]
    })
  }

  private async patchMetadata(
    metadata: TopicMetadata,
    patch: Partial<TopicMetadata>,
    signal?: AbortSignal,
  ): Promise<TopicMetadata> {
    if (this.deleting.has(metadata.sessionId)) {
      throw new Error(`CiteCiter Topic "${metadata.sessionId}" is being deleted`)
    }
    const latest = await this.index.loadBySessionId(metadata.sessionId)
    if (signal !== undefined) this.assertOpen(signal)
    const updated = topicMetadataSchema.parse({ ...latest, ...patch }) as TopicMetadata
    await this.index.save(updated)
    return updated
  }

  private patchMetadataSerialized(
    metadata: TopicMetadata,
    patch: Partial<TopicMetadata>,
    signal?: AbortSignal,
    admitted = false,
  ): Promise<TopicMetadata> {
    return admitted
      ? this.patchMetadata(metadata, patch, signal)
      : this.queueTopicAdmission(
          metadata.sessionId,
          () => this.patchMetadata(metadata, patch, signal),
          signal,
        )
  }
}

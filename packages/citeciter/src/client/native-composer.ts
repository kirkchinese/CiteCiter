import { t } from './i18n.ts'
import type { Context } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { ToolCallId } from '@deepseek-ai/dsh-llm/brand'
import type {} from '@deepseek-ai/dsh-user-questions/remote'
import type { ComposerAttachment, ConversationController, DraftAttachmentId, DraftFileUploads } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import type { SessionFace } from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import { CiterSessionFace, type CiterSessionSnapshot } from './citer-session-face.ts'
import { requireSelectedModel } from '../model-admission.ts'
import type { CiteCiterRequest, PendingQuestion } from '../topic.ts'
import { TopicQuestionController } from './topic-question-controller.ts'
import { createQuestionDraftController, type QuestionDraftResult } from './question-draft-controller.ts'
import { EMPTY_QUESTION_DRAFT_STATE } from '../question-draft-contract.ts'

export type DeliveryMode = 'queue' | 'steer'
/** A lost transport response is not proof that the host rejected a submission. */
export class UncertainSubmissionError extends Error {}
export interface NativeComposer {
  readonly uploads: ObservableSnapshot<DraftFileUploads>
  /** Controllers stay alive across hidden/unmounted cards, like native DSH question carriers. */
  question(sessionId: string, pending: PendingQuestion): TopicQuestionController
  syncQuestions(sessionId: string, questions: readonly PendingQuestion[]): void
  /**
   * Release one confirmed deleted Topic's local carriers and reject their later reuse.
   * @param sessionId - identity validated against the successful Host deletion response.
   * Idempotent; a missing list row or a failed read is not proof of deletion.
   */
  retire(sessionId: string): void
  /** Observe a confirmed retirement; unsubscribe with the owning controller. */
  onRetired(listener: (sessionId: string) => void): () => void
  hasUnsavedQuestionDrafts(): boolean
  flushQuestionDrafts(): Promise<PromiseSettledResult<void>[]>
  retry(sessionId: string, id: DraftAttachmentId): void
  watch(sessionId: string, listener: (snapshot: CiterSessionSnapshot) => void): () => void
  queue(sessionId: string, id: Parameters<SessionFace['updateQueue']>[0], action: Parameters<SessionFace['updateQueue']>[1]): Promise<void>
  /** Read an image or file through its owning Session's attachment authorization. */
  attachment(sessionId: string, id: string): Promise<Blob>
  add(sessionId: string, files: readonly File[]): Promise<readonly ComposerAttachment[]>
  remove(id: DraftAttachmentId): void
  send(sessionId: string, text: string, attachments: readonly DraftAttachmentId[], mode: DeliveryMode, requestId?: string): Promise<void>
}

/** Adapt the installed conversation service's published composer methods; never reach its private input machine. */
export function createNativeComposer(ctx: Context): NativeComposer {
  const conversation = ctx.conversation as ConversationController
  const owned = new Set<DraftAttachmentId>()
  const sessions = new Map<string, CiterSessionFace>()
  const questions = new Map<string, Map<string, TopicQuestionController>>()
  // Only identities whose deletion this Client has authoritatively confirmed.
  const retired = new Set<string>()
  const retirementListeners = new Set<(sessionId: string) => void>()
  const questionControllers = () => [...questions.values()].flatMap(group => [...group.values()])
  const disposeQuestion = (question: TopicQuestionController, deleted = false) => question.dispose(deleted).catch(error => {
    ctx.logger.warn(`CiteCiter question draft could not finish saving: ${String(error)}`)
  })
  let disposed = false
  ctx.effect(() => async () => {
    disposed = true
    for (const session of sessions.values()) session.dispose()
    sessions.clear()
    await Promise.all(questionControllers().map(question => disposeQuestion(question)))
    questions.clear()
    for (const id of owned) conversation.releaseDraftAttachment(id)
    owned.clear(); retired.clear(); retirementListeners.clear()
  }, 'citeciter: native attachment drafts')
  if (typeof conversation.sendSession !== 'function' || typeof conversation.createDrafts !== 'function') {
    throw new Error(t('panel.error.nativeUnavailable'))
  }
  const retire = (sessionId: string) => {
    if (retired.has(sessionId)) return
    retired.add(sessionId)
    const session = sessions.get(sessionId)
    sessions.delete(sessionId)
    session?.dispose()
    const group = questions.get(sessionId)
    questions.delete(sessionId)
    if (group !== undefined) for (const question of group.values()) void disposeQuestion(question, true)
    for (const listener of retirementListeners) listener(sessionId)
  }
  const face = (id: string) => {
    if (disposed) throw new Error(t('panel.error.citerClosed'))
    if (retired.has(id)) throw new Error(t('panel.error.topicDeleted'))
    let session = sessions.get(id)
    if (session === undefined) { session = new CiterSessionFace(ctx, id as SessionId, () => retire(id)); sessions.set(id, session) }
    return session
  }
  const binding = async (id: string) => {
    const session = face(id)
    await session.ready()
    return { session }
  }
  const syncQuestions = (sessionId: string, pending: readonly PendingQuestion[]) => {
    const group = questions.get(sessionId)
    if (group === undefined) return
    for (const [key, controller] of group) {
      const current = pending.find(question => question.key === key)
      if (current === undefined) { void disposeQuestion(controller); group.delete(key) }
      else controller.sync(current)
    }
    if (group.size === 0) questions.delete(sessionId)
  }
  const questionRequest = async (request: CiteCiterRequest & { topicSessionId: string }): Promise<QuestionDraftResult | undefined> => {
    const response = await ctx.remote.citeciter.request(request)
    if (!response.ok) throw new Error(response.error.message)
    if (response.value.kind === 'deleted') {
      if (response.value.sessionId !== request.topicSessionId) throw new Error(t('panel.response.questionReceiptMismatch'))
      retire(request.topicSessionId)
      throw new Error(t('panel.response.questionDeleted'))
    }
    if (request.action === 'answer-question' && request.draftRevision !== undefined && response.value.kind === 'question-draft') return response.value
    if (response.value.kind !== 'topic' || response.value.topic.topic.sessionId !== request.topicSessionId) throw new Error(t('panel.response.questionMismatch'))
    syncQuestions(request.topicSessionId, response.value.topic.pendingQuestions ?? (response.value.topic.pendingQuestion === null ? [] : [response.value.topic.pendingQuestion]))
    return undefined
  }
  return {
    uploads: conversation.fileUploads,
    question: (sessionId, pending) => {
      if (disposed || retired.has(sessionId)) throw new Error(t('panel.error.topicQuestionClosed'))
      let group = questions.get(sessionId)
      if (group === undefined) { group = new Map(); questions.set(sessionId, group) }
      let controller = group.get(pending.key)
      if (controller === undefined) {
        const draftRequest = async (request: CiteCiterRequest) => {
          const response = await ctx.remote.citeciter.request(request)
          if (!response.ok) throw new Error(response.error.message)
          if (response.value.kind === 'deleted' && response.value.sessionId === sessionId) {
            retire(sessionId)
            return { state: EMPTY_QUESTION_DRAFT_STATE, conflict: false, closed: true }
          }
          if (response.value.kind !== 'question-draft') throw new Error(t('panel.response.questionDraftMismatch'))
          return response.value
        }
        const drafts = createQuestionDraftController({
          get: () => draftRequest({ action: 'question-draft-get', topicSessionId: sessionId, key: pending.key }),
          save: state => draftRequest({ action: 'question-draft-save', topicSessionId: sessionId, key: pending.key, state }),
        }, () => document.hasFocus())
        controller = new TopicQuestionController(pending, {
          claim: (callId, signal) => ctx.remote.userQuestions.attachWait(sessionId as SessionId, callId as ToolCallId, signal),
          answer: (key, answer, draftRevision) => questionRequest({ action: 'answer-question', topicSessionId: sessionId, key, answer, draftRevision }),
          cancel: async key => { await questionRequest({ action: 'cancel-question', topicSessionId: sessionId, key }) },
          timeout: async key => { await questionRequest({ action: 'timeout-question', topicSessionId: sessionId, key }) },
        }, drafts)
        group.set(pending.key, controller)
      }
      return controller
    },
    syncQuestions, retire,
    onRetired: listener => { retirementListeners.add(listener); return () => { retirementListeners.delete(listener) } },
    hasUnsavedQuestionDrafts: () => questionControllers().some(question => question.drafts.hasUnsavedChanges()),
    flushQuestionDrafts: () => Promise.allSettled(questionControllers().map(question => question.drafts.flush())),
    retry: (id, attachment) => {
      // A stale button can outlive its Topic for the final React commit.
      if (disposed || retired.has(id)) return
      conversation.retryFileUpload(id as SessionId, attachment)
    },
    watch: (id, listener) => {
      const session = face(id)
      const update = () => listener(session.getSnapshot())
      const unsubscribe = session.subscribe(update)
      update()
      return unsubscribe
    },
    queue: async (id, item, action) => {
      const result = await (await binding(id)).session.updateQueue(item, action)
      if (!result.ok && result.error.code !== 'session/queue-item-not-found') throw new Error(result.error.message)
    },
    attachment: async (sessionId, id) => {
      const target = await binding(sessionId)
      const result = await target.session.readCiterAttachment(id)
      if (!result.ok) throw new Error(result.error.message)
      return new Blob([new Uint8Array(result.value.data)], { type: 'mediaType' in result.value.attachment ? result.value.attachment.mediaType : 'application/octet-stream' })
    },
    add: async (id, files) => {
      await binding(id)
      if (disposed) throw new Error(t('panel.response.closedBeforeAttachment'))
      if (retired.has(id)) throw new Error(t('panel.response.deletedBeforeAttachment'))
      const drafts = conversation.createDrafts(id as SessionId, files)
      for (const draft of drafts) owned.add(draft.id)
      return drafts
    },
    remove: id => { conversation.releaseDraftAttachment(id); owned.delete(id) },
    send: async (id, text, attachments, mode, requestId) => {
      const target = await binding(id)
      requireSelectedModel({ modelSelectionRequired: target.session.getSnapshot().modelSelectionRequired })
      if (requestId !== undefined) target.session.prepareSubmission(requestId)
      const outcome = await conversation.sendSession(target.session, text, attachments, mode).catch(error => {
        throw new UncertainSubmissionError(t('panel.error.sendUnknown', { error: String(error) }))
      })
      if (outcome.kind === 'error') {
        const failure = target.session.getSnapshot().promptError?.error
        const details = failure?.details
        const attachmentReason = details !== null && typeof details === 'object' && 'reason' in details ? details.reason : undefined
        const reason = failure?.code === 'session/attachment-invalid' && (attachmentReason === 'INVALID_IMAGE' || attachmentReason === 'IMAGE_TYPE_MISMATCH')
          ? t('panel.error.attachmentInvalid')
          : failure?.message ?? outcome.text ?? t('panel.error.sendRefused')
        if (failure === undefined) throw new UncertainSubmissionError(t('panel.error.checkSend', { reason }))
        throw new Error(t('panel.error.draftRetained', { reason }))
      }
      for (const id of attachments) owned.delete(id)
    },
  }
}

import type { AttachmentIdType } from '@deepseek-ai/dsh-attachment'
import type { Context } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { ComposerAttachment, ConversationController, DraftAttachmentId, DraftFileUploads } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import type { SessionFace, SessionSnapshot } from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import { CiterSessionFace } from './citer-session-face.ts'

export type DeliveryMode = 'queue' | 'steer'
export interface NativeComposer {
  readonly uploads: ObservableSnapshot<DraftFileUploads>
  retry(sessionId: string, id: DraftAttachmentId): void
  watch(sessionId: string, listener: (snapshot: SessionSnapshot) => void): () => void
  queue(sessionId: string, id: Parameters<SessionFace['updateQueue']>[0], action: Parameters<SessionFace['updateQueue']>[1]): Promise<void>
  image(sessionId: string, id: string): Promise<Blob>
  add(sessionId: string, files: readonly File[]): Promise<readonly ComposerAttachment[]>
  remove(id: DraftAttachmentId): void
  send(sessionId: string, text: string, attachments: readonly DraftAttachmentId[], mode: DeliveryMode): Promise<void>
}

/** Adapt the installed conversation service's published composer methods; never reach its private input machine. */
export function createNativeComposer(ctx: Context): NativeComposer {
  const conversation = ctx.conversation as ConversationController
  const owned = new Set<DraftAttachmentId>()
  const sessions = new Map<string, CiterSessionFace>()
  let disposed = false
  ctx.effect(() => () => { disposed = true; for (const session of sessions.values()) session.dispose(); sessions.clear(); for (const id of owned) conversation.releaseDraftAttachment(id); owned.clear() }, 'citeciter: native attachment drafts')
  if (typeof conversation.sendSession !== 'function' || typeof conversation.createDrafts !== 'function') {
    throw new Error('当前 DSH 不提供 Citer 所需的原生附件发送接口')
  }
  const face = (id: string) => {
    if (disposed) throw new Error('Citer 已关闭')
    let session = sessions.get(id)
    if (session === undefined) { session = new CiterSessionFace(ctx, id as SessionId); sessions.set(id, session) }
    return session
  }
  const binding = async (id: string) => {
    const session = face(id)
    await session.ready()
    return { session }
  }
  return {
    uploads: conversation.fileUploads,
    retry: (id, attachment) => conversation.retryFileUpload(id as SessionId, attachment),
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
    image: async (sessionId, id) => {
      const target = await binding(sessionId)
      const result = await target.session.readAttachment(id as AttachmentIdType)
      if (!result.ok) throw new Error(result.error.message)
      return new Blob([new Uint8Array(result.value.data)], { type: result.value.attachment.mediaType })
    },
    add: async (id, files) => {
      await binding(id)
      if (disposed) throw new Error('Citer 已关闭，未创建附件')
      const drafts = conversation.createDrafts(id as SessionId, files)
      for (const draft of drafts) owned.add(draft.id)
      return drafts
    },
    remove: id => { conversation.releaseDraftAttachment(id); owned.delete(id) },
    send: async (id, text, attachments, mode) => {
      const target = await binding(id)
      const outcome = await conversation.sendSession(target.session, text, attachments, mode)
      if (outcome.kind === 'error') {
        const failure = target.session.getSnapshot().promptError?.error
        const details = failure?.details
        const attachmentReason = details !== null && typeof details === 'object' && 'reason' in details ? details.reason : undefined
        const reason = failure?.code === 'session/attachment-invalid' && (attachmentReason === 'INVALID_IMAGE' || attachmentReason === 'IMAGE_TYPE_MISMATCH')
          ? '附件格式无效或内容损坏，请移除或更换附件后重试'
          : failure?.message ?? outcome.text ?? 'DSH 未接受此次发送'
        throw new Error(`${reason}；草稿已保留`)
      }
      for (const id of attachments) owned.delete(id)
    },
  }
}

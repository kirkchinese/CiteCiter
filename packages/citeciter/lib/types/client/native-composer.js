import { CiterSessionFace } from "./citer-session-face.js";
/** Adapt the installed conversation service's published composer methods; never reach its private input machine. */
export function createNativeComposer(ctx) {
    const conversation = ctx.conversation;
    const owned = new Set();
    const sessions = new Map();
    let disposed = false;
    ctx.effect(() => () => { disposed = true; for (const session of sessions.values())
        session.dispose(); sessions.clear(); for (const id of owned)
        conversation.releaseDraftAttachment(id); owned.clear(); }, 'citeciter: native attachment drafts');
    if (typeof conversation.sendSession !== 'function' || typeof conversation.createDrafts !== 'function') {
        throw new Error('当前 DSH 不提供 Citer 所需的原生附件发送接口');
    }
    const face = (id) => {
        if (disposed)
            throw new Error('Citer 已关闭');
        let session = sessions.get(id);
        if (session === undefined) {
            session = new CiterSessionFace(ctx, id);
            sessions.set(id, session);
        }
        return session;
    };
    const binding = async (id) => {
        const session = face(id);
        await session.ready();
        return { session };
    };
    return {
        uploads: conversation.fileUploads,
        retry: (id, attachment) => conversation.retryFileUpload(id, attachment),
        watch: (id, listener) => {
            const session = face(id);
            const update = () => listener(session.getSnapshot());
            const unsubscribe = session.subscribe(update);
            update();
            return unsubscribe;
        },
        queue: async (id, item, action) => {
            const result = await (await binding(id)).session.updateQueue(item, action);
            if (!result.ok && result.error.code !== 'session/queue-item-not-found')
                throw new Error(result.error.message);
        },
        attachment: async (sessionId, id) => {
            const target = await binding(sessionId);
            const result = await target.session.readCiterAttachment(id);
            if (!result.ok)
                throw new Error(result.error.message);
            return new Blob([new Uint8Array(result.value.data)], { type: 'mediaType' in result.value.attachment ? result.value.attachment.mediaType : 'application/octet-stream' });
        },
        add: async (id, files) => {
            await binding(id);
            if (disposed)
                throw new Error('Citer 已关闭，未创建附件');
            const drafts = conversation.createDrafts(id, files);
            for (const draft of drafts)
                owned.add(draft.id);
            return drafts;
        },
        remove: id => { conversation.releaseDraftAttachment(id); owned.delete(id); },
        send: async (id, text, attachments, mode) => {
            const target = await binding(id);
            const outcome = await conversation.sendSession(target.session, text, attachments, mode);
            if (outcome.kind === 'error') {
                const failure = target.session.getSnapshot().promptError?.error;
                const details = failure?.details;
                const attachmentReason = details !== null && typeof details === 'object' && 'reason' in details ? details.reason : undefined;
                const reason = failure?.code === 'session/attachment-invalid' && (attachmentReason === 'INVALID_IMAGE' || attachmentReason === 'IMAGE_TYPE_MISMATCH')
                    ? '附件格式无效或内容损坏，请移除或更换附件后重试'
                    : failure?.message ?? outcome.text ?? 'DSH 未接受此次发送';
                throw new Error(`${reason}；草稿已保留`);
            }
            for (const id of attachments)
                owned.delete(id);
        },
    };
}

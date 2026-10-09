import { CiterSessionFace } from "./citer-session-face.js";
import { requireSelectedModel } from "../model-admission.js";
import { TopicQuestionController } from "./topic-question-controller.js";
import { createQuestionDraftController } from "./question-draft-controller.js";
import { EMPTY_QUESTION_DRAFT_STATE } from "../question-draft-contract.js";
/** A lost transport response is not proof that the host rejected a submission. */
export class UncertainSubmissionError extends Error {
}
/** Adapt the installed conversation service's published composer methods; never reach its private input machine. */
export function createNativeComposer(ctx) {
    const conversation = ctx.conversation;
    const owned = new Set();
    const sessions = new Map();
    const questions = new Map();
    // Only identities whose deletion this Client has authoritatively confirmed.
    const retired = new Set();
    const retirementListeners = new Set();
    const questionControllers = () => [...questions.values()].flatMap(group => [...group.values()]);
    const disposeQuestion = (question, deleted = false) => question.dispose(deleted).catch(error => {
        ctx.logger.warn(`CiteCiter question draft could not finish saving: ${String(error)}`);
    });
    let disposed = false;
    ctx.effect(() => async () => {
        disposed = true;
        for (const session of sessions.values())
            session.dispose();
        sessions.clear();
        await Promise.all(questionControllers().map(question => disposeQuestion(question)));
        questions.clear();
        for (const id of owned)
            conversation.releaseDraftAttachment(id);
        owned.clear();
        retired.clear();
        retirementListeners.clear();
    }, 'citeciter: native attachment drafts');
    if (typeof conversation.sendSession !== 'function' || typeof conversation.createDrafts !== 'function') {
        throw new Error('当前 DSH 不提供 Citer 所需的原生附件发送接口');
    }
    const retire = (sessionId) => {
        if (retired.has(sessionId))
            return;
        retired.add(sessionId);
        const session = sessions.get(sessionId);
        sessions.delete(sessionId);
        session?.dispose();
        const group = questions.get(sessionId);
        questions.delete(sessionId);
        if (group !== undefined)
            for (const question of group.values())
                void disposeQuestion(question, true);
        for (const listener of retirementListeners)
            listener(sessionId);
    };
    const face = (id) => {
        if (disposed)
            throw new Error('Citer 已关闭');
        if (retired.has(id))
            throw new Error('这个 Topic 已永久删除');
        let session = sessions.get(id);
        if (session === undefined) {
            session = new CiterSessionFace(ctx, id, () => retire(id));
            sessions.set(id, session);
        }
        return session;
    };
    const binding = async (id) => {
        const session = face(id);
        await session.ready();
        return { session };
    };
    const syncQuestions = (sessionId, pending) => {
        const group = questions.get(sessionId);
        if (group === undefined)
            return;
        for (const [key, controller] of group) {
            const current = pending.find(question => question.key === key);
            if (current === undefined) {
                void disposeQuestion(controller);
                group.delete(key);
            }
            else
                controller.sync(current);
        }
        if (group.size === 0)
            questions.delete(sessionId);
    };
    const questionRequest = async (request) => {
        const response = await ctx.remote.citeciter.request(request);
        if (!response.ok)
            throw new Error(response.error.message);
        if (response.value.kind === 'deleted') {
            if (response.value.sessionId !== request.topicSessionId)
                throw new Error('Citer 提问删除回执身份不匹配');
            retire(request.topicSessionId);
            throw new Error('这个 Topic 已永久删除，未提交回答');
        }
        if (request.action === 'answer-question' && request.draftRevision !== undefined && response.value.kind === 'question-draft')
            return response.value;
        if (response.value.kind !== 'topic' || response.value.topic.topic.sessionId !== request.topicSessionId)
            throw new Error('Citer 提问响应与当前 Topic 不匹配');
        syncQuestions(request.topicSessionId, response.value.topic.pendingQuestions ?? (response.value.topic.pendingQuestion === null ? [] : [response.value.topic.pendingQuestion]));
        return undefined;
    };
    return {
        uploads: conversation.fileUploads,
        question: (sessionId, pending) => {
            if (disposed || retired.has(sessionId))
                throw new Error('这个 Topic 的提问服务已结束');
            let group = questions.get(sessionId);
            if (group === undefined) {
                group = new Map();
                questions.set(sessionId, group);
            }
            let controller = group.get(pending.key);
            if (controller === undefined) {
                const draftRequest = async (request) => {
                    const response = await ctx.remote.citeciter.request(request);
                    if (!response.ok)
                        throw new Error(response.error.message);
                    if (response.value.kind === 'deleted' && response.value.sessionId === sessionId) {
                        retire(sessionId);
                        return { state: EMPTY_QUESTION_DRAFT_STATE, conflict: false, closed: true };
                    }
                    if (response.value.kind !== 'question-draft')
                        throw new Error('回答草稿响应类型不匹配');
                    return response.value;
                };
                const drafts = createQuestionDraftController({
                    get: () => draftRequest({ action: 'question-draft-get', topicSessionId: sessionId, key: pending.key }),
                    save: state => draftRequest({ action: 'question-draft-save', topicSessionId: sessionId, key: pending.key, state }),
                }, () => document.hasFocus());
                controller = new TopicQuestionController(pending, {
                    claim: (callId, signal) => ctx.remote.userQuestions.attachWait(sessionId, callId, signal),
                    answer: (key, answer, draftRevision) => questionRequest({ action: 'answer-question', topicSessionId: sessionId, key, answer, draftRevision }),
                    cancel: async (key) => { await questionRequest({ action: 'cancel-question', topicSessionId: sessionId, key }); },
                    timeout: async (key) => { await questionRequest({ action: 'timeout-question', topicSessionId: sessionId, key }); },
                }, drafts);
                group.set(pending.key, controller);
            }
            return controller;
        },
        syncQuestions, retire,
        onRetired: listener => { retirementListeners.add(listener); return () => { retirementListeners.delete(listener); }; },
        hasUnsavedQuestionDrafts: () => questionControllers().some(question => question.drafts.hasUnsavedChanges()),
        flushQuestionDrafts: () => Promise.allSettled(questionControllers().map(question => question.drafts.flush())),
        retry: (id, attachment) => {
            // A stale button can outlive its Topic for the final React commit.
            if (disposed || retired.has(id))
                return;
            conversation.retryFileUpload(id, attachment);
        },
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
            if (retired.has(id))
                throw new Error('这个 Topic 已永久删除，未创建附件');
            const drafts = conversation.createDrafts(id, files);
            for (const draft of drafts)
                owned.add(draft.id);
            return drafts;
        },
        remove: id => { conversation.releaseDraftAttachment(id); owned.delete(id); },
        send: async (id, text, attachments, mode, requestId) => {
            const target = await binding(id);
            requireSelectedModel({ modelSelectionRequired: target.session.getSnapshot().modelSelectionRequired });
            if (requestId !== undefined)
                target.session.prepareSubmission(requestId);
            const outcome = await conversation.sendSession(target.session, text, attachments, mode).catch(error => {
                throw new UncertainSubmissionError(`未收到发送结果：${String(error)}；请核对发送状态，草稿已保留`);
            });
            if (outcome.kind === 'error') {
                const failure = target.session.getSnapshot().promptError?.error;
                const details = failure?.details;
                const attachmentReason = details !== null && typeof details === 'object' && 'reason' in details ? details.reason : undefined;
                const reason = failure?.code === 'session/attachment-invalid' && (attachmentReason === 'INVALID_IMAGE' || attachmentReason === 'IMAGE_TYPE_MISMATCH')
                    ? '附件格式无效或内容损坏，请移除或更换附件后重试'
                    : failure?.message ?? outcome.text ?? 'DSH 未接受此次发送';
                if (failure === undefined)
                    throw new UncertainSubmissionError(`${reason}；请核对发送状态，草稿已保留`);
                throw new Error(`${reason}；草稿已保留`);
            }
            for (const id of attachments)
                owned.delete(id);
        },
    };
}

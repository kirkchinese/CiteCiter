import { DEFAULT_CITECITER_SETTINGS, } from "../topic.js";
import { readAssistantAnswer } from "./answer.js";
import { normalizeQuestion } from "./prompt.js";
import { claimAskIntent, claimCreateFreeTopicIntent, claimCreateDocumentIntent, claimCreateTopicIntent, completeRequestIntent, } from "./request-guard.js";
import { isCurrentTopicResponse, shouldReopenLastTopic } from "./response-guard.js";
/** Initial browser snapshot for the root-scoped CiteCiter controller. */
export const INITIAL_COMPANION_SNAPSHOT = {
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
    deleting: false,
    notice: null,
    includeArchived: false,
    error: null,
};
function remoteValue(result) {
    if (!result.ok)
        throw new Error(result.error.message);
    return result.value;
}
function lastTopicKey(sourceSessionId) {
    return 'citeciter:last-topic:' + sourceSessionId;
}
function readLastTopic(sourceSessionId) {
    try {
        return localStorage.getItem(lastTopicKey(sourceSessionId));
    }
    catch {
        // Browsers that deny localStorage simply skip the convenience pointer.
        return null;
    }
}
function writeLastTopic(sourceSessionId, topicSessionId) {
    try {
        localStorage.setItem(lastTopicKey(sourceSessionId), topicSessionId);
    }
    catch {
        // Topic durability is Host-owned; a blocked convenience pointer loses no data.
    }
}
function clearLastTopic(sourceSessionId, topicSessionId) {
    try {
        if (localStorage.getItem(lastTopicKey(sourceSessionId)) === topicSessionId) {
            localStorage.removeItem(lastTopicKey(sourceSessionId));
        }
    }
    catch {
        // The Host deletion is authoritative; local storage only remembers navigation.
    }
}
function citationAnchorKey(sourceSessionId, anchorSeq) {
    return `citeciter:source-anchor:${sourceSessionId}:${anchorSeq}`;
}
function readCitationAnchor(sourceSessionId, anchorSeq) {
    try {
        return localStorage.getItem(citationAnchorKey(sourceSessionId, anchorSeq));
    }
    catch {
        return null;
    }
}
function writeCitationAnchor(sourceSessionId, anchorSeq, anchorKey) {
    try {
        localStorage.setItem(citationAnchorKey(sourceSessionId, anchorSeq), anchorKey);
    }
    catch {
        // This hover-only visual hint never owns Citation durability.
    }
}
/** Bind private Topic Remote calls to one browser snapshot and polling lifecycle. */
export function createCompanionController(sessions, settingsScope, request, onAutoOpen, store) {
    let disposed = false;
    const lifecycle = new AbortController();
    const operations = new Set();
    const remoteOperations = new Set();
    let visible = false;
    let visibleConsumers = 0;
    let sourceGeneration = 0;
    let activeGeneration = 0;
    let pollTimer = null;
    let polling = false;
    let pollCount = 0;
    let topicsRefresh = null;
    let topicsRefreshAgain = false;
    let topicsShowLoading = false;
    let reopenAttemptedGeneration = -1;
    let reopenSuppressedGeneration = -1;
    let settingOperation = 0;
    let settingsReady = false;
    const pendingSettings = new Map();
    let routeOperation = 0;
    let effortOperation = 0;
    let pendingRoute = null;
    let pendingEffort = null;
    const pendingCreates = new Map();
    const pendingFreeCreates = new Map();
    const pendingAsks = new Map();
    const track = (pending, operation) => {
        let tracked;
        tracked = operation.finally(() => pending.delete(tracked));
        pending.add(tracked);
        return tracked;
    };
    const admit = (fallback, operation) => {
        if (disposed)
            return Promise.resolve(fallback);
        return track(operations, Promise.resolve().then(() => disposed ? fallback : operation()));
    };
    const update = (mutator) => {
        if (!disposed)
            store.update(mutator);
    };
    const fail = (error, operationGeneration = activeGeneration) => {
        if (disposed || operationGeneration !== activeGeneration)
            return;
        update((draft) => {
            draft.phase = 'error';
            draft.error = error instanceof Error ? error.message : String(error);
        });
    };
    const withPendingModelConfig = (topic) => {
        if (pendingRoute?.sessionId !== topic.topic.sessionId && pendingEffort?.sessionId !== topic.topic.sessionId)
            return topic;
        const modelConfig = { ...topic.topic.modelConfig };
        if (pendingRoute?.sessionId === topic.topic.sessionId) {
            modelConfig.provider = pendingRoute.provider;
            modelConfig.model = pendingRoute.model;
            delete modelConfig.reasoningEffort;
        }
        if (pendingEffort?.sessionId === topic.topic.sessionId) {
            if (pendingEffort.reasoningEffort === null)
                delete modelConfig.reasoningEffort;
            else
                modelConfig.reasoningEffort = pendingEffort.reasoningEffort;
        }
        return { ...topic, topic: { ...topic.topic, modelConfig } };
    };
    const clearRecoveredError = (topic) => {
        if (topic.error === null)
            return topic;
        const lastFailure = topic.messages.findLast((message) => message.role === 'error' && message.status === 'failed');
        if (lastFailure === undefined)
            return topic;
        const recovered = topic.messages.some((message) => message.role === 'assistant'
            && message.seq > lastFailure.seq
            && !message.streaming
            && message.text.trim() !== '');
        return recovered ? { ...topic, error: null } : topic;
    };
    const upsertTopic = (draft, topic) => {
        const belongs = topic.archived === draft.includeArchived;
        const topics = draft.topics.filter((candidate) => candidate.sessionId !== topic.sessionId);
        draft.topics = belongs ? [...topics, topic].sort((left, right) => right.updatedAt - left.updatedAt) : topics;
    };
    const acceptTopic = (rawTopic, operationGeneration, expectedSessionId) => {
        const topic = clearRecoveredError(withPendingModelConfig(rawTopic));
        const current = store.getSnapshot();
        if (disposed || !isCurrentTopicResponse(operationGeneration, activeGeneration, current.sourceSessionId, topic.topic.sourceSessionId, topic.topic.sessionId, expectedSessionId))
            return;
        update((draft) => {
            const lastMessage = topic.messages.at(-1);
            draft.active = topic;
            draft.draftQuote = null;
            draft.sourceAnchorKey = topic.topic.citation === null
                ? null
                : readCitationAnchor(topic.topic.sourceSessionId, topic.topic.citation.anchorSeq);
            const stopped = lastMessage?.role === 'error' && lastMessage.status === 'stopped';
            draft.phase = topic.topic.running ? 'running' : stopped ? 'stopped' : topic.error === null ? 'ready' : 'error';
            draft.error = topic.error;
            upsertTopic(draft, topic.topic);
        });
        writeLastTopic(topic.topic.sourceSessionId, topic.topic.sessionId);
    };
    const call = (command) => track(remoteOperations, (async () => {
        lifecycle.signal.throwIfAborted();
        const result = await request(command, lifecycle.signal);
        lifecycle.signal.throwIfAborted();
        return remoteValue(result);
    })());
    const openTopic = async (sessionId, operationGeneration = activeGeneration) => {
        if (disposed)
            return;
        update((draft) => {
            draft.phase = 'creating';
            draft.deleting = false;
            draft.notice = null;
            draft.error = null;
        });
        try {
            const response = await call({ action: 'get', topicSessionId: sessionId });
            if (response.kind !== 'topic')
                throw new Error('CiteCiter 返回了错误的 Topic 响应');
            acceptTopic(response.topic, operationGeneration, sessionId);
        }
        catch (error) {
            fail(error, operationGeneration);
        }
    };
    const refreshTopicsOnce = async (showLoading) => {
        if (disposed)
            return;
        const snapshot = store.getSnapshot();
        if (snapshot.sourceSessionId === null)
            return;
        const generation = sourceGeneration;
        const sourceSessionId = snapshot.sourceSessionId;
        const includeArchived = snapshot.includeArchived;
        if (showLoading && snapshot.topics.length === 0)
            update((draft) => {
                draft.topicsStatus = 'loading';
                draft.topicsError = null;
            });
        let response;
        try {
            response = await call({
                action: 'list',
                sourceSessionId,
                includeArchived,
            });
        }
        catch (error) {
            const current = store.getSnapshot();
            if (generation === sourceGeneration
                && current.sourceSessionId === sourceSessionId
                && current.includeArchived === includeArchived
                && !disposed)
                update((draft) => {
                    draft.topicsStatus = 'error';
                    draft.topicsError = error instanceof Error ? error.message : String(error);
                });
            return;
        }
        const current = store.getSnapshot();
        if (response.kind !== 'topics'
            || generation !== sourceGeneration
            || current.sourceSessionId !== sourceSessionId
            || current.includeArchived !== includeArchived
            || disposed)
            return;
        update((draft) => {
            draft.topics = response.topics;
            draft.topicsStatus = 'ready';
            draft.topicsError = null;
        });
        const accepted = store.getSnapshot();
        if (!settingsReady || !shouldReopenLastTopic(accepted.active !== null, accepted.phase === 'idle', accepted.settings.reopenLastTopic, includeArchived, reopenAttemptedGeneration === generation, reopenSuppressedGeneration === generation))
            return;
        reopenAttemptedGeneration = generation;
        const remembered = readLastTopic(sourceSessionId);
        const target = response.topics.find((topic) => topic.sessionId === remembered) ?? response.topics[0];
        if (target !== undefined) {
            onAutoOpen();
            await openTopic(target.sessionId, ++activeGeneration);
        }
    };
    const refreshTopics = (showLoading = false) => {
        topicsRefreshAgain = true;
        topicsShowLoading ||= showLoading;
        if (topicsRefresh !== null)
            return topicsRefresh;
        const refresh = (async () => {
            while (topicsRefreshAgain && !disposed) {
                topicsRefreshAgain = false;
                const loading = topicsShowLoading;
                topicsShowLoading = false;
                await refreshTopicsOnce(loading);
            }
        })().finally(() => {
            if (topicsRefresh === refresh)
                topicsRefresh = null;
        });
        topicsRefresh = refresh;
        return refresh;
    };
    const refreshActive = async (operationGeneration = activeGeneration) => {
        if (disposed)
            return;
        const active = store.getSnapshot().active;
        if (active === null)
            return;
        const response = await call({ action: 'get', topicSessionId: active.topic.sessionId });
        if (response.kind === 'topic')
            acceptTopic(response.topic, operationGeneration, active.topic.sessionId);
    };
    const poll = async () => {
        if (!visible || disposed || polling)
            return;
        if (pendingFreeCreates.size > 0)
            return;
        const active = store.getSnapshot().active;
        if (active !== null && pendingAsks.has(active.topic.sessionId))
            return;
        polling = true;
        const operationGeneration = activeGeneration;
        try {
            await refreshActive(operationGeneration);
            if (pollCount++ % 6 === 0)
                await refreshTopics();
        }
        catch (error) {
            fail(error, operationGeneration);
        }
        finally {
            polling = false;
        }
    };
    const loadModels = async () => {
        if (disposed || store.getSnapshot().providers.length > 0)
            return;
        const generation = sourceGeneration;
        try {
            const response = await call({ action: 'models' });
            if (response.kind === 'models' && generation === sourceGeneration)
                update((draft) => {
                    draft.providers = response.providers;
                });
        }
        catch (error) {
            if (generation === sourceGeneration)
                fail(error);
        }
    };
    const settingsSnapshot = settingsScope.getSnapshot();
    settingsReady = settingsSnapshot.status !== 'loading';
    const initialSettings = settingsSnapshot.value ?? DEFAULT_CITECITER_SETTINGS;
    update((draft) => {
        draft.settings = initialSettings;
    });
    const settingsWithPending = (value) => {
        const merged = { ...value };
        for (const [key, pending] of pendingSettings) {
            Object.assign(merged, { [key]: pending.value });
        }
        return merged;
    };
    const unsubscribeSettings = settingsScope.subscribe(() => {
        const scopeSnapshot = settingsScope.getSnapshot();
        const becameReady = !settingsReady && scopeSnapshot.status !== 'loading';
        settingsReady = scopeSnapshot.status !== 'loading';
        const value = scopeSnapshot.value;
        if (value !== undefined)
            update((draft) => {
                draft.settings = settingsWithPending(value);
            });
        if (becameReady)
            void refreshTopics();
    });
    const setSource = (sessionId) => {
        if (disposed || store.getSnapshot().sourceSessionId === sessionId)
            return;
        sourceGeneration++;
        activeGeneration++;
        routeOperation++;
        effortOperation++;
        pendingRoute = null;
        pendingEffort = null;
        reopenAttemptedGeneration = -1;
        reopenSuppressedGeneration = -1;
        update((draft) => {
            draft.sourceSessionId = sessionId;
            draft.phase = 'idle';
            draft.draftQuote = null;
            draft.sourceAnchorKey = null;
            draft.active = null;
            draft.topics = [];
            draft.topicsStatus = 'idle';
            draft.topicsError = null;
            draft.modelRouteSaving = false;
            draft.reasoningEffortSaving = false;
            draft.renaming = false;
            draft.archiving = false;
            draft.deleting = false;
            draft.notice = null;
            draft.error = null;
        });
        if (sessionId !== null)
            void refreshTopics(true);
    };
    const setVisible = (next) => {
        if (disposed || visible === next)
            return;
        visible = next;
        if (!visible) {
            reopenSuppressedGeneration = sourceGeneration;
            if (pollTimer !== null)
                clearTimeout(pollTimer);
            pollTimer = null;
            return;
        }
        void refreshTopics(true);
        void loadModels();
        const schedulePoll = () => {
            if (!visible || disposed)
                return;
            const interval = store.getSnapshot().active?.topic.running ? 250 : 700;
            pollTimer = setTimeout(() => { void poll().finally(schedulePoll); }, interval);
        };
        schedulePoll();
    };
    const dismissError = () => {
        update((draft) => {
            if (draft.phase !== 'error')
                return;
            const active = draft.active;
            const lastMessage = active?.messages.at(-1);
            const stopped = lastMessage?.role === 'error' && lastMessage.status === 'stopped';
            draft.phase = active === null ? 'idle'
                : active.topic.running ? 'running'
                    : stopped ? 'stopped'
                        : active.error === null ? 'ready' : 'error';
            draft.error = active?.error ?? null;
        });
    };
    const retainVisible = () => {
        if (disposed)
            return () => { };
        visibleConsumers++;
        if (visibleConsumers === 1)
            setVisible(true);
        let released = false;
        return () => {
            if (released || disposed)
                return;
            released = true;
            visibleConsumers--;
            if (visibleConsumers === 0)
                setVisible(false);
        };
    };
    async function runCreate(selection, question, mode, scenario, intent) {
        if (disposed)
            return;
        const operationGeneration = ++activeGeneration;
        update((draft) => {
            draft.sourceSessionId = selection.sourceSessionId;
            draft.phase = 'creating';
            draft.draftQuote = selection.displayText;
            draft.sourceAnchorKey = selection.anchorKey;
            draft.active = null;
            draft.notice = null;
            draft.error = null;
        });
        try {
            let response;
            if (selection.kind === 'assistant-step') {
                const binding = sessions.binding(selection.sourceSessionId);
                const node = binding?.session.getSnapshot().chat.nodes.get(selection.anchorKey);
                if (node === undefined || node.kind !== 'assistant-step')
                    throw new Error('选中的模型回答已不在当前会话快照中');
                const answer = readAssistantAnswer(node.data);
                if (answer === null || answer.status !== 'settled') {
                    throw new Error('请在一次模型调用完成后引用；无需等待整轮长任务结束');
                }
                response = await call({
                    action: 'create',
                    requestId: intent.requestId,
                    selectionClaim: {
                        sourceSessionId: selection.sourceSessionId,
                        anchorSeq: node.anchorSeq,
                        displayText: selection.displayText,
                        ...(selection.sourceHintText === undefined ? {} : { sourceHintText: selection.sourceHintText }),
                        prefixText: selection.prefixText,
                        suffixText: selection.suffixText,
                    },
                    question,
                    mode,
                    scenario,
                });
            }
            else {
                response = await call({
                    action: 'create',
                    requestId: intent.requestId,
                    toolClaim: {
                        sourceSessionId: selection.sourceSessionId,
                        callId: selection.callId,
                        displayText: selection.displayText,
                        projection: selection.projection,
                    },
                    question,
                    mode,
                    scenario: 'investigate',
                });
            }
            if (response.kind !== 'topic')
                throw new Error('CiteCiter 返回了错误的创建响应');
            completeRequestIntent(intent);
            if (response.topic.topic.citation !== null) {
                writeCitationAnchor(selection.sourceSessionId, response.topic.topic.citation.anchorSeq, selection.anchorKey);
            }
            acceptTopic(response.topic, operationGeneration);
            await refreshTopics();
        }
        catch (error) {
            fail(error, operationGeneration);
        }
    }
    const create = async (selection, rawQuestion, mode, scenario = 'qa') => {
        if (disposed)
            return;
        const question = normalizeQuestion(rawQuestion);
        const resolvedMode = mode ?? store.getSnapshot().settings.defaultMode;
        const intent = await claimCreateTopicIntent(selection, question, resolvedMode, scenario);
        if (disposed)
            return;
        const pending = pendingCreates.get(intent.requestId);
        if (pending !== undefined)
            return pending;
        const operation = runCreate(selection, question, resolvedMode, scenario, intent).finally(() => {
            if (pendingCreates.get(intent.requestId) === operation)
                pendingCreates.delete(intent.requestId);
        });
        pendingCreates.set(intent.requestId, operation);
        return operation;
    };
    const createFree = async (rawQuestion, scenario) => {
        if (disposed)
            return false;
        const sourceSessionId = store.getSnapshot().sourceSessionId;
        if (sourceSessionId === null)
            return false;
        const question = normalizeQuestion(rawQuestion);
        const intent = await claimCreateFreeTopicIntent(sourceSessionId, question, scenario);
        if (disposed)
            return false;
        const pending = pendingFreeCreates.get(intent.requestId);
        if (pending !== undefined)
            return pending;
        const operationGeneration = ++activeGeneration;
        update((draft) => {
            draft.phase = 'creating';
            draft.notice = null;
            draft.error = null;
        });
        const operation = (async () => {
            try {
                const response = await call({
                    action: 'create',
                    requestId: intent.requestId,
                    sourceSessionId,
                    question,
                    mode: 'observer',
                    scenario,
                });
                if (response.kind !== 'topic')
                    throw new Error('CiteCiter 返回了错误的创建响应');
                completeRequestIntent(intent);
                acceptTopic(response.topic, operationGeneration);
                await refreshTopics();
                return operationGeneration === activeGeneration;
            }
            catch (error) {
                fail(error, operationGeneration);
                return false;
            }
        })();
        pendingFreeCreates.set(intent.requestId, operation);
        try {
            return await operation;
        }
        finally {
            if (pendingFreeCreates.get(intent.requestId) === operation)
                pendingFreeCreates.delete(intent.requestId);
        }
    };
    const createFromDocument = async (claim, rawQuestion) => {
        if (disposed)
            return;
        const sourceSessionId = store.getSnapshot().sourceSessionId;
        if (sourceSessionId === null)
            throw new Error('打开 CiteCiter 面板后即可创建文档 Topic');
        const question = normalizeQuestion(rawQuestion);
        const intent = await claimCreateDocumentIntent(claim, question);
        if (disposed)
            return;
        const operationGeneration = ++activeGeneration;
        update((draft) => {
            draft.sourceSessionId = sourceSessionId;
            draft.phase = 'creating';
            draft.draftQuote = claim.displayText;
            draft.sourceAnchorKey = null;
            draft.active = null;
            draft.notice = null;
            draft.error = null;
        });
        try {
            const response = await call({
                action: 'create',
                requestId: intent.requestId,
                documentClaim: {
                    sourceSessionId,
                    documentId: claim.documentId,
                    displayText: claim.displayText,
                    prefixText: claim.prefixText,
                    suffixText: claim.suffixText,
                },
                question,
                mode: 'observer',
                scenario: 'read',
            });
            if (response.kind !== 'topic')
                throw new Error('CiteCiter 返回了错误的文档 Topic 响应');
            completeRequestIntent(intent);
            acceptTopic(response.topic, operationGeneration);
            await refreshTopics();
        }
        catch (error) {
            fail(error, operationGeneration);
        }
    };
    async function runAsk(active, question, intent) {
        if (disposed)
            return false;
        const operationGeneration = ++activeGeneration;
        update((draft) => {
            draft.phase = 'running';
            draft.error = null;
        });
        try {
            const response = await call({
                action: 'ask',
                requestId: intent.requestId,
                topicSessionId: active.topic.sessionId,
                question,
            });
            completeRequestIntent(intent);
            if (response.kind === 'topic')
                acceptTopic(response.topic, operationGeneration, active.topic.sessionId);
            return response.kind === 'topic' && operationGeneration === activeGeneration;
        }
        catch (error) {
            fail(error, operationGeneration);
            return false;
        }
    }
    const ask = async (rawQuestion) => {
        if (disposed)
            return false;
        const snapshot = store.getSnapshot();
        const active = snapshot.active;
        if (active === null || !['ready', 'stopped', 'error'].includes(snapshot.phase))
            return false;
        const sessionId = active.topic.sessionId;
        if (pendingAsks.has(sessionId))
            return false;
        const question = normalizeQuestion(rawQuestion);
        const intent = await claimAskIntent(sessionId, question);
        if (disposed || pendingAsks.has(sessionId))
            return false;
        const operation = runAsk(active, question, intent).finally(() => {
            if (pendingAsks.get(sessionId) === operation)
                pendingAsks.delete(sessionId);
        });
        pendingAsks.set(sessionId, operation);
        return operation;
    };
    const stop = async () => {
        if (disposed)
            return;
        const active = store.getSnapshot().active;
        if (active === null)
            return;
        const operationGeneration = ++activeGeneration;
        update((draft) => {
            draft.phase = 'stopping';
            draft.error = null;
        });
        try {
            const response = await call({ action: 'stop', topicSessionId: active.topic.sessionId });
            if (response.kind === 'topic')
                acceptTopic(response.topic, operationGeneration, active.topic.sessionId);
        }
        catch (error) {
            fail(error, operationGeneration);
        }
    };
    const answerQuestion = async (key, answer) => {
        if (disposed)
            return;
        const active = store.getSnapshot().active;
        if (active === null)
            return;
        const operationGeneration = ++activeGeneration;
        try {
            const response = await call({
                action: 'answer-question',
                topicSessionId: active.topic.sessionId,
                key,
                answer,
            });
            if (response.kind === 'topic')
                acceptTopic(response.topic, operationGeneration, active.topic.sessionId);
        }
        catch (error) {
            fail(error, operationGeneration);
        }
    };
    const cancelQuestion = async (key) => {
        if (disposed)
            return;
        const active = store.getSnapshot().active;
        if (active === null)
            return;
        const operationGeneration = ++activeGeneration;
        try {
            const response = await call({
                action: 'cancel-question',
                topicSessionId: active.topic.sessionId,
                key,
            });
            if (response.kind === 'topic')
                acceptTopic(response.topic, operationGeneration, active.topic.sessionId);
        }
        catch (error) {
            fail(error, operationGeneration);
        }
    };
    const rename = async (rawTitle) => {
        if (disposed)
            return false;
        const active = store.getSnapshot().active;
        const title = rawTitle.trim();
        if (active === null || title === '')
            return false;
        const operationGeneration = ++activeGeneration;
        update((draft) => {
            draft.renaming = true;
            draft.error = null;
        });
        try {
            const response = await call({ action: 'rename', topicSessionId: active.topic.sessionId, title });
            if (response.kind === 'topic')
                acceptTopic(response.topic, operationGeneration, active.topic.sessionId);
            await refreshTopics();
            if (operationGeneration === activeGeneration)
                update((draft) => {
                    draft.renaming = false;
                });
            return response.kind === 'topic' && operationGeneration === activeGeneration;
        }
        catch (error) {
            if (operationGeneration === activeGeneration)
                update((draft) => {
                    draft.renaming = false;
                });
            fail(error, operationGeneration);
            return false;
        }
    };
    const archive = async (archived) => {
        if (disposed)
            return false;
        const active = store.getSnapshot().active;
        if (active === null)
            return false;
        const operationGeneration = ++activeGeneration;
        update((draft) => {
            draft.archiving = true;
            draft.error = null;
        });
        try {
            const response = await call({ action: 'archive', topicSessionId: active.topic.sessionId, archived });
            if (response.kind === 'topic')
                acceptTopic(response.topic, operationGeneration, active.topic.sessionId);
            if (archived !== store.getSnapshot().includeArchived)
                update((draft) => {
                    if (archived) {
                        draft.active = null;
                        draft.phase = 'idle';
                    }
                    else {
                        draft.includeArchived = false;
                    }
                });
            await refreshTopics();
            if (operationGeneration === activeGeneration)
                update((draft) => {
                    draft.archiving = false;
                });
            return response.kind === 'topic' && operationGeneration === activeGeneration;
        }
        catch (error) {
            if (operationGeneration === activeGeneration)
                update((draft) => {
                    draft.archiving = false;
                });
            fail(error, operationGeneration);
            return false;
        }
    };
    const deleteTopic = async (confirmSessionId) => {
        if (disposed)
            return false;
        const active = store.getSnapshot().active;
        if (active === null || confirmSessionId !== active.topic.sessionId)
            return false;
        const operationGeneration = ++activeGeneration;
        const sessionId = active.topic.sessionId;
        const sourceSessionId = active.topic.sourceSessionId;
        const topicId = active.topic.topicId;
        update((draft) => {
            draft.deleting = true;
            draft.notice = null;
            draft.error = null;
        });
        try {
            const response = await call({
                action: 'delete',
                topicSessionId: sessionId,
                confirmSessionId,
            });
            if (response.kind !== 'deleted')
                throw new Error('CiteCiter 返回了错误的删除响应');
            if (response.sessionId !== sessionId
                || response.sourceSessionId !== sourceSessionId
                || response.topicId !== topicId)
                throw new Error('CiteCiter 返回的删除对象与当前 Topic 不一致');
            clearLastTopic(sourceSessionId, sessionId);
            const current = store.getSnapshot();
            update((draft) => {
                if (draft.sourceSessionId === sourceSessionId) {
                    draft.topics = draft.topics.filter((topic) => topic.sessionId !== sessionId);
                }
            });
            const isCurrent = !disposed
                && operationGeneration === activeGeneration
                && current.active?.topic.sessionId === sessionId;
            if (isCurrent) {
                reopenSuppressedGeneration = sourceGeneration;
                update((draft) => {
                    draft.phase = 'idle';
                    draft.active = null;
                    draft.sourceAnchorKey = null;
                    draft.deleting = false;
                    draft.notice = response.cleanup === 'complete'
                        ? 'Topic 已永久删除。'
                        : 'Topic 已删除；相关资源仍在后台清理。';
                    draft.error = null;
                });
            }
            if (store.getSnapshot().sourceSessionId === sourceSessionId)
                await refreshTopics();
            return isCurrent ? response.cleanup : false;
        }
        catch (error) {
            if (operationGeneration === activeGeneration)
                update((draft) => {
                    draft.deleting = false;
                });
            fail(error, operationGeneration);
            return false;
        }
    };
    const updateModelConfig = (sessionId, mutate) => {
        update((draft) => {
            if (draft.active?.topic.sessionId === sessionId)
                mutate(draft.active.topic.modelConfig);
            const summary = draft.topics.find((topic) => topic.sessionId === sessionId);
            if (summary !== undefined)
                mutate(summary.modelConfig);
        });
    };
    const setModelRoute = async (provider, model) => {
        if (disposed)
            return;
        const active = store.getSnapshot().active;
        if (active === null)
            return;
        const operation = ++routeOperation;
        const operationGeneration = activeGeneration;
        const sessionId = active.topic.sessionId;
        effortOperation++;
        pendingEffort = null;
        pendingRoute = { operation, sessionId, provider, model };
        update((draft) => {
            draft.modelRouteSaving = true;
            draft.reasoningEffortSaving = false;
        });
        updateModelConfig(sessionId, (modelConfig) => {
            modelConfig.provider = provider;
            modelConfig.model = model;
            delete modelConfig.reasoningEffort;
        });
        try {
            const response = await call({
                action: 'set-model-route',
                topicSessionId: sessionId,
                provider,
                model,
            });
            if (pendingRoute?.operation !== operation || pendingRoute.sessionId !== sessionId)
                return;
            pendingRoute = null;
            update((draft) => {
                draft.modelRouteSaving = false;
            });
            if (response.kind === 'topic')
                acceptTopic(response.topic, operationGeneration, sessionId);
        }
        catch (error) {
            if (pendingRoute?.operation !== operation || pendingRoute.sessionId !== sessionId)
                return;
            pendingRoute = null;
            update((draft) => {
                draft.modelRouteSaving = false;
            });
            fail(error, operationGeneration);
            if (!disposed)
                await refreshActive(activeGeneration);
        }
    };
    const setReasoningEffort = async (reasoningEffort) => {
        if (disposed)
            return;
        const active = store.getSnapshot().active;
        if (active === null)
            return;
        const operation = ++effortOperation;
        const operationGeneration = activeGeneration;
        const sessionId = active.topic.sessionId;
        pendingEffort = { operation, sessionId, reasoningEffort };
        update((draft) => {
            draft.reasoningEffortSaving = true;
        });
        updateModelConfig(sessionId, (modelConfig) => {
            if (reasoningEffort === null)
                delete modelConfig.reasoningEffort;
            else
                modelConfig.reasoningEffort = reasoningEffort;
        });
        try {
            const response = await call({
                action: 'set-reasoning-effort',
                topicSessionId: sessionId,
                reasoningEffort,
            });
            if (pendingEffort?.operation !== operation || pendingEffort.sessionId !== sessionId)
                return;
            pendingEffort = null;
            update((draft) => {
                draft.reasoningEffortSaving = false;
            });
            if (response.kind === 'topic')
                acceptTopic(response.topic, operationGeneration, sessionId);
        }
        catch (error) {
            if (pendingEffort?.operation !== operation || pendingEffort.sessionId !== sessionId)
                return;
            pendingEffort = null;
            update((draft) => {
                draft.reasoningEffortSaving = false;
            });
            fail(error, operationGeneration);
            if (!disposed)
                await refreshActive(activeGeneration);
        }
    };
    const setSetting = async (key, value) => {
        if (disposed)
            return;
        const operation = ++settingOperation;
        pendingSettings.set(key, { operation, value });
        update((draft) => {
            draft.settings = { ...draft.settings, [key]: value };
            draft.settingsSaveStatus = 'saving';
            draft.settingsSaveMessage = '正在保存…';
        });
        try {
            if (value === undefined)
                await track(remoteOperations, settingsScope.unset(key));
            else
                await track(remoteOperations, settingsScope.set(key, value));
            if (pendingSettings.get(key)?.operation !== operation || disposed)
                return;
            pendingSettings.delete(key);
            const authoritative = settingsScope.getSnapshot().value ?? DEFAULT_CITECITER_SETTINGS;
            update((draft) => {
                draft.settings = settingsWithPending(authoritative);
                draft.settingsSaveStatus = pendingSettings.size === 0 ? 'saved' : 'saving';
                draft.settingsSaveMessage = pendingSettings.size === 0 ? '已保存' : '正在保存…';
            });
        }
        catch (error) {
            if (pendingSettings.get(key)?.operation !== operation || disposed)
                return;
            pendingSettings.delete(key);
            const restored = settingsScope.getSnapshot().value ?? DEFAULT_CITECITER_SETTINGS;
            update((draft) => {
                draft.settings = settingsWithPending(restored);
                draft.settingsSaveStatus = 'error';
                draft.settingsSaveMessage = `保存失败，已恢复：${error instanceof Error ? error.message : String(error)}`;
            });
        }
    };
    return {
        getSnapshot: store.getSnapshot,
        subscribe: store.subscribe,
        setSource,
        retainVisible,
        create: (selection, question, mode, scenario) => admit(undefined, () => create(selection, question, mode, scenario)),
        createFree: (question, scenario) => admit(false, () => createFree(question, scenario)),
        createFromDocument: (claim, question) => admit(undefined, () => createFromDocument(claim, question)),
        openTopic: (sessionId) => admit(undefined, () => openTopic(sessionId, ++activeGeneration)),
        ask: (question) => admit(false, () => ask(question)),
        answerQuestion: (key, answer) => admit(undefined, () => answerQuestion(key, answer)),
        cancelQuestion: (key) => admit(undefined, () => cancelQuestion(key)),
        stop: () => admit(undefined, stop),
        rename: (title) => admit(false, () => rename(title)),
        archive: (archived) => admit(false, () => archive(archived)),
        deleteTopic: (confirmSessionId) => admit(false, () => deleteTopic(confirmSessionId)),
        dismissError,
        setIncludeArchived: (include) => {
            if (disposed)
                return;
            activeGeneration++;
            update((draft) => {
                draft.includeArchived = include;
                draft.active = null;
                draft.topics = [];
                draft.topicsStatus = 'loading';
                draft.topicsError = null;
                draft.phase = 'idle';
                draft.deleting = false;
                draft.notice = null;
            });
            void refreshTopics(true);
        },
        setModelRoute: (provider, model) => admit(undefined, () => setModelRoute(provider, model)),
        setReasoningEffort: (effort) => admit(undefined, () => setReasoningEffort(effort)),
        setSetting: (key, value) => admit(undefined, () => setSetting(key, value)),
        dispose: async () => {
            if (disposed)
                return;
            disposed = true;
            visibleConsumers = 0;
            visible = false;
            sourceGeneration++;
            activeGeneration++;
            topicsRefreshAgain = false;
            if (pollTimer !== null)
                clearTimeout(pollTimer);
            pollTimer = null;
            unsubscribeSettings();
            lifecycle.abort(new DOMException('CiteCiter is shutting down', 'AbortError'));
            while (operations.size > 0 || remoteOperations.size > 0 || topicsRefresh !== null) {
                await Promise.allSettled([
                    ...operations,
                    ...remoteOperations,
                    ...(topicsRefresh === null ? [] : [topicsRefresh]),
                ]);
            }
        },
    };
}

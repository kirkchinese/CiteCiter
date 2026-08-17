import { readAssistantAnswer } from "./answer.js";
import { buildPrompt } from "./prompt.js";
/**
 * Bind the explanation state machine to a supplied snapshot store.
 *
 * A parent or anchor change detaches the old child and forks a correctly scoped
 * one. Work is serialized so repeated selections cannot create parallel children, and disposal
 * invalidates every in-flight await before it can install another subscription.
 *
 * @param sessions - DSH browser session service.
 * @param store - plugin-owned observable state store.
 * @returns observable explainer state and lifecycle actions.
 */
export function createExplainerController(sessions, store) {
    let child = null;
    let parentId = null;
    let forkSeq = null;
    let unsubscribeChild = null;
    let disposed = false;
    let epoch = 0;
    let startQueue = Promise.resolve();
    let stopQueue = Promise.resolve();
    const baselineAssistantKeys = new Set();
    const update = (mutator) => {
        if (!disposed)
            store.update(mutator);
    };
    const fail = (error) => {
        update((draft) => {
            draft.phase = 'error';
            draft.error = error instanceof Error ? error.message : String(error);
        });
    };
    const isActive = (operationEpoch) => !disposed && operationEpoch === epoch;
    const detachChild = () => {
        epoch++;
        unsubscribeChild?.();
        unsubscribeChild = null;
        child = null;
        parentId = null;
        forkSeq = null;
        baselineAssistantKeys.clear();
    };
    const updateFromChild = () => {
        const session = child;
        if (session === null || disposed)
            return;
        const snapshot = session.getSnapshot();
        let answer = null;
        for (const node of snapshot.chat.nodes.values()) {
            if (node.kind !== 'assistant-step' || baselineAssistantKeys.has(node.key))
                continue;
            const candidate = readAssistantAnswer(node.data);
            if (candidate !== null && (answer === null || node.anchorSeq >= answer.anchorSeq)) {
                answer = { ...candidate, anchorSeq: node.anchorSeq };
            }
        }
        if (answer !== null) {
            update((draft) => {
                draft.phase = answer.status === 'running' ? 'running' : 'settled';
                draft.answerText = answer.text;
                draft.error = null;
            });
            return;
        }
        if (snapshot.promptError !== null) {
            fail(snapshot.promptError.error.message);
            return;
        }
        if (snapshot.lastAgentError !== null) {
            fail(snapshot.lastAgentError);
            return;
        }
        if (snapshot.running) {
            update((draft) => {
                draft.phase = 'running';
            });
        }
    };
    const rememberAssistantKeys = (session) => {
        for (const node of session.getSnapshot().chat.nodes.values()) {
            if (node.kind === 'assistant-step')
                baselineAssistantKeys.add(node.key);
        }
    };
    const attachChild = (session, sourceId, atSeq) => {
        child = session;
        parentId = sourceId;
        forkSeq = atSeq;
        baselineAssistantKeys.clear();
        rememberAssistantKeys(session);
        unsubscribeChild = session.subscribe(updateFromChild);
    };
    const prompt = async (selection, operationEpoch) => {
        const session = child;
        if (session === null || !isActive(operationEpoch))
            return;
        rememberAssistantKeys(session);
        update((draft) => {
            draft.phase = 'running';
            draft.selection = selection;
            draft.answerText = null;
            draft.error = null;
        });
        let result;
        try {
            result = await session.prompt([{
                    type: 'text',
                    text: buildPrompt(selection),
                }], 'queue');
        }
        catch (error) {
            if (isActive(operationEpoch))
                fail(error);
            return;
        }
        if (!isActive(operationEpoch))
            return;
        if (!result.ok) {
            fail(result.error.message);
            return;
        }
        updateFromChild();
    };
    const runStart = async (selection) => {
        if (disposed)
            return;
        const current = sessions.list.getSnapshot().current;
        if (current === undefined) {
            fail('no current session');
            return;
        }
        update((draft) => {
            draft.selection = selection;
            draft.error = null;
        });
        const sourceBinding = sessions.binding(current);
        if (sourceBinding === undefined) {
            fail(`current session "${current}" is not locally addressable`);
            return;
        }
        const sourceNode = sourceBinding.session.getSnapshot().chat.nodes.get(selection.anchorKey);
        if (sourceNode === undefined || sourceNode.kind !== 'assistant-step') {
            fail('selected assistant context is no longer available');
            return;
        }
        const sourceAnswer = readAssistantAnswer(sourceNode.data);
        if (sourceAnswer === null || sourceAnswer.status === 'running') {
            fail('selected assistant response is not complete');
            return;
        }
        if (sourceNode.location.kind !== 'step' || sourceNode.location.turn.status !== 'closed') {
            fail('selected assistant turn is not complete');
            return;
        }
        const atSeq = sourceNode.anchorSeq;
        if (child !== null && parentId === current && forkSeq === atSeq) {
            await prompt(selection, epoch);
            return;
        }
        if (child !== null) {
            detachChild();
            update((draft) => {
                draft.phase = 'idle';
                draft.childId = null;
                draft.answerText = null;
            });
        }
        update((draft) => {
            draft.phase = 'creating';
        });
        const operationEpoch = epoch;
        let childId;
        try {
            childId = await sessions.fork({ sessionId: current, atSeq });
        }
        catch (error) {
            if (isActive(operationEpoch))
                fail(error);
            return;
        }
        if (!isActive(operationEpoch))
            return;
        const binding = sessions.binding(childId);
        if (binding === undefined) {
            fail(`fork child "${childId}" is not locally addressable`);
            return;
        }
        const session = binding.session;
        try {
            await session.open();
        }
        catch (error) {
            if (isActive(operationEpoch))
                fail(error);
            return;
        }
        if (!isActive(operationEpoch))
            return;
        attachChild(session, current, atSeq);
        update((draft) => {
            draft.childId = childId;
            draft.phase = 'ready';
        });
        let permission;
        try {
            permission = await session.command('/permission read-only');
        }
        catch (error) {
            if (isActive(operationEpoch))
                fail(error);
            return;
        }
        if (!isActive(operationEpoch))
            return;
        if (!permission.ok) {
            fail(`read-only switch failed: ${permission.error.message}`);
            return;
        }
        if (!permission.value.matched) {
            fail('read-only switch failed: permission command was not recognized');
            return;
        }
        await prompt(selection, operationEpoch);
    };
    const start = (selection) => {
        if (disposed)
            return Promise.resolve();
        const task = startQueue.then(async () => {
            try {
                await runStart(selection);
            }
            catch (error) {
                fail(error);
            }
        });
        startQueue = task;
        return task;
    };
    const runStop = async () => {
        const session = child;
        const operationEpoch = epoch;
        if (session === null || !isActive(operationEpoch))
            return;
        try {
            const result = await session.cancel();
            if (!isActive(operationEpoch))
                return;
            if (!result.ok) {
                fail(result.error.message);
                return;
            }
        }
        catch (error) {
            if (isActive(operationEpoch))
                fail(error);
            return;
        }
        update((draft) => {
            draft.phase = 'ready';
        });
    };
    const stop = () => {
        if (disposed)
            return Promise.resolve();
        const task = stopQueue.then(async () => {
            try {
                await runStop();
            }
            catch (error) {
                fail(error);
            }
        });
        stopQueue = task;
        return task;
    };
    const dispose = async () => {
        if (!disposed) {
            detachChild();
            disposed = true;
        }
        await Promise.all([startQueue, stopQueue]);
    };
    return {
        getSnapshot: store.getSnapshot,
        subscribe: store.subscribe,
        start,
        stop,
        dispose,
    };
}

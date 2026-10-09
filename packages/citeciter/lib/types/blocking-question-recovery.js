import { z } from 'zod';
import { questionKey } from "./topic-questions.js";
import { toolCallRecord, toolResultRecord } from "./tool-events.js";
import { questionDraftLogStatus } from "./question-draft-lifecycle.js";
const argumentsSchema = z.object({ questions: z.array(z.object({
        id: z.string().min(1), question: z.string(), header: z.string().optional(),
        options: z.array(z.object({ label: z.string(), description: z.string().optional() }).loose()).optional(),
        multi_select: z.boolean().optional(),
    }).loose()).min(1) }).loose();
/**
 * Prove that an unfinished PTC child belongs to the exact run_code invocation
 * repaired by DSH after a crash. Every parent link must be logged in the same
 * turn; an ordinary parent failure, settled child or unrelated repair is not proof.
 * @param events - only the owning Topic's post-seed events, in append order.
 */
export function hasInterruptedPtcParent(callId, events) {
    const starts = events.flatMap((event, index) => event.type === 'tool/ptc-dispatch-start' && event.data.subCallId === callId ? [{ event, index }] : []);
    if (starts.length !== 1)
        return false;
    const child = starts[0];
    const turnStart = events.slice(0, child.index).findLast(event => event.type === 'turn/start');
    if (turnStart?.type !== 'turn/start')
        return false;
    const turn = turnStart.data.turn;
    const turnEnd = events.findIndex((event, index) => index > child.index && event.type === 'turn/end' && event.data.turn === turn);
    const ended = events[turnEnd];
    if (ended?.type !== 'turn/end' || ended.data.reason.kind !== 'interrupted')
        return false;
    const rootId = child.event.data.rootCallId;
    const rootCalls = events.flatMap((event, index) => event.type === 'tool/call' && event.data.callId === rootId ? [{ event, index }] : []);
    if (rootCalls.length !== 1)
        return false;
    const root = rootCalls[0];
    if (root.event.data.name !== 'run_code' || root.event.data.turn !== turn || root.index >= child.index)
        return false;
    const ancestors = new Set();
    let parentId = String(child.event.data.parentCallId);
    let before = child.index;
    while (parentId !== rootId) {
        if (parentId === callId || ancestors.has(parentId))
            return false;
        ancestors.add(parentId);
        const parents = events.flatMap((event, index) => event.type === 'tool/ptc-dispatch-start' && event.data.subCallId === parentId ? [{ event, index }] : []);
        if (parents.length !== 1)
            return false;
        const parent = parents[0];
        if (parent.index <= root.index || parent.index >= before || parent.event.data.rootCallId !== rootId || parent.event.data.name !== 'run_code')
            return false;
        before = parent.index;
        parentId = String(parent.event.data.parentCallId);
    }
    ancestors.add(rootId);
    let repaired = false;
    for (let index = root.index + 1; index < turnEnd; index++) {
        const event = events[index];
        if (event.type === 'turn/start')
            return false;
        const result = toolResultRecord(event);
        if (result?.callId === callId)
            return false;
        if (result === undefined || !ancestors.has(result.callId))
            continue;
        if (repaired || event.type !== 'tool/result' || result.callId !== rootId || event.data.turn !== turn
            || event.data.error?.code !== 'TOOL_OUTCOME_UNKNOWN' || index <= child.index)
            return false;
        repaired = true;
    }
    return repaired;
}
/** An absent live card alone is never evidence of interruption. */
function interrupted(callId, events) {
    let turn;
    let callTurn;
    let aborted = false;
    for (const event of events) {
        if (event.type === 'turn/start')
            turn = event.data.turn;
        if (toolCallRecord(event)?.callId === callId)
            callTurn = turn;
        if (toolResultRecord(event)?.callId === callId) {
            const error = event.type === 'tool/result' || event.type === 'tool/ptc-dispatch' ? event.data.error : undefined;
            if (error?.code === 'TOOL_OUTCOME_UNKNOWN')
                return true;
            if (error?.code === 'ASK_ABORTED')
                aborted = true;
        }
        if (aborted && event.type === 'turn/end' && event.data.turn === callTurn) {
            const reason = event.data.reason;
            if (reason.kind === 'interrupted' || (reason.kind === 'aborted' && reason.reason.kind === 'disposed'))
                return true;
        }
    }
    return hasInterruptedPtcParent(callId, events);
}
/**
 * Recover only a Host-identified blocking draft and its exact committed ask.
 * Missing/invalid logs never fabricate a question; cancellation and accepted
 * replies remain closed. The returned card can submit only on a user's action.
 */
export function recoverBlockingQuestion(sessionId, record, events, inheritedEventCount) {
    if (record.blocking !== true || record.closed || questionDraftLogStatus(sessionId, record.key, events, inheritedEventCount, true) !== 'open')
        return undefined;
    const call = events.slice(inheritedEventCount).map(toolCallRecord).find(value => value?.name === 'ask_user_question' && questionKey(sessionId, value.callId) === record.key);
    if (call === undefined || !interrupted(call.callId, events.slice(inheritedEventCount)))
        return undefined;
    let value;
    try {
        value = JSON.parse(call.arguments);
    }
    catch {
        return undefined;
    } // Damaged arguments cannot safely become an answerable card.
    const parsed = argumentsSchema.safeParse(value);
    if (!parsed.success || new Set(parsed.data.questions.map(question => question.id)).size !== parsed.data.questions.length)
        return undefined;
    return { key: record.key, callId: call.callId, state: 'continued', blocking: true,
        questions: parsed.data.questions.map(question => ({
            id: question.id, question: question.question,
            ...(question.header === undefined ? {} : { header: question.header }),
            ...(question.options === undefined ? {} : { options: question.options.map(option => ({ label: option.label, ...(option.description === undefined ? {} : { description: option.description }) })) }),
            ...(question.multi_select === undefined ? {} : { multiSelect: question.multi_select }),
        })),
    };
}

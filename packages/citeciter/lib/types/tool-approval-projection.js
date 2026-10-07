import { toolCallRecord, toolResultRecord } from "./tool-events.js";
function record(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? value : undefined;
}
function identifier(value) {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}
/**
 * Identify failed tools whose one exact approval request was explicitly rejected.
 * @param events - ordered events from one private Topic, excluding its inherited seed.
 * @returns call IDs with an unambiguous call → ask → rejection → failed-result chain.
 * This is presentation only: original results and permission decisions remain unchanged.
 * Missing identities, duplicate calls/results/approval IDs, multiple approvals, unknown
 * outcomes and successful results produce no verdict. PTC children retain their own IDs.
 */
export function projectRejectedToolApprovals(events) {
    const calls = new Map();
    const results = new Map();
    const asks = new Map();
    const askCounts = new Map();
    const decisions = new Map();
    for (const event of events) {
        const call = toolCallRecord(event);
        if (call !== undefined) {
            const previous = calls.get(call.callId);
            if (previous !== undefined)
                previous.duplicate = true;
            else
                calls.set(call.callId, { name: call.name, seq: event.seq, duplicate: false });
            continue;
        }
        const result = toolResultRecord(event);
        if (result !== undefined) {
            const previous = results.get(result.callId);
            if (previous !== undefined)
                previous.duplicate = true;
            else
                results.set(result.callId, { seq: event.seq, isError: result.isError, duplicate: false });
            continue;
        }
        // Approval audit events are optional Host contributions. Read only their public
        // identity/decision fields; no service discovery or human-readable error matching.
        const type = event.type;
        if (type !== 'approval/asked' && type !== 'approval/decided')
            continue;
        const data = record(event.data);
        if (data === undefined)
            continue;
        const id = identifier(data.id);
        if (type === 'approval/asked') {
            if (id !== undefined)
                askCounts.set(id, (askCounts.get(id) ?? 0) + 1);
            const callId = identifier(data.callId);
            if (callId === undefined)
                continue;
            const list = asks.get(callId) ?? [];
            list.push({ id, toolName: identifier(data.toolName), seq: event.seq });
            asks.set(callId, list);
        }
        else if (id !== undefined) {
            const list = decisions.get(id) ?? [];
            list.push({ outcome: data.outcome, seq: event.seq });
            decisions.set(id, list);
        }
    }
    const rejected = new Set();
    for (const [callId, result] of results) {
        const call = calls.get(callId);
        const requests = asks.get(callId);
        if (call === undefined || call.duplicate || result.duplicate || !result.isError || requests?.length !== 1)
            continue;
        const ask = requests[0];
        if (ask.id === undefined || ask.toolName !== call.name || askCounts.get(ask.id) !== 1)
            continue;
        const outcomes = decisions.get(ask.id);
        if (outcomes?.length !== 1)
            continue;
        const decision = outcomes[0];
        if (decision.outcome !== 'rejected' || !(call.seq < ask.seq && ask.seq < decision.seq && decision.seq < result.seq))
            continue;
        rejected.add(callId);
    }
    return rejected;
}

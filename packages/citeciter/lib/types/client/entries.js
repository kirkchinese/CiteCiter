import { dshAssistantAnchorForTarget } from "./conversation-dom.js";
import { ASSISTANT_ENTRY_ID, TOOL_ENTRY_ID } from "./entry-ids.js";
import { projectToolEvidence } from "../evidence-text.js";
import { readAssistantAnswer } from "./answer.js";
import { claimSelectionContextMenu } from "./selection.js";
/** Create an ordered client entry registry. */
export function createCiteCiterEntryRegistry() {
    const entries = [];
    return {
        register(entry) {
            entries.push(entry);
            return () => {
                const index = entries.indexOf(entry);
                if (index !== -1)
                    entries.splice(index, 1);
            };
        },
        list: () => [...entries],
        claim(event, context) {
            for (const entry of entries) {
                const selection = entry.claim(event, context);
                if (selection !== null)
                    return { entry, selection };
            }
            return null;
        },
    };
}
/**
 * Built-in assistant answer entry: resolves a selection inside a committed
 * `assistant-step` flow, including collapsed reasoning disclosure rows.
 * @returns the entry contribution; register it on the shared registry.
 */
export function createAssistantEntry() {
    return {
        id: ASSISTANT_ENTRY_ID,
        claim(event, { sessions, sourceSessionId }) {
            const anchor = dshAssistantAnchorForTarget(event.target);
            if (anchor === null)
                return null;
            const node = sessions.binding(sourceSessionId)?.session.getSnapshot().chat.nodes.get(anchor.anchorKey);
            const answer = node?.kind === 'assistant-step' ? readAssistantAnswer(node.data) : null;
            return claimSelectionContextMenu(event, sourceSessionId, answer?.text);
        },
    };
}
/** Classify the projection a tool-card pointer event asks for. */
function toolProjectionForTarget(target) {
    if (target.closest('[data-terminal]') !== null)
        return 'terminal';
    if (target.closest('[data-diff]') !== null)
        return 'diff';
    return 'result-text';
}
/**
 * Built-in tool evidence entry: claims a whole-card tool result from its
 * `call:<callId>` row and the enclosing `tool-call` chat flow. Terminal and
 * diff cards select their dedicated projections; everything else is
 * `result-text`.
 * @returns the entry contribution; register it after the assistant entry.
 */
export function createToolEvidenceEntry() {
    return {
        id: TOOL_ENTRY_ID,
        claim(event, { sessions, sourceSessionId }) {
            const target = event.target;
            if (target === null || typeof target !== 'object' || typeof target.closest !== 'function') {
                return null;
            }
            const closest = target.closest.bind(target);
            const callRow = closest('[data-chat-call-id]');
            if (callRow === null)
                return null;
            const flowElement = closest('[data-chat-flow-kind]');
            if (flowElement === null || flowElement.dataset.chatFlowKind !== 'tool-call')
                return null;
            const anchorKey = flowElement.dataset.chatAnchorKey;
            if (anchorKey === undefined || anchorKey === '')
                return null;
            const node = sessions.binding(sourceSessionId)?.session.getSnapshot().chat.nodes.get(anchorKey);
            if (node === undefined || node.kind !== 'tool-call')
                return null;
            const root = node.data.root;
            if (root === null || typeof root !== 'object')
                return null;
            const settled = root;
            const callId = callRow.dataset.chatCallId;
            if (settled.kind !== 'tool-result' || callId === undefined || callId === '' || settled.callId !== callId)
                return null;
            const projection = toolProjectionForTarget(target);
            const text = projectToolEvidence(projection, settled.content ?? [], settled.meta);
            if (text === null || text.trim() === '')
                return null;
            event.preventDefault();
            const selection = {
                entryId: TOOL_ENTRY_ID,
                kind: 'tool-result',
                sourceSessionId,
                callId,
                projection,
                displayText: text.trim(),
                anchorKey,
                x: event.clientX,
                y: event.clientY,
            };
            return selection;
        },
    };
}

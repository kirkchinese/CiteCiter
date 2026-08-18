import { createHash } from 'node:crypto';
import { canonicalCitationIdentity } from "./thread.js";
function sha256(text) {
    return createHash('sha256').update(text).digest('hex');
}
/** Validate browser evidence against immutable fork lineage and log boundaries. */
export function validateCitation(agent, citation) {
    const parent = agent.session.header.parentSession;
    if (parent === undefined || parent !== citation.sourceSessionId) {
        throw new Error('Citation source does not match the child session fork lineage');
    }
    const seedLength = agent.session.header.seedLength;
    if (seedLength === undefined || citation.anchorSeq >= seedLength) {
        throw new Error('Citation anchor is outside the inherited fork prefix');
    }
    const anchor = agent.session.events.find((event) => event.seq === citation.anchorSeq);
    if (anchor?.type !== 'assistant/message') {
        throw new Error('Citation anchor is not a finalized assistant message');
    }
    const inheritedTail = agent.session.events.slice(citation.anchorSeq + 1, seedLength);
    const completedStep = inheritedTail.some((event) => (event.type === 'step/end'
        && event.data.turn === anchor.data.turn
        && event.data.step === anchor.data.step));
    const completedTurn = inheritedTail.some((event) => (event.type === 'turn/end' && event.data.turn === anchor.data.turn));
    if (!completedStep || !completedTurn) {
        throw new Error('Citation anchor does not belong to a completed inherited turn');
    }
    if (citation.endOffset <= citation.startOffset
        || citation.endOffset - citation.startOffset !== citation.selectedText.length) {
        throw new Error('Citation selection offsets are invalid');
    }
    const expected = sha256(canonicalCitationIdentity(citation));
    if (expected !== citation.selectionFingerprint) {
        throw new Error('Citation selection fingerprint does not match its evidence');
    }
}

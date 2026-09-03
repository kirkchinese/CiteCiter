/** Pure Observer citation validation and source-session evidence formatting. */
/** Shared tool-evidence projections also consumed by the browser entry layer. */
import { createHash } from 'node:crypto';
import { projectToolEvidence } from "./evidence-text.js";
export { projectDiffMeta, projectToolEvidence, projectToolResultText, } from "./evidence-text.js";
import { snapshotJsonValue, } from '@deepseek-ai/dsh-session';
import { canonicalCitationIdentity, citationDraftSchema, citationSelectionClaimSchema, documentEvidenceClaimSchema, toolEvidenceClaimSchema, } from "./topic.js";
import { projectCitableAssistantContent } from "./assistant-content.js";
import { resolveCitationRange, } from "./citation-mapping.js";
function messageText(content) {
    return content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('');
}
function assistantReasoning(content) {
    return content
        .filter((block) => block.type === 'reasoning')
        .map((block) => block.text)
        .join('');
}
function evidence(value) {
    const snapshot = snapshotJsonValue(value);
    if (snapshot === undefined)
        throw new Error('source Session evidence is not lossless JSON');
    return snapshot;
}
/** Compute the SHA-256 identity carried by the current CitationDraft schema. */
export function fingerprintCitationDraft(draft) {
    return createHash('sha256').update(canonicalCitationIdentity(draft)).digest('hex');
}
/** Compute the SHA-256 identity of a canonical v4 Citation evidence record. */
export function fingerprintCitationRecord(record) {
    return createHash('sha256').update(canonicalCitationIdentity(record)).digest('hex');
}
function committedAssistantText(source, sourceSessionId, anchorSeq) {
    if (sourceSessionId !== source.session.id) {
        throw new Error('Citation sourceSessionId does not match the observed source Session');
    }
    const anchor = source.events.find((event) => event.seq === anchorSeq);
    if (anchor?.type !== 'assistant/message') {
        throw new Error('Citation anchorSeq does not identify a committed assistant/message');
    }
    const citable = projectCitableAssistantContent(anchor.data.message.content);
    const answer = messageText(anchor.data.message.content);
    const projections = citable === answer ? [citable] : [citable, answer].filter((text) => text !== '');
    if (projections[0]?.trim() === '')
        throw new Error('Citation assistant/message has no citable text');
    return { seq: anchor.seq, projections };
}
function resolveProjectedRange(selection, projections) {
    let failure;
    for (const text of projections) {
        try {
            return { range: resolveCitationRange(selection, text), text };
        }
        catch (error) {
            failure ??= error;
        }
    }
    throw failure;
}
/** Resolve a browser selection claim against the authoritative committed assistant message. */
export function resolveObserverCitation(source, rawClaim) {
    const claim = citationSelectionClaimSchema.parse(rawClaim);
    const anchor = committedAssistantText(source, claim.sourceSessionId, claim.anchorSeq);
    const selection = {
        displayText: claim.displayText,
        ...(claim.sourceHintText === undefined ? {} : { sourceHintText: claim.sourceHintText }),
        prefixText: claim.prefixText,
        suffixText: claim.suffixText,
    };
    const { range, text } = resolveProjectedRange(selection, anchor.projections);
    const identity = {
        sourceSessionId: claim.sourceSessionId,
        anchorSeq: anchor.seq,
        ...range,
        displayText: claim.displayText,
    };
    const selectionFingerprint = fingerprintCitationDraft(identity);
    return {
        citation: { ...identity, selectionFingerprint },
        assistantMessageSeq: anchor.seq,
        assistantVisibleText: text,
        contentFingerprint: selectionFingerprint,
    };
}
/**
 * Validate one Citation against committed reasoning or answer text in the observed source snapshot.
 * A matching `assistant/message` is sufficient; its step and turn may remain open.
 */
export function validateObserverCitation(source, rawDraft) {
    const citation = citationDraftSchema.parse(rawDraft);
    const anchor = committedAssistantText(source, citation.sourceSessionId, citation.anchorSeq);
    const offsetText = anchor.projections.find((text) => (citation.endOffset > citation.startOffset
        && citation.endOffset <= text.length
        && citation.endOffset - citation.startOffset === citation.sourceText.length
        && text.slice(citation.startOffset, citation.endOffset) === citation.sourceText));
    if (offsetText === undefined) {
        throw new Error('Citation UTF-16 offsets and sourceText do not match the assistant/message');
    }
    const visibleText = anchor.projections.find((text) => (citation.endOffset > citation.startOffset
        && citation.endOffset <= text.length
        && citation.endOffset - citation.startOffset === citation.sourceText.length
        && text.slice(citation.startOffset, citation.endOffset) === citation.sourceText
        && text.slice(Math.max(0, citation.startOffset - citation.prefixText.length), citation.startOffset) === citation.prefixText
        && text.slice(citation.endOffset, citation.endOffset + citation.suffixText.length) === citation.suffixText));
    if (visibleText === undefined) {
        throw new Error('Citation surrounding context does not match the assistant/message');
    }
    const expectedFingerprint = fingerprintCitationDraft(citation);
    if (citation.selectionFingerprint !== expectedFingerprint) {
        throw new Error('Citation content fingerprint does not match its evidence');
    }
    return {
        citation,
        assistantMessageSeq: anchor.seq,
        assistantVisibleText: visibleText,
        contentFingerprint: expectedFingerprint,
    };
}
/**
 * Resolve a whole-card tool-result claim against the committed `tool/result`.
 * @param source - one atomic live-preferred SessionQuery observation.
 * @param rawClaim - browser-submitted tool result identity, projection, and visible quote.
 * @returns verified evidence with the full committed projection text.
 */
export function resolveToolEvidence(source, rawClaim) {
    const claim = toolEvidenceClaimSchema.parse(rawClaim);
    if (source.session.id !== claim.sourceSessionId) {
        throw new Error('Citation toolClaim sourceSessionId does not match the observed source Session');
    }
    const resultEvent = source.events.find((event) => (event.type === 'tool/result'
        && event.data.message.content[0]?.toolCallId === claim.callId));
    if (resultEvent?.type !== 'tool/result') {
        throw new Error('Citation toolClaim does not identify a committed tool/result');
    }
    const callEvent = source.events.find((event) => (event.type === 'tool/call' && event.data.callId === claim.callId));
    if (callEvent?.type !== 'tool/call') {
        throw new Error('Citation toolClaim has no committed tool/call in the source Session');
    }
    const result = resultEvent.data.message.content[0];
    if (result === undefined || result.type !== 'tool-result') {
        throw new Error('Citation tool/result has no result content');
    }
    const projection = claim.projection ?? 'result-text';
    const sourceText = projectToolEvidence(projection, result.content, resultEvent.data.meta);
    if (sourceText === null) {
        throw new Error(`Citation tool result has no citable ${projection} projection`);
    }
    if (sourceText.trim() === '')
        throw new Error('Citation tool result has no citable text');
    if (claim.displayText.trim() !== sourceText.trim()) {
        throw new Error('Citation toolClaim displayText does not match the committed tool result text');
    }
    return {
        evidence: {
            sourceSessionId: claim.sourceSessionId,
            anchorSeq: resultEvent.seq,
            entry: {
                kind: 'tool-result',
                anchorSeq: resultEvent.seq,
                callId: claim.callId,
                toolName: callEvent.data.name,
                projection,
            },
            startOffset: 0,
            endOffset: sourceText.length,
            sourceText,
            displayText: claim.displayText,
            prefixText: '',
            suffixText: '',
        },
    };
}
/**
 * Re-resolve a Reader selection against the authoritative stored document text.
 * @param content - complete normalized document text.
 * @param rawClaim - browser-submitted document identity and visible quote context.
 * @returns verified evidence with document offsets in its entry.
 */
export function resolveDocumentEvidence(content, rawClaim) {
    const claim = documentEvidenceClaimSchema.parse(rawClaim);
    const range = resolveCitationRange(claim, content);
    return {
        evidence: {
            sourceSessionId: claim.sourceSessionId,
            anchorSeq: 0,
            entry: {
                kind: 'document-range',
                documentId: claim.documentId,
                startOffset: range.startOffset,
                endOffset: range.endOffset,
            },
            startOffset: 0,
            endOffset: range.sourceText.length,
            sourceText: range.sourceText,
            displayText: claim.displayText,
            prefixText: range.prefixText,
            suffixText: range.suffixText,
        },
    };
}
function formatEvidenceEvent(event, includeReasoning) {
    switch (event.type) {
        case 'turn/start':
            return evidence({ type: event.type, seq: event.seq, turn: event.data.turn });
        case 'turn/end':
            return evidence({ type: event.type, seq: event.seq, turn: event.data.turn, reason: event.data.reason });
        case 'step/start':
        case 'step/end':
            return evidence({
                type: event.type,
                seq: event.seq,
                turn: event.data.turn,
                step: event.data.step,
            });
        case 'user/message':
            return event.data.source.kind === 'user'
                ? evidence({ type: event.type, seq: event.seq, text: messageText(event.data.content) })
                : null;
        case 'assistant/message': {
            const text = messageText(event.data.message.content);
            const reasoning = includeReasoning ? assistantReasoning(event.data.message.content) : '';
            return evidence({
                type: event.type,
                seq: event.seq,
                turn: event.data.turn,
                step: event.data.step,
                text,
                ...(reasoning === '' ? {} : { reasoning }),
            });
        }
        case 'tool/call':
            return evidence({
                type: event.type,
                seq: event.seq,
                turn: event.data.turn,
                step: event.data.step,
                callId: event.data.callId,
                name: event.data.name,
                arguments: event.data.arguments,
            });
        case 'tool/result': {
            const result = event.data.message.content[0];
            return evidence({
                type: event.type,
                seq: event.seq,
                turn: event.data.turn,
                step: event.data.step,
                callId: result.toolCallId,
                content: result.content,
                isError: result.isError ?? false,
                ...(event.data.error === undefined ? {} : { error: event.data.error }),
                ...(event.data.meta === undefined ? {} : { meta: event.data.meta }),
            });
        }
        // Chunks and unrelated log state are intentionally absent from model evidence.
        default:
            return null;
    }
}
/** Format one seq range without exposing chunks or exceeding the event-array byte budget. */
export function formatSourceSessionRead(source, options) {
    const fromSeq = options.fromSeq ?? 0;
    if (!Number.isSafeInteger(fromSeq) || fromSeq < 0)
        throw new Error('fromSeq must be a non-negative safe integer');
    if (options.throughSeq !== undefined
        && (!Number.isSafeInteger(options.throughSeq) || options.throughSeq < fromSeq))
        throw new Error('throughSeq must be a safe integer greater than or equal to fromSeq');
    if (!Number.isSafeInteger(options.maxBytes) || options.maxBytes < 2) {
        throw new Error('maxBytes must be a safe integer of at least 2');
    }
    let availableThroughSeq = null;
    for (const event of source.events) {
        if (options.throughSeq !== undefined && event.seq > options.throughSeq)
            break;
        availableThroughSeq = event.seq;
    }
    const events = [];
    let bytesUsed = 2; // JSON array brackets.
    let capturedThroughSeq = null;
    let truncated = false;
    for (let index = 0; index < source.events.length; index += 1) {
        const event = source.events[index];
        if (event === undefined)
            continue;
        if (event.seq < fromSeq)
            continue;
        if (options.throughSeq !== undefined && event.seq > options.throughSeq)
            break;
        const formatted = formatEvidenceEvent(event, options.includeReasoning);
        if (formatted === null) {
            capturedThroughSeq = event.seq;
            continue;
        }
        const serializedBytes = Buffer.byteLength(JSON.stringify(formatted), 'utf8');
        const eventBytes = serializedBytes + (events.length === 0 ? 0 : 1);
        if (bytesUsed + eventBytes > options.maxBytes) {
            if (serializedBytes <= options.maxBytes - 2) {
                truncated = true;
                break;
            }
            const placeholder = evidence({
                type: event.type,
                seq: event.seq,
                oversized: true,
            });
            const serializedPlaceholderBytes = Buffer.byteLength(JSON.stringify(placeholder), 'utf8');
            const placeholderBytes = serializedPlaceholderBytes + (events.length === 0 ? 0 : 1);
            if (bytesUsed + placeholderBytes > options.maxBytes) {
                if (serializedPlaceholderBytes <= options.maxBytes - 2) {
                    truncated = true;
                    break;
                }
                capturedThroughSeq = event.seq;
                truncated = true;
                break;
            }
            events.push(placeholder);
            bytesUsed += placeholderBytes;
            capturedThroughSeq = event.seq;
            continue;
        }
        events.push(formatted);
        bytesUsed += eventBytes;
        capturedThroughSeq = event.seq;
    }
    return {
        sourceSessionId: source.session.id,
        requestedFromSeq: fromSeq,
        requestedThroughSeq: options.throughSeq ?? null,
        capturedThroughSeq,
        availableThroughSeq,
        truncated,
        bytesUsed,
        events,
    };
}

export { projectDiffMeta, projectToolEvidence, projectToolResultText, type ToolEvidenceProjection, } from './evidence-text.ts';
import { type JsonValue, type SessionEvent, type SessionHeader } from '@deepseek-ai/dsh-session';
import { type CitationEvidence, type CitationSelectionClaim, type CitationDraft, type DocumentEvidenceClaim, type ToolEvidenceClaim } from './topic.ts';
/** One atomic live-preferred SessionQuery observation. */
export interface ObserverSourceSnapshot {
    readonly session: Pick<SessionHeader, 'id' | 'cwd'>;
    readonly events: readonly SessionEvent[];
}
/** Authoritative facts resolved for a browser-submitted Citation. */
export interface ValidatedObserverCitation {
    readonly citation: CitationDraft;
    readonly assistantMessageSeq: number;
    readonly assistantVisibleText: string;
    readonly contentFingerprint: string;
}
/** One Host-verified tool-result evidence resolved from a browser claim. */
export interface ValidatedToolEvidence {
    readonly evidence: CitationEvidence;
}
/** One Host-verified document-range evidence resolved against the stored text. */
export interface ValidatedDocumentEvidence {
    readonly evidence: CitationEvidence;
}
/** Options for one bounded `read_source_session` result. */
export interface SourceReadOptions {
    readonly fromSeq?: number;
    readonly throughSeq?: number;
    readonly includeReasoning: boolean;
    /** Maximum UTF-8 bytes occupied by the serialized `events` array. */
    readonly maxBytes: number;
}
/** One lossless-JSON evidence record emitted by `read_source_session`. */
export type SourceEvidenceEvent = JsonValue;
/** Complete bounded source-read payload recorded as the Topic tool result. */
export interface SourceReadResult {
    readonly sourceSessionId: string;
    readonly requestedFromSeq: number;
    readonly requestedThroughSeq: number | null;
    readonly capturedThroughSeq: number | null;
    readonly availableThroughSeq: number | null;
    readonly truncated: boolean;
    readonly bytesUsed: number;
    readonly events: readonly SourceEvidenceEvent[];
}
/** Compute the SHA-256 identity carried by the current CitationDraft schema. */
export declare function fingerprintCitationDraft(draft: Omit<CitationDraft, 'selectionFingerprint'>): string;
/** Compute the SHA-256 identity of a canonical v4 Citation evidence record. */
export declare function fingerprintCitationRecord(record: CitationEvidence): string;
/** Resolve a browser selection claim against the authoritative committed assistant message. */
export declare function resolveObserverCitation(source: ObserverSourceSnapshot, rawClaim: CitationSelectionClaim): ValidatedObserverCitation;
/**
 * Validate one Citation against committed reasoning or answer text in the observed source snapshot.
 * A matching `assistant/message` is sufficient; its step and turn may remain open.
 */
export declare function validateObserverCitation(source: ObserverSourceSnapshot, rawDraft: CitationDraft): ValidatedObserverCitation;
/**
 * Resolve a whole-card tool-result claim against the committed `tool/result`.
 * @param source - one atomic live-preferred SessionQuery observation.
 * @param rawClaim - browser-submitted tool result identity, projection, and visible quote.
 * @returns verified evidence with the full committed projection text.
 */
export declare function resolveToolEvidence(source: ObserverSourceSnapshot, rawClaim: ToolEvidenceClaim): ValidatedToolEvidence;
/**
 * Re-resolve a Reader selection against the authoritative stored document text.
 * @param content - complete normalized document text.
 * @param rawClaim - browser-submitted document identity and visible quote context.
 * @returns verified evidence with document offsets in its entry.
 */
export declare function resolveDocumentEvidence(content: string, rawClaim: DocumentEvidenceClaim): ValidatedDocumentEvidence;
/** Format one seq range without exposing chunks or exceeding the event-array byte budget. */
export declare function formatSourceSessionRead(source: ObserverSourceSnapshot, options: SourceReadOptions): SourceReadResult;

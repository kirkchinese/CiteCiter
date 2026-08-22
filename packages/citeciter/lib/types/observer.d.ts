import { type JsonValue, type SessionEvent, type SessionHeader } from '@deepseek-ai/dsh-session';
import { type CitationSelectionClaim, type CitationDraft } from './topic.ts';
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
/** Resolve a browser selection claim against the authoritative committed assistant message. */
export declare function resolveObserverCitation(source: ObserverSourceSnapshot, rawClaim: CitationSelectionClaim): ValidatedObserverCitation;
/**
 * Validate one Citation against a committed assistant message in the observed source snapshot.
 * A matching `assistant/message` is sufficient; its step and turn may remain open.
 */
export declare function validateObserverCitation(source: ObserverSourceSnapshot, rawDraft: CitationDraft): ValidatedObserverCitation;
/** Format one seq range without exposing chunks or exceeding the event-array byte budget. */
export declare function formatSourceSessionRead(source: ObserverSourceSnapshot, options: SourceReadOptions): SourceReadResult;

import type { ObserverSourceSnapshot } from './observer.ts';
/** How much of each tool payload a page shows. */
export type SourceTranscriptDetail = 'compact' | 'full';
/** Options for one transcript page. */
export interface SourceTranscriptOptions {
    readonly fromSeq?: number;
    readonly throughSeq?: number;
    readonly includeReasoning: boolean;
    /** Maximum UTF-8 bytes of the transcript body (the record blocks and their separators). */
    readonly maxBytes: number;
    readonly detail: SourceTranscriptDetail;
}
/** One transcript page plus the cursor facts the model needs to continue. */
export interface SourceTranscriptPage {
    readonly sourceSessionId: string;
    /** Highest sequence in the whole readable snapshot, independent of the requested range. */
    readonly sourceMaxSeq: number | null;
    readonly requestedFromSeq: number;
    readonly requestedThroughSeq: number | null;
    /** Last scanned sequence; filtered events advance it without adding records. */
    readonly capturedThroughSeq: number | null;
    /** The byte budget stopped this page within the requested range. */
    readonly truncated: boolean;
    readonly hasMore: boolean;
    readonly nextFromSeq: number | null;
    /** Number of rendered record blocks. */
    readonly records: number;
    /** Whether a tool payload or message was shortened on this page. */
    readonly shortened: boolean;
    readonly bytesUsed: number;
    /** Complete model-facing Markdown, including the cursor header and footer. */
    readonly markdown: string;
}
/** Characters kept from one tool argument, result or diff in compact detail. */
export declare const COMPACT_PAYLOAD_CHARS = 1500;
/**
 * Format one bounded Markdown page of a source Session.
 * Records are `# User`, `# Assistant`, `## Tool call` and `### Tool result` blocks, each
 * anchored by its source seq. Chunks, step markers and injected context are filtered.
 * A record that alone exceeds the page is shortened to fit rather than dropped.
 * @param source - one atomic source snapshot.
 * @param options - range, detail, reasoning preference and body byte budget.
 * @returns the page Markdown and its cursor facts.
 */
export declare function formatSourceTranscript(source: ObserverSourceSnapshot, options: SourceTranscriptOptions): SourceTranscriptPage;
/**
 * Pick the start of an automatic source window: the newest records that fit the budget,
 * or the records leading up to an anchor so a cited answer and its context come first.
 * @param source - one atomic source snapshot.
 * @param options - reasoning preference, budget and an optional anchor seq to end on.
 * @returns the first seq of the window.
 */
export declare function sourceWindowStart(source: ObserverSourceSnapshot, options: {
    readonly includeReasoning: boolean;
    readonly maxBytes: number;
    readonly endSeq?: number;
    readonly afterSeq?: number;
}): number;

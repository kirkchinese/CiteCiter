import type { SessionId } from '@deepseek-ai/dsh-session';
import { z } from 'zod';
/** Durable Citation format. Bump only with an explicit projection migration. */
export declare const CITATION_SCHEMA_VERSION: 1;
/** Session-projection key published to browser session rows. */
export declare const CITECITER_PROJECTION_KEY: "citeciter";
/** Named SystemPrompt context contribution retained in snapshot provenance. */
export declare const CITATION_CONTEXT_NAME: "@kirkchinese/dsh-citeciter:citation";
/** Named scoped system section defining the pedagogical contract. */
export declare const TUTOR_SECTION_NAME: "@kirkchinese/dsh-citeciter:tutor";
export declare const citationRecordSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    sourceSessionId: z.ZodString;
    anchorKey: z.ZodString;
    anchorSeq: z.ZodNumber;
    startOffset: z.ZodNumber;
    endOffset: z.ZodNumber;
    selectionFingerprint: z.ZodString;
    selectedText: z.ZodString;
    prefixText: z.ZodString;
    suffixText: z.ZodString;
    createdAt: z.ZodNumber;
}, z.core.$strict>;
/** Immutable, durable identity and evidence for one Citation Thread. */
export interface CitationRecord extends z.infer<typeof citationRecordSchema> {
    readonly sourceSessionId: SessionId;
}
export declare const citationThreadSchema: z.ZodObject<{
    citation: z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        sourceSessionId: z.ZodString;
        anchorKey: z.ZodString;
        anchorSeq: z.ZodNumber;
        startOffset: z.ZodNumber;
        endOffset: z.ZodNumber;
        selectionFingerprint: z.ZodString;
        selectedText: z.ZodString;
        prefixText: z.ZodString;
        suffixText: z.ZodString;
        createdAt: z.ZodNumber;
    }, z.core.$strict>;
    historyStartSeq: z.ZodNumber;
    contextSeq: z.ZodNumber;
}, z.core.$strict>;
export interface CitationThread extends z.infer<typeof citationThreadSchema> {
    readonly citation: CitationRecord;
}
export declare const citeCiterProjectionSchema: z.ZodObject<{
    thread: z.ZodNullable<z.ZodObject<{
        citation: z.ZodObject<{
            schemaVersion: z.ZodLiteral<1>;
            sourceSessionId: z.ZodString;
            anchorKey: z.ZodString;
            anchorSeq: z.ZodNumber;
            startOffset: z.ZodNumber;
            endOffset: z.ZodNumber;
            selectionFingerprint: z.ZodString;
            selectedText: z.ZodString;
            prefixText: z.ZodString;
            suffixText: z.ZodString;
            createdAt: z.ZodNumber;
        }, z.core.$strict>;
        historyStartSeq: z.ZodNumber;
        contextSeq: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
/** Whole projection value carried to list rows and live sessions. */
export interface CiteCiterProjection {
    readonly thread: CitationThread | null;
}
/** Fields whose canonical serialization defines Citation identity. */
export type CitationFingerprintInput = Omit<CitationRecord, 'schemaVersion' | 'selectionFingerprint' | 'createdAt'>;
/**
 * Serialize the exact selection identity identically in Node and the browser.
 * An array fixes field order independently of object construction order.
 */
export declare function canonicalCitationIdentity(input: CitationFingerprintInput): string;
declare const citationContextEnvelopeSchema: z.ZodObject<{
    citation: z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        sourceSessionId: z.ZodString;
        anchorKey: z.ZodString;
        anchorSeq: z.ZodNumber;
        startOffset: z.ZodNumber;
        endOffset: z.ZodNumber;
        selectionFingerprint: z.ZodString;
        selectedText: z.ZodString;
        prefixText: z.ZodString;
        suffixText: z.ZodString;
        createdAt: z.ZodNumber;
    }, z.core.$strict>;
    historyStartSeq: z.ZodNumber;
}, z.core.$strict>;
export interface CitationContextEnvelope extends z.infer<typeof citationContextEnvelopeSchema> {
    readonly citation: CitationRecord;
}
/** Render a self-delimiting context snapshot whose quote cannot escape its JSON string. */
export declare function renderCitationContext(citation: CitationRecord, historyStartSeq: number): string;
/** Parse only CiteCiter's exact runtime-context representation. */
export declare function parseCitationContext(text: string): CitationContextEnvelope | null;
/** Merge-extensible projection map exposed by the Host registry and Client runtime. */
declare module '@deepseek-ai/dsh-session-projection/types' {
    interface SessionProjectionMap {
        citeciter: CiteCiterProjection;
    }
}
export {};

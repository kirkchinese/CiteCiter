import { type SessionHeader } from '@deepseek-ai/dsh-session';
import { z } from 'zod';
import { type TopicMetadata } from './topic.ts';
export declare function errorCode(error: unknown): string | undefined;
export declare function unlinkIfPresent(path: string): Promise<void>;
export declare function rmdirIfEmpty(path: string): Promise<void>;
/**
 * Remove one artifact from a caller-owned JSONL root without following links.
 * @param root - fixed private JSONL root owned by the caller.
 * @param artifact - location returned by that exact JSONL backend.
 * @returns when the file/link and its empty per-session directory are absent.
 */
export declare function removeOwnedJsonlArtifact(root: string, artifact: {
    readonly kind: string;
    readonly path: string;
} | undefined): Promise<void>;
/**
 * Delete all JSONL generations of an already retired private Topic.
 * DSH 0.1.5 has no public delete/location API. This bounded disk adapter follows
 * its project/Session directory layout and canonical generation filenames.
 * @param root - exclusively owned CiteCiter Session root, never a host Session root.
 * @param sessionId - generated CiteCiter identity; arbitrary path segments are refused.
 * @returns after every canonical generation and the retired lock file are absent.
 */
export declare function removeOwnedTopicGenerations(root: string, sessionId: string): Promise<void>;
declare const topicDeletionMarkerSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    storage: z.ZodOptional<z.ZodLiteral<"source">>;
    sessionId: z.ZodString;
    sourceSessionId: z.ZodString;
    topicId: z.ZodNumber;
    sessionHeader: z.ZodObject<{
        version: z.ZodNumber;
        id: z.ZodString;
        createdAt: z.ZodNumber;
        isSeeded: z.ZodDefault<z.ZodBoolean>;
        cwd: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type TopicDeletionMarker = Omit<z.infer<typeof topicDeletionMarkerSchema>, 'sessionHeader'> & {
    readonly sessionHeader: SessionHeader;
};
/** Minimal on-disk navigation index; Session history stays in standard DSH JSONL. */
export declare class TopicIndex {
    private readonly root;
    private readonly sourceRoots;
    /** Bind a canonical source-owned root resolved by SourceStorage. */
    bindSource(sourceSessionId: string, root: string): void;
    /** Return the owned metadata directory for one source-backed Topic. */
    ownedDirectory(sourceSessionId: string, topicId: number): string;
    /** @param root - private Topic index root. */
    constructor(root?: string);
    /** Read navigation records across sources; never opens or mutates a Session log. */
    all(includeSuperseded?: boolean): Promise<TopicMetadata[]>;
    reserve(sourceSessionId: string): Promise<{
        topicId: number;
        directory: string;
    }>;
    save(metadata: TopicMetadata): Promise<void>;
    loadBySessionId(sessionId: string): Promise<TopicMetadata>;
    list(sourceSessionId: string): Promise<TopicMetadata[]>;
    /** Commit a minimal deletion marker before making Topic metadata unreachable. */
    markDeleting(metadata: TopicMetadata, sessionHeader: SessionHeader): Promise<TopicDeletionMarker>;
    /** Discover committed deletion markers without following linked directories. */
    listDeleting(): Promise<TopicDeletionMarker[]>;
    /** Remove the marker and its now-empty Topic directory after artifact cleanup. */
    finishDeleting(marker: TopicDeletionMarker): Promise<void>;
    /** Forget only a superseded plugin index after an owned copy was committed; original logs remain intact. */
    forgetLegacy(metadata: Pick<TopicMetadata, 'sessionId' | 'sourceSessionId' | 'topicId'>): Promise<void>;
    private directory;
    private read;
    private readIfPresent;
    private deletionMarkerIfPresent;
}
export {};

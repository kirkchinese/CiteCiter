import { type SessionHeader } from '@deepseek-ai/dsh-session';
import { z } from 'zod';
import { type TopicMetadata } from './topic.ts';
import { type TopicDeletionReceipt } from './topic-deletion-receipts.ts';
export declare function unlinkIfPresent(path: string): Promise<void>;
export declare function rmdirIfEmpty(path: string): Promise<void>;
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
/** Committed intent to delete one Topic; recovery finishes the cleanup after a restart. */
export type TopicDeletionMarker = Omit<z.infer<typeof topicDeletionMarkerSchema>, 'sessionHeader'> & {
    readonly sessionHeader: SessionHeader;
};
/** Minimal on-disk navigation index; Session history stays in standard DSH JSONL. */
export declare class TopicIndex {
    private readonly legacyRoot;
    private readonly sourceRoots;
    private readonly deletionReceipts;
    /** @param legacyRoot - pre-0.8 index root, read only to migrate old Topics. */
    constructor(legacyRoot?: string);
    /** Bind a canonical source-owned root resolved by SourceStorage. */
    bindSource(sourceSessionId: string, root: string): void;
    /** Return the owned metadata directory for one Topic. */
    ownedDirectory(sourceSessionId: string, topicId: number): string;
    /** Read navigation records across bound sources; never opens or mutates a Session log. */
    all(): Promise<TopicMetadata[]>;
    /** Read records still stored in the pre-0.8 index root, for migration only. */
    legacyRecords(): Promise<TopicMetadata[]>;
    /** Reserve the next unused numeric Topic directory below a bound source root. */
    reserve(sourceSessionId: string): Promise<{
        topicId: number;
        directory: string;
    }>;
    save(metadata: TopicMetadata): Promise<void>;
    /** Read the metadata currently stored in one owned Topic directory, if any. */
    readOwned(sourceSessionId: string, topicId: number): Promise<TopicMetadata | undefined>;
    loadBySessionId(sessionId: string): Promise<TopicMetadata>;
    /** Return owned metadata when present; malformed or unreadable storage still throws. */
    findBySessionId(sessionId: string): Promise<TopicMetadata | undefined>;
    /**
     * Find authoritative committed deletion evidence without inferring it from missing metadata.
     * @param sessionId - exact generated Citer Session identity.
     * @returns a verified pending marker or completed receipt, including after Host restart;
     * old deletions whose markers were already removed have no recoverable evidence.
     */
    findDeleted(sessionId: string): Promise<TopicDeletionReceipt | undefined>;
    list(sourceSessionId: string): Promise<TopicMetadata[]>;
    /** Commit a minimal deletion marker before making Topic metadata unreachable. */
    markDeleting(metadata: TopicMetadata, sessionHeader: SessionHeader): Promise<TopicDeletionMarker>;
    /** Discover committed deletion markers without following linked directories. */
    listDeleting(): Promise<TopicDeletionMarker[]>;
    /** Commit the deletion identity, then remove the marker and empty Topic directory after artifact cleanup. */
    finishDeleting(marker: TopicDeletionMarker): Promise<void>;
    /** Forget a migrated pre-0.8 index entry after its owned copy was committed; original logs remain intact. */
    forgetLegacy(metadata: Pick<TopicMetadata, 'sessionId' | 'sourceSessionId' | 'topicId'>): Promise<void>;
    private sourceRoot;
    private readIfPresent;
    private deletionMarkerIfPresent;
}
export {};

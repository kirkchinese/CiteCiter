import { z } from 'zod';
declare const receiptSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    sourceSessionId: z.ZodString;
    topicId: z.ZodNumber;
    sessionId: z.ZodString;
    cleanup: z.ZodEnum<{
        pending: "pending";
        complete: "complete";
    }>;
}, z.core.$strict>;
/** Minimal deletion evidence; never retains a Topic's content, attachment or Session header. */
export type TopicDeletionReceipt = z.infer<typeof receiptSchema>;
type AtomicJsonWriter = (path: string, value: unknown) => Promise<void>;
/** Store exact identities below an already owned source root, independently of numeric Topic directories. */
export declare class TopicDeletionReceipts {
    private readonly writeJson;
    /** @param writeJson - the owner's atomic JSON writer; no Host services or log writer are involved. */
    constructor(writeJson: AtomicJsonWriter);
    private directory;
    /**
     * Read one exact receipt from a known Citer-owned source root.
     * @param root - canonical source/citeciter root, or the existing legacy Citer source index.
     * @param sourceSessionId - source identity supplied by the owner, never derived from receipt data.
     * @param sessionId - exact generated Topic identity; no arbitrary path segments are accepted.
     * @returns verified evidence, or undefined only when the receipt does not exist.
     * Malformed, linked or identity-mismatched artifacts fail visibly and never imply deletion.
     */
    read(root: string, sourceSessionId: string, sessionId: string): Promise<TopicDeletionReceipt | undefined>;
    /**
     * Commit completed deletion evidence before the owner removes its recovery marker.
     * @param root - existing owned source root; this method never creates a source Session.
     * @param receipt - completed exact identity, with no content-bearing metadata.
     * @returns after atomic publication, or when the identical receipt was already committed.
     */
    complete(root: string, receipt: TopicDeletionReceipt & {
        cleanup: 'complete';
    }): Promise<void>;
}
export {};

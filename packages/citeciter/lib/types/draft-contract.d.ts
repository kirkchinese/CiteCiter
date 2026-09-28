import { z } from 'zod';
/** Persisted drafts are user work, never model input until explicitly submitted. */
export declare const draftReferenceSchema: z.ZodObject<{
    id: z.ZodString;
    kind: z.ZodEnum<{
        source: "source";
        excerpt: "excerpt";
        board: "board";
    }>;
    label: z.ZodString;
    content: z.ZodString;
    address: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const draftFileSchema: z.ZodObject<{
    id: z.ZodUUID;
    name: z.ZodString;
    type: z.ZodString;
    size: z.ZodNumber;
    lastModified: z.ZodNumber;
}, z.core.$strict>;
export declare const draftContentSchema: z.ZodObject<{
    text: z.ZodString;
    references: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        kind: z.ZodEnum<{
            source: "source";
            excerpt: "excerpt";
            board: "board";
        }>;
        label: z.ZodString;
        content: z.ZodString;
        address: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    files: z.ZodArray<z.ZodObject<{
        id: z.ZodUUID;
        name: z.ZodString;
        type: z.ZodString;
        size: z.ZodNumber;
        lastModified: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const draftStateSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    revision: z.ZodNumber;
    content: z.ZodObject<{
        text: z.ZodString;
        references: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            kind: z.ZodEnum<{
                source: "source";
                excerpt: "excerpt";
                board: "board";
            }>;
            label: z.ZodString;
            content: z.ZodString;
            address: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
        files: z.ZodArray<z.ZodObject<{
            id: z.ZodUUID;
            name: z.ZodString;
            type: z.ZodString;
            size: z.ZodNumber;
            lastModified: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    pending: z.ZodNullable<z.ZodObject<{
        requestId: z.ZodUUID;
        content: z.ZodObject<{
            text: z.ZodString;
            references: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                kind: z.ZodEnum<{
                    source: "source";
                    excerpt: "excerpt";
                    board: "board";
                }>;
                label: z.ZodString;
                content: z.ZodString;
                address: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            files: z.ZodArray<z.ZodObject<{
                id: z.ZodUUID;
                name: z.ZodString;
                type: z.ZodString;
                size: z.ZodNumber;
                lastModified: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type DraftContent = z.infer<typeof draftContentSchema>;
export type DraftState = z.infer<typeof draftStateSchema>;
export type DraftFile = z.infer<typeof draftFileSchema>;
export declare const EMPTY_DRAFT: DraftContent;
export declare const EMPTY_DRAFT_STATE: DraftState;
export declare const DRAFT_CHUNK_BYTES: number;
/** Remove only the acknowledged submission, preserving edits made while it was pending. */
export declare function subtractSubmitted(current: DraftContent, submitted: DraftContent): DraftContent;

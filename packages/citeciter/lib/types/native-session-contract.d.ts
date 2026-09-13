import { z } from 'zod';
import type { AttachmentIdType, ImageAttachmentRef } from '@deepseek-ai/dsh-attachment';
export declare const nativeImageSchema: z.ZodPipe<z.ZodObject<{
    attachmentId: z.ZodPipe<z.ZodString, z.ZodTransform<AttachmentIdType, string>>;
    mediaType: z.ZodEnum<{
        "image/png": "image/png";
        "image/jpeg": "image/jpeg";
        "image/webp": "image/webp";
        "image/gif": "image/gif";
    }>;
    bytes: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
    name: z.ZodOptional<z.ZodString>;
    originalDimensions: z.ZodOptional<z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodTransform<ImageAttachmentRef, {
    attachmentId: AttachmentIdType;
    mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
    bytes: number;
    width: number;
    height: number;
    name?: string | undefined;
    originalDimensions?: {
        width: number;
        height: number;
    } | undefined;
}>>;
export declare const nativeAttachmentSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"image">;
    attachment: z.ZodPipe<z.ZodObject<{
        attachmentId: z.ZodPipe<z.ZodString, z.ZodTransform<AttachmentIdType, string>>;
        mediaType: z.ZodEnum<{
            "image/png": "image/png";
            "image/jpeg": "image/jpeg";
            "image/webp": "image/webp";
            "image/gif": "image/gif";
        }>;
        bytes: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
        name: z.ZodOptional<z.ZodString>;
        originalDimensions: z.ZodOptional<z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>, z.ZodTransform<ImageAttachmentRef, {
        attachmentId: AttachmentIdType;
        mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
        bytes: number;
        width: number;
        height: number;
        name?: string | undefined;
        originalDimensions?: {
            width: number;
            height: number;
        } | undefined;
    }>>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"file">;
    attachment: z.ZodObject<{
        attachmentId: z.ZodPipe<z.ZodString, z.ZodTransform<AttachmentIdType, string>>;
        name: z.ZodString;
        bytes: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>], "type">;
/** Read-only control projection. The Agent inbox remains the only authoritative queue. */
export declare const nativeStateSchema: z.ZodObject<{
    running: z.ZodBoolean;
    blank: z.ZodBoolean;
    error: z.ZodNullable<z.ZodString>;
    queue: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        placement: z.ZodEnum<{
            queued: "queued";
            steering: "steering";
            context: "context";
        }>;
        rpcId: z.ZodOptional<z.ZodString>;
        text: z.ZodString;
        attachments: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            type: z.ZodLiteral<"image">;
            attachment: z.ZodPipe<z.ZodObject<{
                attachmentId: z.ZodPipe<z.ZodString, z.ZodTransform<AttachmentIdType, string>>;
                mediaType: z.ZodEnum<{
                    "image/png": "image/png";
                    "image/jpeg": "image/jpeg";
                    "image/webp": "image/webp";
                    "image/gif": "image/gif";
                }>;
                bytes: z.ZodNumber;
                width: z.ZodNumber;
                height: z.ZodNumber;
                name: z.ZodOptional<z.ZodString>;
                originalDimensions: z.ZodOptional<z.ZodObject<{
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodTransform<ImageAttachmentRef, {
                attachmentId: AttachmentIdType;
                mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
                bytes: number;
                width: number;
                height: number;
                name?: string | undefined;
                originalDimensions?: {
                    width: number;
                    height: number;
                } | undefined;
            }>>;
        }, z.core.$strict>, z.ZodObject<{
            type: z.ZodLiteral<"file">;
            attachment: z.ZodObject<{
                attachmentId: z.ZodPipe<z.ZodString, z.ZodTransform<AttachmentIdType, string>>;
                name: z.ZodString;
                bytes: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>], "type">>;
    }, z.core.$strict>>;
    receipts: z.ZodArray<z.ZodObject<{
        requestId: z.ZodString;
        attachments: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            type: z.ZodLiteral<"image">;
            attachment: z.ZodPipe<z.ZodObject<{
                attachmentId: z.ZodPipe<z.ZodString, z.ZodTransform<AttachmentIdType, string>>;
                mediaType: z.ZodEnum<{
                    "image/png": "image/png";
                    "image/jpeg": "image/jpeg";
                    "image/webp": "image/webp";
                    "image/gif": "image/gif";
                }>;
                bytes: z.ZodNumber;
                width: z.ZodNumber;
                height: z.ZodNumber;
                name: z.ZodOptional<z.ZodString>;
                originalDimensions: z.ZodOptional<z.ZodObject<{
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>, z.ZodTransform<ImageAttachmentRef, {
                attachmentId: AttachmentIdType;
                mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
                bytes: number;
                width: number;
                height: number;
                name?: string | undefined;
                originalDimensions?: {
                    width: number;
                    height: number;
                } | undefined;
            }>>;
        }, z.core.$strict>, z.ZodObject<{
            type: z.ZodLiteral<"file">;
            attachment: z.ZodObject<{
                attachmentId: z.ZodPipe<z.ZodString, z.ZodTransform<AttachmentIdType, string>>;
                name: z.ZodString;
                bytes: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>], "type">>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type NativeState = z.infer<typeof nativeStateSchema>;
export type NativeAttachment = z.infer<typeof nativeAttachmentSchema>;

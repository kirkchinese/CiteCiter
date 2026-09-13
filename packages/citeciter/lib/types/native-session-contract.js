import { z } from 'zod';
const attachmentId = z.string().min(1).transform(value => value);
export const nativeImageSchema = z.object({
    attachmentId, mediaType: z.enum(['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
    bytes: z.number().int().nonnegative(), width: z.number().int().positive(), height: z.number().int().positive(),
    name: z.string().optional(), originalDimensions: z.object({ width: z.number().int().positive(), height: z.number().int().positive() }).strict().optional(),
}).strict().transform(({ name, originalDimensions, ...image }) => ({ ...image, ...(name === undefined ? {} : { name }), ...(originalDimensions === undefined ? {} : { originalDimensions }) }));
const file = z.object({ attachmentId, name: z.string(), bytes: z.number().int().nonnegative() }).strict();
/** Wire reference for an authorized attachment; generic files have no image metadata. */
export const nativeAttachmentRefSchema = z.union([nativeImageSchema, file]);
export const nativeAttachmentSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('image'), attachment: nativeImageSchema }).strict(),
    z.object({ type: z.literal('file'), attachment: file }).strict(),
]);
/** Read-only control projection. The Agent inbox remains the only authoritative queue. */
export const nativeStateSchema = z.object({
    running: z.boolean(), blank: z.boolean(), error: z.string().nullable(),
    queue: z.array(z.object({
        id: z.string().min(1), placement: z.enum(['queued', 'steering', 'context']), rpcId: z.string().optional(),
        text: z.string(), attachments: z.array(nativeAttachmentSchema),
    }).strict()),
    receipts: z.array(z.object({ requestId: z.string().min(1), attachments: z.array(nativeAttachmentSchema) }).strict()),
}).strict();

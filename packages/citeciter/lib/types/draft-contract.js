import { z } from 'zod';
/** Persisted drafts are user work, never model input until explicitly submitted. */
export const draftReferenceSchema = z.object({
    id: z.string().min(1).max(500), kind: z.enum(['source', 'excerpt', 'board']),
    label: z.string().max(1000), content: z.string().max(500_000), address: z.string().max(4000).optional(),
}).strict();
export const draftFileSchema = z.object({
    id: z.uuid(), name: z.string().min(1).max(1000), type: z.string().max(200),
    size: z.number().int().nonnegative().max(100 * 1024 * 1024), lastModified: z.number().int().nonnegative(),
}).strict();
export const draftContentSchema = z.object({
    text: z.string().max(11_000), references: z.array(draftReferenceSchema).max(64), files: z.array(draftFileSchema).max(32),
}).strict();
export const draftStateSchema = z.object({
    version: z.literal(1), revision: z.number().int().nonnegative(), content: draftContentSchema,
    pending: z.object({ requestId: z.uuid(), content: draftContentSchema }).strict().nullable(),
}).strict();
export const EMPTY_DRAFT = { text: '', references: [], files: [] };
export const EMPTY_DRAFT_STATE = { version: 1, revision: 0, content: EMPTY_DRAFT, pending: null };
export const DRAFT_CHUNK_BYTES = 256 * 1024;
/** Remove only the acknowledged submission, preserving edits made while it was pending. */
export function subtractSubmitted(current, submitted) {
    return {
        text: current.text === submitted.text ? '' : current.text,
        references: current.references.filter(item => !submitted.references.some(sent => sent.id === item.id)),
        files: current.files.filter(item => !submitted.files.some(sent => sent.id === item.id)),
    };
}

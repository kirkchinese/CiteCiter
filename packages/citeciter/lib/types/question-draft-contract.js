import { z } from 'zod';
/** Question identities are opaque values, never filesystem paths. */
export const questionDraftKeySchema = z.string().min(1).max(2000);
/** Partial answers preserve custom text verbatim, including whitespace and code indentation. */
export const questionDraftAnswerSchema = z.object({
    selected: z.array(z.string().max(4000)).max(128),
    custom: z.string().max(100_000),
}).strict();
export const questionDraftContentSchema = z.object({
    answers: z.record(z.string().min(1).max(1000), questionDraftAnswerSchema).refine(answers => Object.keys(answers).length <= 128, 'Too many question drafts'),
    page: z.number().int().nonnegative().max(127),
    edited: z.boolean(),
    held: z.boolean(),
}).strict();
/** A per-question CAS revision, independent from the ordinary message draft. */
export const questionDraftStateSchema = z.object({
    version: z.literal(1),
    revision: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER - 1),
    content: questionDraftContentSchema,
}).strict();
export const EMPTY_QUESTION_DRAFT_STATE = {
    version: 1, revision: 0,
    content: { answers: {}, page: 0, edited: false, held: false },
};
/** Closed tombstones prevent delayed saves from recreating an accepted or ended question. */
export const questionDraftRecordSchema = z.object({
    key: questionDraftKeySchema,
    closed: z.boolean(),
    /** Set only by the owning Host while observing a legacy blocking ask invocation. */
    blocking: z.boolean().optional(),
    state: questionDraftStateSchema,
}).strict().refine(record => !record.closed || (Object.keys(record.state.content.answers).length === 0 && record.state.content.page === 0
    && !record.state.content.edited && !record.state.content.held), 'Closed question drafts must be empty');

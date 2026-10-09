import { z } from 'zod';
/** Question identities are opaque values, never filesystem paths. */
export declare const questionDraftKeySchema: z.ZodString;
/** Partial answers preserve custom text verbatim, including whitespace and code indentation. */
export declare const questionDraftAnswerSchema: z.ZodObject<{
    selected: z.ZodArray<z.ZodString>;
    custom: z.ZodString;
}, z.core.$strict>;
export declare const questionDraftContentSchema: z.ZodObject<{
    answers: z.ZodRecord<z.ZodString, z.ZodObject<{
        selected: z.ZodArray<z.ZodString>;
        custom: z.ZodString;
    }, z.core.$strict>>;
    page: z.ZodNumber;
    edited: z.ZodBoolean;
    held: z.ZodBoolean;
}, z.core.$strict>;
/** A per-question CAS revision, independent from the ordinary message draft. */
export declare const questionDraftStateSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    revision: z.ZodNumber;
    content: z.ZodObject<{
        answers: z.ZodRecord<z.ZodString, z.ZodObject<{
            selected: z.ZodArray<z.ZodString>;
            custom: z.ZodString;
        }, z.core.$strict>>;
        page: z.ZodNumber;
        edited: z.ZodBoolean;
        held: z.ZodBoolean;
    }, z.core.$strict>;
}, z.core.$strict>;
export type QuestionDraftAnswer = z.infer<typeof questionDraftAnswerSchema>;
export type QuestionDraftContent = z.infer<typeof questionDraftContentSchema>;
export type QuestionDraftState = z.infer<typeof questionDraftStateSchema>;
export declare const EMPTY_QUESTION_DRAFT_STATE: QuestionDraftState;
/** Closed tombstones prevent delayed saves from recreating an accepted or ended question. */
export declare const questionDraftRecordSchema: z.ZodObject<{
    key: z.ZodString;
    closed: z.ZodBoolean;
    blocking: z.ZodOptional<z.ZodBoolean>;
    state: z.ZodObject<{
        version: z.ZodLiteral<1>;
        revision: z.ZodNumber;
        content: z.ZodObject<{
            answers: z.ZodRecord<z.ZodString, z.ZodObject<{
                selected: z.ZodArray<z.ZodString>;
                custom: z.ZodString;
            }, z.core.$strict>>;
            page: z.ZodNumber;
            edited: z.ZodBoolean;
            held: z.ZodBoolean;
        }, z.core.$strict>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type QuestionDraftRecord = z.infer<typeof questionDraftRecordSchema>;

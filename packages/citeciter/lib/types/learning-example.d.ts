import { z } from 'zod';
export declare const learningExampleSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"text">;
    content: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"code">;
    content: z.ZodString;
    language: z.ZodString;
}, z.core.$strict>], "kind">;
export type LearningExample = z.infer<typeof learningExampleSchema>;
/** Native DSH tool schema; kept beside the validator to expose the same tagged contract. */
export declare const LEARNING_EXAMPLE_PARAMETER: {
    readonly required: true;
    readonly description: "Choose text for prose or code for literal source code.";
    readonly oneOf: readonly [{
        readonly type: "object";
        readonly additionalProperties: false;
        readonly properties: {
            readonly kind: {
                readonly type: "string";
                readonly enum: readonly ["text"];
                readonly required: true;
            };
            readonly content: {
                readonly type: "string";
                readonly required: true;
                readonly description: "A prose example in Markdown, at most 1500 characters. Use the code variant for source code.";
            };
        };
    }, {
        readonly type: "object";
        readonly additionalProperties: false;
        readonly properties: {
            readonly kind: {
                readonly type: "string";
                readonly enum: readonly ["code"];
                readonly required: true;
            };
            readonly content: {
                readonly type: "string";
                readonly required: true;
                readonly description: "Raw source code, at most 1500 characters. Preserve line breaks and indentation; do not add Markdown fences.";
            };
            readonly language: {
                readonly type: "string";
                readonly required: true;
                readonly description: "Language identifier such as javascript, python, html or text; 1–40 letters, digits, underscores, plus signs, dots, hashes or hyphens.";
            };
        };
    }];
};
/** Export code literally, including embedded fences; the renderer never guesses its type. */
export declare function learningExampleMarkdown(example: LearningExample): string;

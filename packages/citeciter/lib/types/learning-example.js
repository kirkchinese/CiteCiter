import { z } from 'zod';
/** Shared contract for model input and persisted card examples. Code is never Markdown. */
const descriptions = {
    text: 'A prose example in Markdown, at most 1500 characters. Use the code variant for source code.',
    code: 'Raw source code, at most 1500 characters. Preserve line breaks and indentation; do not add Markdown fences.',
    language: 'Language identifier such as javascript, python, html or text; 1–40 letters, digits, underscores, plus signs, dots, hashes or hyphens.',
};
export const learningExampleSchema = z.discriminatedUnion('kind', [
    z.object({
        kind: z.literal('text'),
        content: z.string().trim().min(1).max(1500).describe(descriptions.text),
    }).strict(),
    z.object({
        kind: z.literal('code'),
        content: z.string().min(1).max(1500).refine(value => value.trim().length > 0, 'Code must not be blank').describe(descriptions.code),
        language: z.string().regex(/^[a-zA-Z0-9_+#.-]{1,40}$/).describe(descriptions.language),
    }).strict(),
]);
/** Native DSH tool schema; kept beside the validator to expose the same tagged contract. */
export const LEARNING_EXAMPLE_PARAMETER = {
    required: true,
    description: 'Choose text for prose or code for literal source code.',
    oneOf: [
        {
            type: 'object', additionalProperties: false,
            properties: {
                kind: { type: 'string', enum: ['text'], required: true },
                content: { type: 'string', required: true, description: descriptions.text },
            },
        },
        {
            type: 'object', additionalProperties: false,
            properties: {
                kind: { type: 'string', enum: ['code'], required: true },
                content: { type: 'string', required: true, description: descriptions.code },
                language: { type: 'string', required: true, description: descriptions.language },
            },
        },
    ],
};
/** Export code literally, including embedded fences; the renderer never guesses its type. */
export function learningExampleMarkdown(example) {
    if (example.kind === 'text')
        return example.content;
    const fence = '`'.repeat(Math.max(3, ...[...example.content.matchAll(/`+/g)].map(match => match[0].length + 1)));
    return `${fence}${example.language}\n${example.content}${example.content.endsWith('\n') ? '' : '\n'}${fence}`;
}

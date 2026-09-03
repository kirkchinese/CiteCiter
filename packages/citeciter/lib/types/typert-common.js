import { citeCiterRequestSchema, citeCiterResponseSchema } from "./topic.js";
import { updateCheckResponseSchema } from "./update.js";
/** Strict root-scoped Topic command shared by Host and browser manifests. */
export const citeCiterRequestDescriptor = {
    id: '@kirkchinese/dsh-citeciter#citeciter/request',
    service: 'citeciter',
    namespace: 'citeciter',
    method: 'request',
    invocation: { kind: 'direct' },
    parameters: [{
            name: 'rawRequest',
            wire: 'rawRequest',
            source: 'json',
            codec: {
                mode: 'strict',
                typeSymbol: '@kirkchinese/dsh-citeciter#CiteCiterRequest',
                schema: citeCiterRequestSchema,
            },
        }],
    cancellation: { parameter: 'signal' },
    result: {
        mode: 'strict',
        typeSymbol: '@kirkchinese/dsh-citeciter#CiteCiterResponse',
        schema: citeCiterResponseSchema,
    },
    sourceLocation: {
        file: 'src/index.ts',
        line: 127,
        column: 3,
    },
};
/** Strict root-scoped read-only update check shared by Host and browser manifests. */
export const updateCheckDescriptor = {
    id: '@kirkchinese/dsh-citeciter#citeciter/checkUpdate',
    service: 'citeciter',
    namespace: 'citeciter',
    method: 'checkUpdate',
    invocation: { kind: 'direct' },
    parameters: [],
    cancellation: { parameter: 'signal' },
    result: {
        mode: 'strict',
        typeSymbol: '@kirkchinese/dsh-citeciter#UpdateCheckResponse',
        schema: updateCheckResponseSchema,
    },
    sourceLocation: {
        file: 'src/index.ts',
        line: 134,
        column: 3,
    },
};

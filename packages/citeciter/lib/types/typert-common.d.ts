import { z } from 'zod';
export declare const prepareThreadResultSchema: z.ZodObject<{
    ready: z.ZodLiteral<true>;
    citation: z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        sourceSessionId: z.ZodString;
        anchorKey: z.ZodString;
        anchorSeq: z.ZodNumber;
        startOffset: z.ZodNumber;
        endOffset: z.ZodNumber;
        selectionFingerprint: z.ZodString;
        selectedText: z.ZodString;
        prefixText: z.ZodString;
        suffixText: z.ZodString;
        createdAt: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>;
/** Strict descriptor shared byte-for-byte by Host and Client contributions. */
export declare const prepareThreadDescriptor: {
    readonly id: "@kirkchinese/dsh-citeciter#citeciter/prepareThread";
    readonly service: "citeciter";
    readonly namespace: "citeciter";
    readonly method: "prepareThread";
    readonly invocation: {
        readonly kind: "direct";
    };
    readonly scope: {
        readonly context: "agent";
        readonly wire: "agentId";
    };
    readonly parameters: readonly [{
        readonly name: "agent";
        readonly wire: "agentId";
        readonly source: "lookup";
        readonly lookup: "agent";
        readonly codec: {
            readonly mode: "strict";
            readonly typeSymbol: "@deepseek-ai/dsh-session/types#SessionId";
            readonly schema: z.ZodString;
        };
    }, {
        readonly name: "rawCitation";
        readonly wire: "rawCitation";
        readonly source: "json";
        readonly codec: {
            readonly mode: "strict";
            readonly typeSymbol: "@kirkchinese/dsh-citeciter#CitationRecord";
            readonly schema: z.ZodObject<{
                schemaVersion: z.ZodLiteral<1>;
                sourceSessionId: z.ZodString;
                anchorKey: z.ZodString;
                anchorSeq: z.ZodNumber;
                startOffset: z.ZodNumber;
                endOffset: z.ZodNumber;
                selectionFingerprint: z.ZodString;
                selectedText: z.ZodString;
                prefixText: z.ZodString;
                suffixText: z.ZodString;
                createdAt: z.ZodNumber;
            }, z.core.$strict>;
        };
    }];
    readonly result: {
        readonly mode: "strict";
        readonly typeSymbol: "@kirkchinese/dsh-citeciter#PrepareThreadResult";
        readonly schema: z.ZodObject<{
            ready: z.ZodLiteral<true>;
            citation: z.ZodObject<{
                schemaVersion: z.ZodLiteral<1>;
                sourceSessionId: z.ZodString;
                anchorKey: z.ZodString;
                anchorSeq: z.ZodNumber;
                startOffset: z.ZodNumber;
                endOffset: z.ZodNumber;
                selectionFingerprint: z.ZodString;
                selectedText: z.ZodString;
                prefixText: z.ZodString;
                suffixText: z.ZodString;
                createdAt: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>;
    };
    readonly sourceLocation: {
        readonly file: "src/index.ts";
        readonly line: 104;
        readonly column: 3;
    };
};

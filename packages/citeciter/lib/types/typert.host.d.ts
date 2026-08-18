/** Handwritten strict Host contribution kept in sync with the Remote decorator. */
export declare const TYPERT: {
    readonly package: "@kirkchinese/dsh-citeciter";
    readonly face: "host";
    readonly schemas: readonly [{
        readonly name: "CitationRecord";
        readonly schema: import("zod").ZodObject<{
            schemaVersion: import("zod").ZodLiteral<1>;
            sourceSessionId: import("zod").ZodString;
            anchorKey: import("zod").ZodString;
            anchorSeq: import("zod").ZodNumber;
            startOffset: import("zod").ZodNumber;
            endOffset: import("zod").ZodNumber;
            selectionFingerprint: import("zod").ZodString;
            selectedText: import("zod").ZodString;
            prefixText: import("zod").ZodString;
            suffixText: import("zod").ZodString;
            createdAt: import("zod").ZodNumber;
        }, import("zod/v4/core").$strict>;
    }, {
        readonly name: "PrepareThreadResult";
        readonly schema: import("zod").ZodObject<{
            ready: import("zod").ZodLiteral<true>;
            citation: import("zod").ZodObject<{
                schemaVersion: import("zod").ZodLiteral<1>;
                sourceSessionId: import("zod").ZodString;
                anchorKey: import("zod").ZodString;
                anchorSeq: import("zod").ZodNumber;
                startOffset: import("zod").ZodNumber;
                endOffset: import("zod").ZodNumber;
                selectionFingerprint: import("zod").ZodString;
                selectedText: import("zod").ZodString;
                prefixText: import("zod").ZodString;
                suffixText: import("zod").ZodString;
                createdAt: import("zod").ZodNumber;
            }, import("zod/v4/core").$strict>;
        }, import("zod/v4/core").$strict>;
    }];
    readonly model: {
        readonly services: readonly [];
        readonly events: readonly [];
        readonly objects: readonly [];
    };
    readonly invocations: readonly [{
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
                readonly schema: import("zod").ZodString;
            };
        }, {
            readonly name: "rawCitation";
            readonly wire: "rawCitation";
            readonly source: "json";
            readonly codec: {
                readonly mode: "strict";
                readonly typeSymbol: "@kirkchinese/dsh-citeciter#CitationRecord";
                readonly schema: import("zod").ZodObject<{
                    schemaVersion: import("zod").ZodLiteral<1>;
                    sourceSessionId: import("zod").ZodString;
                    anchorKey: import("zod").ZodString;
                    anchorSeq: import("zod").ZodNumber;
                    startOffset: import("zod").ZodNumber;
                    endOffset: import("zod").ZodNumber;
                    selectionFingerprint: import("zod").ZodString;
                    selectedText: import("zod").ZodString;
                    prefixText: import("zod").ZodString;
                    suffixText: import("zod").ZodString;
                    createdAt: import("zod").ZodNumber;
                }, import("zod/v4/core").$strict>;
            };
        }];
        readonly result: {
            readonly mode: "strict";
            readonly typeSymbol: "@kirkchinese/dsh-citeciter#PrepareThreadResult";
            readonly schema: import("zod").ZodObject<{
                ready: import("zod").ZodLiteral<true>;
                citation: import("zod").ZodObject<{
                    schemaVersion: import("zod").ZodLiteral<1>;
                    sourceSessionId: import("zod").ZodString;
                    anchorKey: import("zod").ZodString;
                    anchorSeq: import("zod").ZodNumber;
                    startOffset: import("zod").ZodNumber;
                    endOffset: import("zod").ZodNumber;
                    selectionFingerprint: import("zod").ZodString;
                    selectedText: import("zod").ZodString;
                    prefixText: import("zod").ZodString;
                    suffixText: import("zod").ZodString;
                    createdAt: import("zod").ZodNumber;
                }, import("zod/v4/core").$strict>;
            }, import("zod/v4/core").$strict>;
        };
        readonly sourceLocation: {
            readonly file: "src/index.ts";
            readonly line: 104;
            readonly column: 3;
        };
    }];
};
export default TYPERT;

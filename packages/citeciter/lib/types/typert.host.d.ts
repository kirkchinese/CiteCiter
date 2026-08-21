/** Handwritten strict Host contribution matching the single Remote decorator. */
export declare const TYPERT: {
    readonly package: "@kirkchinese/dsh-citeciter";
    readonly face: "host";
    readonly schemas: readonly [{
        readonly name: "CitationDraft";
        readonly schema: import("zod").ZodObject<{
            sourceSessionId: import("zod").ZodString;
            anchorSeq: import("zod").ZodNumber;
            startOffset: import("zod").ZodNumber;
            endOffset: import("zod").ZodNumber;
            sourceText: import("zod").ZodString;
            displayText: import("zod").ZodString;
            prefixText: import("zod").ZodString;
            suffixText: import("zod").ZodString;
            selectionFingerprint: import("zod").ZodString;
        }, import("zod/v4/core").$strict>;
    }, {
        readonly name: "CitationRecord";
        readonly schema: import("zod").ZodObject<{
            sourceSessionId: import("zod").ZodString;
            anchorSeq: import("zod").ZodNumber;
            startOffset: import("zod").ZodNumber;
            endOffset: import("zod").ZodNumber;
            sourceText: import("zod").ZodString;
            displayText: import("zod").ZodString;
            prefixText: import("zod").ZodString;
            suffixText: import("zod").ZodString;
            selectionFingerprint: import("zod").ZodString;
            schemaVersion: import("zod").ZodLiteral<3>;
            createdAt: import("zod").ZodNumber;
        }, import("zod/v4/core").$strict>;
    }, {
        readonly name: "TopicSummary";
        readonly schema: import("zod").ZodObject<{
            topicId: import("zod").ZodNumber;
            sessionId: import("zod").ZodString;
            sourceSessionId: import("zod").ZodString;
            mode: import("zod").ZodEnum<{
                observer: "observer";
                "exact-fork": "exact-fork";
            }>;
            citation: import("zod").ZodObject<{
                sourceSessionId: import("zod").ZodString;
                anchorSeq: import("zod").ZodNumber;
                startOffset: import("zod").ZodNumber;
                endOffset: import("zod").ZodNumber;
                sourceText: import("zod").ZodString;
                displayText: import("zod").ZodString;
                prefixText: import("zod").ZodString;
                suffixText: import("zod").ZodString;
                selectionFingerprint: import("zod").ZodString;
                schemaVersion: import("zod").ZodLiteral<3>;
                createdAt: import("zod").ZodNumber;
            }, import("zod/v4/core").$strict>;
            title: import("zod").ZodString;
            titlePending: import("zod").ZodBoolean;
            createdAt: import("zod").ZodNumber;
            updatedAt: import("zod").ZodNumber;
            archived: import("zod").ZodBoolean;
            running: import("zod").ZodBoolean;
            sourceAvailable: import("zod").ZodBoolean;
            observedThroughSeq: import("zod").ZodNullable<import("zod").ZodNumber>;
            modelConfig: import("zod").ZodObject<{
                provider: import("zod").ZodString;
                model: import("zod").ZodString;
                reasoningEffort: import("zod").ZodOptional<import("zod").ZodString>;
                temperature: import("zod").ZodOptional<import("zod").ZodNumber>;
                maxTokens: import("zod").ZodOptional<import("zod").ZodNumber>;
                stop: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
            }, import("zod/v4/core").$strict>;
        }, import("zod/v4/core").$strict>;
    }, {
        readonly name: "TopicSnapshot";
        readonly schema: import("zod").ZodObject<{
            topic: import("zod").ZodObject<{
                topicId: import("zod").ZodNumber;
                sessionId: import("zod").ZodString;
                sourceSessionId: import("zod").ZodString;
                mode: import("zod").ZodEnum<{
                    observer: "observer";
                    "exact-fork": "exact-fork";
                }>;
                citation: import("zod").ZodObject<{
                    sourceSessionId: import("zod").ZodString;
                    anchorSeq: import("zod").ZodNumber;
                    startOffset: import("zod").ZodNumber;
                    endOffset: import("zod").ZodNumber;
                    sourceText: import("zod").ZodString;
                    displayText: import("zod").ZodString;
                    prefixText: import("zod").ZodString;
                    suffixText: import("zod").ZodString;
                    selectionFingerprint: import("zod").ZodString;
                    schemaVersion: import("zod").ZodLiteral<3>;
                    createdAt: import("zod").ZodNumber;
                }, import("zod/v4/core").$strict>;
                title: import("zod").ZodString;
                titlePending: import("zod").ZodBoolean;
                createdAt: import("zod").ZodNumber;
                updatedAt: import("zod").ZodNumber;
                archived: import("zod").ZodBoolean;
                running: import("zod").ZodBoolean;
                sourceAvailable: import("zod").ZodBoolean;
                observedThroughSeq: import("zod").ZodNullable<import("zod").ZodNumber>;
                modelConfig: import("zod").ZodObject<{
                    provider: import("zod").ZodString;
                    model: import("zod").ZodString;
                    reasoningEffort: import("zod").ZodOptional<import("zod").ZodString>;
                    temperature: import("zod").ZodOptional<import("zod").ZodNumber>;
                    maxTokens: import("zod").ZodOptional<import("zod").ZodNumber>;
                    stop: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
                }, import("zod/v4/core").$strict>;
            }, import("zod/v4/core").$strict>;
            messages: import("zod").ZodArray<import("zod").ZodObject<{
                id: import("zod").ZodString;
                seq: import("zod").ZodNumber;
                role: import("zod").ZodEnum<{
                    error: "error";
                    user: "user";
                    assistant: "assistant";
                }>;
                text: import("zod").ZodString;
                reasoning: import("zod").ZodNullable<import("zod").ZodString>;
                streaming: import("zod").ZodBoolean;
            }, import("zod/v4/core").$strict>>;
            error: import("zod").ZodNullable<import("zod").ZodString>;
        }, import("zod/v4/core").$strict>;
    }, {
        readonly name: "CiteCiterRequest";
        readonly schema: import("zod").ZodDiscriminatedUnion<[import("zod").ZodObject<{
            action: import("zod").ZodLiteral<"create">;
            citation: import("zod").ZodObject<{
                sourceSessionId: import("zod").ZodString;
                anchorSeq: import("zod").ZodNumber;
                startOffset: import("zod").ZodNumber;
                endOffset: import("zod").ZodNumber;
                sourceText: import("zod").ZodString;
                displayText: import("zod").ZodString;
                prefixText: import("zod").ZodString;
                suffixText: import("zod").ZodString;
                selectionFingerprint: import("zod").ZodString;
            }, import("zod/v4/core").$strict>;
            question: import("zod").ZodString;
            mode: import("zod").ZodEnum<{
                observer: "observer";
                "exact-fork": "exact-fork";
                "exact-when-available": "exact-when-available";
            }>;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            action: import("zod").ZodLiteral<"list">;
            sourceSessionId: import("zod").ZodString;
            includeArchived: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            action: import("zod").ZodLiteral<"get">;
            topicSessionId: import("zod").ZodString;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            action: import("zod").ZodLiteral<"ask">;
            topicSessionId: import("zod").ZodString;
            question: import("zod").ZodString;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            action: import("zod").ZodLiteral<"stop">;
            topicSessionId: import("zod").ZodString;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            action: import("zod").ZodLiteral<"rename">;
            topicSessionId: import("zod").ZodString;
            title: import("zod").ZodString;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            action: import("zod").ZodLiteral<"archive">;
            topicSessionId: import("zod").ZodString;
            archived: import("zod").ZodBoolean;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            action: import("zod").ZodLiteral<"delete">;
            topicSessionId: import("zod").ZodString;
            confirmSessionId: import("zod").ZodString;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            action: import("zod").ZodLiteral<"models">;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            action: import("zod").ZodLiteral<"select-model">;
            topicSessionId: import("zod").ZodString;
            provider: import("zod").ZodString;
            model: import("zod").ZodString;
            reasoningEffort: import("zod").ZodNullable<import("zod").ZodString>;
        }, import("zod/v4/core").$strict>], "action">;
    }, {
        readonly name: "CiteCiterResponse";
        readonly schema: import("zod").ZodDiscriminatedUnion<[import("zod").ZodObject<{
            kind: import("zod").ZodLiteral<"topic">;
            topic: import("zod").ZodObject<{
                topic: import("zod").ZodObject<{
                    topicId: import("zod").ZodNumber;
                    sessionId: import("zod").ZodString;
                    sourceSessionId: import("zod").ZodString;
                    mode: import("zod").ZodEnum<{
                        observer: "observer";
                        "exact-fork": "exact-fork";
                    }>;
                    citation: import("zod").ZodObject<{
                        sourceSessionId: import("zod").ZodString;
                        anchorSeq: import("zod").ZodNumber;
                        startOffset: import("zod").ZodNumber;
                        endOffset: import("zod").ZodNumber;
                        sourceText: import("zod").ZodString;
                        displayText: import("zod").ZodString;
                        prefixText: import("zod").ZodString;
                        suffixText: import("zod").ZodString;
                        selectionFingerprint: import("zod").ZodString;
                        schemaVersion: import("zod").ZodLiteral<3>;
                        createdAt: import("zod").ZodNumber;
                    }, import("zod/v4/core").$strict>;
                    title: import("zod").ZodString;
                    titlePending: import("zod").ZodBoolean;
                    createdAt: import("zod").ZodNumber;
                    updatedAt: import("zod").ZodNumber;
                    archived: import("zod").ZodBoolean;
                    running: import("zod").ZodBoolean;
                    sourceAvailable: import("zod").ZodBoolean;
                    observedThroughSeq: import("zod").ZodNullable<import("zod").ZodNumber>;
                    modelConfig: import("zod").ZodObject<{
                        provider: import("zod").ZodString;
                        model: import("zod").ZodString;
                        reasoningEffort: import("zod").ZodOptional<import("zod").ZodString>;
                        temperature: import("zod").ZodOptional<import("zod").ZodNumber>;
                        maxTokens: import("zod").ZodOptional<import("zod").ZodNumber>;
                        stop: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
                    }, import("zod/v4/core").$strict>;
                }, import("zod/v4/core").$strict>;
                messages: import("zod").ZodArray<import("zod").ZodObject<{
                    id: import("zod").ZodString;
                    seq: import("zod").ZodNumber;
                    role: import("zod").ZodEnum<{
                        error: "error";
                        user: "user";
                        assistant: "assistant";
                    }>;
                    text: import("zod").ZodString;
                    reasoning: import("zod").ZodNullable<import("zod").ZodString>;
                    streaming: import("zod").ZodBoolean;
                }, import("zod/v4/core").$strict>>;
                error: import("zod").ZodNullable<import("zod").ZodString>;
            }, import("zod/v4/core").$strict>;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            kind: import("zod").ZodLiteral<"topics">;
            topics: import("zod").ZodArray<import("zod").ZodObject<{
                topicId: import("zod").ZodNumber;
                sessionId: import("zod").ZodString;
                sourceSessionId: import("zod").ZodString;
                mode: import("zod").ZodEnum<{
                    observer: "observer";
                    "exact-fork": "exact-fork";
                }>;
                citation: import("zod").ZodObject<{
                    sourceSessionId: import("zod").ZodString;
                    anchorSeq: import("zod").ZodNumber;
                    startOffset: import("zod").ZodNumber;
                    endOffset: import("zod").ZodNumber;
                    sourceText: import("zod").ZodString;
                    displayText: import("zod").ZodString;
                    prefixText: import("zod").ZodString;
                    suffixText: import("zod").ZodString;
                    selectionFingerprint: import("zod").ZodString;
                    schemaVersion: import("zod").ZodLiteral<3>;
                    createdAt: import("zod").ZodNumber;
                }, import("zod/v4/core").$strict>;
                title: import("zod").ZodString;
                titlePending: import("zod").ZodBoolean;
                createdAt: import("zod").ZodNumber;
                updatedAt: import("zod").ZodNumber;
                archived: import("zod").ZodBoolean;
                running: import("zod").ZodBoolean;
                sourceAvailable: import("zod").ZodBoolean;
                observedThroughSeq: import("zod").ZodNullable<import("zod").ZodNumber>;
                modelConfig: import("zod").ZodObject<{
                    provider: import("zod").ZodString;
                    model: import("zod").ZodString;
                    reasoningEffort: import("zod").ZodOptional<import("zod").ZodString>;
                    temperature: import("zod").ZodOptional<import("zod").ZodNumber>;
                    maxTokens: import("zod").ZodOptional<import("zod").ZodNumber>;
                    stop: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
                }, import("zod/v4/core").$strict>;
            }, import("zod/v4/core").$strict>>;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            kind: import("zod").ZodLiteral<"models">;
            providers: import("zod").ZodArray<import("zod").ZodObject<{
                id: import("zod").ZodString;
                name: import("zod").ZodString;
                models: import("zod").ZodArray<import("zod").ZodObject<{
                    id: import("zod").ZodString;
                    name: import("zod").ZodString;
                    description: import("zod").ZodOptional<import("zod").ZodString>;
                    reasoningEfforts: import("zod").ZodArray<import("zod").ZodObject<{
                        id: import("zod").ZodString;
                        name: import("zod").ZodString;
                    }, import("zod/v4/core").$strict>>;
                }, import("zod/v4/core").$strict>>;
            }, import("zod/v4/core").$strict>>;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            kind: import("zod").ZodLiteral<"deleted">;
            sessionId: import("zod").ZodString;
        }, import("zod/v4/core").$strict>], "kind">;
    }];
    readonly model: {
        readonly services: readonly [];
        readonly events: readonly [];
        readonly objects: readonly [];
    };
    readonly invocations: readonly [{
        readonly id: "@kirkchinese/dsh-citeciter#citeciter/request";
        readonly service: "citeciter";
        readonly namespace: "citeciter";
        readonly method: "request";
        readonly invocation: {
            readonly kind: "direct";
        };
        readonly parameters: readonly [{
            readonly name: "rawRequest";
            readonly wire: "rawRequest";
            readonly source: "json";
            readonly codec: {
                readonly mode: "strict";
                readonly typeSymbol: "@kirkchinese/dsh-citeciter#CiteCiterRequest";
                readonly schema: import("zod").ZodDiscriminatedUnion<[import("zod").ZodObject<{
                    action: import("zod").ZodLiteral<"create">;
                    citation: import("zod").ZodObject<{
                        sourceSessionId: import("zod").ZodString;
                        anchorSeq: import("zod").ZodNumber;
                        startOffset: import("zod").ZodNumber;
                        endOffset: import("zod").ZodNumber;
                        sourceText: import("zod").ZodString;
                        displayText: import("zod").ZodString;
                        prefixText: import("zod").ZodString;
                        suffixText: import("zod").ZodString;
                        selectionFingerprint: import("zod").ZodString;
                    }, import("zod/v4/core").$strict>;
                    question: import("zod").ZodString;
                    mode: import("zod").ZodEnum<{
                        observer: "observer";
                        "exact-fork": "exact-fork";
                        "exact-when-available": "exact-when-available";
                    }>;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    action: import("zod").ZodLiteral<"list">;
                    sourceSessionId: import("zod").ZodString;
                    includeArchived: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    action: import("zod").ZodLiteral<"get">;
                    topicSessionId: import("zod").ZodString;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    action: import("zod").ZodLiteral<"ask">;
                    topicSessionId: import("zod").ZodString;
                    question: import("zod").ZodString;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    action: import("zod").ZodLiteral<"stop">;
                    topicSessionId: import("zod").ZodString;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    action: import("zod").ZodLiteral<"rename">;
                    topicSessionId: import("zod").ZodString;
                    title: import("zod").ZodString;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    action: import("zod").ZodLiteral<"archive">;
                    topicSessionId: import("zod").ZodString;
                    archived: import("zod").ZodBoolean;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    action: import("zod").ZodLiteral<"delete">;
                    topicSessionId: import("zod").ZodString;
                    confirmSessionId: import("zod").ZodString;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    action: import("zod").ZodLiteral<"models">;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    action: import("zod").ZodLiteral<"select-model">;
                    topicSessionId: import("zod").ZodString;
                    provider: import("zod").ZodString;
                    model: import("zod").ZodString;
                    reasoningEffort: import("zod").ZodNullable<import("zod").ZodString>;
                }, import("zod/v4/core").$strict>], "action">;
            };
        }];
        readonly result: {
            readonly mode: "strict";
            readonly typeSymbol: "@kirkchinese/dsh-citeciter#CiteCiterResponse";
            readonly schema: import("zod").ZodDiscriminatedUnion<[import("zod").ZodObject<{
                kind: import("zod").ZodLiteral<"topic">;
                topic: import("zod").ZodObject<{
                    topic: import("zod").ZodObject<{
                        topicId: import("zod").ZodNumber;
                        sessionId: import("zod").ZodString;
                        sourceSessionId: import("zod").ZodString;
                        mode: import("zod").ZodEnum<{
                            observer: "observer";
                            "exact-fork": "exact-fork";
                        }>;
                        citation: import("zod").ZodObject<{
                            sourceSessionId: import("zod").ZodString;
                            anchorSeq: import("zod").ZodNumber;
                            startOffset: import("zod").ZodNumber;
                            endOffset: import("zod").ZodNumber;
                            sourceText: import("zod").ZodString;
                            displayText: import("zod").ZodString;
                            prefixText: import("zod").ZodString;
                            suffixText: import("zod").ZodString;
                            selectionFingerprint: import("zod").ZodString;
                            schemaVersion: import("zod").ZodLiteral<3>;
                            createdAt: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        title: import("zod").ZodString;
                        titlePending: import("zod").ZodBoolean;
                        createdAt: import("zod").ZodNumber;
                        updatedAt: import("zod").ZodNumber;
                        archived: import("zod").ZodBoolean;
                        running: import("zod").ZodBoolean;
                        sourceAvailable: import("zod").ZodBoolean;
                        observedThroughSeq: import("zod").ZodNullable<import("zod").ZodNumber>;
                        modelConfig: import("zod").ZodObject<{
                            provider: import("zod").ZodString;
                            model: import("zod").ZodString;
                            reasoningEffort: import("zod").ZodOptional<import("zod").ZodString>;
                            temperature: import("zod").ZodOptional<import("zod").ZodNumber>;
                            maxTokens: import("zod").ZodOptional<import("zod").ZodNumber>;
                            stop: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
                        }, import("zod/v4/core").$strict>;
                    }, import("zod/v4/core").$strict>;
                    messages: import("zod").ZodArray<import("zod").ZodObject<{
                        id: import("zod").ZodString;
                        seq: import("zod").ZodNumber;
                        role: import("zod").ZodEnum<{
                            error: "error";
                            user: "user";
                            assistant: "assistant";
                        }>;
                        text: import("zod").ZodString;
                        reasoning: import("zod").ZodNullable<import("zod").ZodString>;
                        streaming: import("zod").ZodBoolean;
                    }, import("zod/v4/core").$strict>>;
                    error: import("zod").ZodNullable<import("zod").ZodString>;
                }, import("zod/v4/core").$strict>;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                kind: import("zod").ZodLiteral<"topics">;
                topics: import("zod").ZodArray<import("zod").ZodObject<{
                    topicId: import("zod").ZodNumber;
                    sessionId: import("zod").ZodString;
                    sourceSessionId: import("zod").ZodString;
                    mode: import("zod").ZodEnum<{
                        observer: "observer";
                        "exact-fork": "exact-fork";
                    }>;
                    citation: import("zod").ZodObject<{
                        sourceSessionId: import("zod").ZodString;
                        anchorSeq: import("zod").ZodNumber;
                        startOffset: import("zod").ZodNumber;
                        endOffset: import("zod").ZodNumber;
                        sourceText: import("zod").ZodString;
                        displayText: import("zod").ZodString;
                        prefixText: import("zod").ZodString;
                        suffixText: import("zod").ZodString;
                        selectionFingerprint: import("zod").ZodString;
                        schemaVersion: import("zod").ZodLiteral<3>;
                        createdAt: import("zod").ZodNumber;
                    }, import("zod/v4/core").$strict>;
                    title: import("zod").ZodString;
                    titlePending: import("zod").ZodBoolean;
                    createdAt: import("zod").ZodNumber;
                    updatedAt: import("zod").ZodNumber;
                    archived: import("zod").ZodBoolean;
                    running: import("zod").ZodBoolean;
                    sourceAvailable: import("zod").ZodBoolean;
                    observedThroughSeq: import("zod").ZodNullable<import("zod").ZodNumber>;
                    modelConfig: import("zod").ZodObject<{
                        provider: import("zod").ZodString;
                        model: import("zod").ZodString;
                        reasoningEffort: import("zod").ZodOptional<import("zod").ZodString>;
                        temperature: import("zod").ZodOptional<import("zod").ZodNumber>;
                        maxTokens: import("zod").ZodOptional<import("zod").ZodNumber>;
                        stop: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
                    }, import("zod/v4/core").$strict>;
                }, import("zod/v4/core").$strict>>;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                kind: import("zod").ZodLiteral<"models">;
                providers: import("zod").ZodArray<import("zod").ZodObject<{
                    id: import("zod").ZodString;
                    name: import("zod").ZodString;
                    models: import("zod").ZodArray<import("zod").ZodObject<{
                        id: import("zod").ZodString;
                        name: import("zod").ZodString;
                        description: import("zod").ZodOptional<import("zod").ZodString>;
                        reasoningEfforts: import("zod").ZodArray<import("zod").ZodObject<{
                            id: import("zod").ZodString;
                            name: import("zod").ZodString;
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict>>;
                }, import("zod/v4/core").$strict>>;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                kind: import("zod").ZodLiteral<"deleted">;
                sessionId: import("zod").ZodString;
            }, import("zod/v4/core").$strict>], "kind">;
        };
        readonly sourceLocation: {
            readonly file: "src/index.ts";
            readonly line: 63;
            readonly column: 3;
        };
    }];
};
export default TYPERT;

/** Strict root-scoped Topic command shared by Host and browser manifests. */
export declare const citeCiterRequestDescriptor: {
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
            readonly schema: import("zod").ZodUnion<readonly [import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                action: import("zod").ZodLiteral<"create">;
                requestId: import("zod").ZodString;
                sourceSessionId: import("zod").ZodString;
                question: import("zod").ZodString;
                mode: import("zod").ZodLiteral<"observer">;
                scenario: import("zod").ZodOptional<import("zod").ZodEnum<{
                    qa: "qa";
                    present: "present";
                }>>;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                action: import("zod").ZodLiteral<"create">;
                requestId: import("zod").ZodString;
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
                scenario: import("zod").ZodOptional<import("zod").ZodEnum<{
                    qa: "qa";
                    present: "present";
                    read: "read";
                    investigate: "investigate";
                }>>;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                action: import("zod").ZodLiteral<"create">;
                requestId: import("zod").ZodString;
                selectionClaim: import("zod").ZodObject<{
                    sourceSessionId: import("zod").ZodString;
                    anchorSeq: import("zod").ZodNumber;
                    displayText: import("zod").ZodString;
                    sourceHintText: import("zod").ZodOptional<import("zod").ZodString>;
                    prefixText: import("zod").ZodString;
                    suffixText: import("zod").ZodString;
                }, import("zod/v4/core").$strict>;
                question: import("zod").ZodString;
                mode: import("zod").ZodEnum<{
                    observer: "observer";
                    "exact-fork": "exact-fork";
                    "exact-when-available": "exact-when-available";
                }>;
                scenario: import("zod").ZodOptional<import("zod").ZodEnum<{
                    qa: "qa";
                    present: "present";
                    read: "read";
                    investigate: "investigate";
                }>>;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                action: import("zod").ZodLiteral<"create">;
                requestId: import("zod").ZodString;
                toolClaim: import("zod").ZodObject<{
                    sourceSessionId: import("zod").ZodString;
                    callId: import("zod").ZodString;
                    displayText: import("zod").ZodString;
                    projection: import("zod").ZodOptional<import("zod").ZodEnum<{
                        "result-text": "result-text";
                        terminal: "terminal";
                        diff: "diff";
                    }>>;
                }, import("zod/v4/core").$strict>;
                question: import("zod").ZodString;
                mode: import("zod").ZodEnum<{
                    observer: "observer";
                    "exact-fork": "exact-fork";
                    "exact-when-available": "exact-when-available";
                }>;
                scenario: import("zod").ZodOptional<import("zod").ZodEnum<{
                    qa: "qa";
                    present: "present";
                    read: "read";
                    investigate: "investigate";
                }>>;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                action: import("zod").ZodLiteral<"create">;
                requestId: import("zod").ZodString;
                documentClaim: import("zod").ZodObject<{
                    sourceSessionId: import("zod").ZodString;
                    documentId: import("zod").ZodString;
                    displayText: import("zod").ZodString;
                    prefixText: import("zod").ZodString;
                    suffixText: import("zod").ZodString;
                }, import("zod/v4/core").$strict>;
                question: import("zod").ZodString;
                mode: import("zod").ZodEnum<{
                    observer: "observer";
                    "exact-fork": "exact-fork";
                    "exact-when-available": "exact-when-available";
                }>;
                scenario: import("zod").ZodOptional<import("zod").ZodEnum<{
                    qa: "qa";
                    present: "present";
                    read: "read";
                    investigate: "investigate";
                }>>;
            }, import("zod/v4/core").$strict>]>, import("zod").ZodDiscriminatedUnion<[import("zod").ZodObject<{
                action: import("zod").ZodLiteral<"list">;
                sourceSessionId: import("zod").ZodString;
                includeArchived: import("zod").ZodOptional<import("zod").ZodBoolean>;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                action: import("zod").ZodLiteral<"get">;
                topicSessionId: import("zod").ZodString;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                action: import("zod").ZodLiteral<"ask">;
                requestId: import("zod").ZodOptional<import("zod").ZodString>;
                topicSessionId: import("zod").ZodString;
                question: import("zod").ZodString;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                action: import("zod").ZodLiteral<"stop">;
                topicSessionId: import("zod").ZodString;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                action: import("zod").ZodLiteral<"answer-question">;
                topicSessionId: import("zod").ZodString;
                key: import("zod").ZodString;
                answer: import("zod").ZodObject<{
                    answers: import("zod").ZodArray<import("zod").ZodObject<{
                        id: import("zod").ZodString;
                        selected: import("zod").ZodArray<import("zod").ZodString>;
                        custom: import("zod").ZodOptional<import("zod").ZodString>;
                    }, import("zod/v4/core").$strict>>;
                }, import("zod/v4/core").$strict>;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                action: import("zod").ZodLiteral<"cancel-question">;
                topicSessionId: import("zod").ZodString;
                key: import("zod").ZodString;
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
                action: import("zod").ZodLiteral<"set-model-route">;
                topicSessionId: import("zod").ZodString;
                provider: import("zod").ZodString;
                model: import("zod").ZodString;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                action: import("zod").ZodLiteral<"set-reasoning-effort">;
                topicSessionId: import("zod").ZodString;
                reasoningEffort: import("zod").ZodNullable<import("zod").ZodString>;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                action: import("zod").ZodLiteral<"select-model">;
                topicSessionId: import("zod").ZodString;
                provider: import("zod").ZodString;
                model: import("zod").ZodString;
                reasoningEffort: import("zod").ZodNullable<import("zod").ZodString>;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                action: import("zod").ZodLiteral<"document-import">;
                requestId: import("zod").ZodOptional<import("zod").ZodString>;
                title: import("zod").ZodString;
                format: import("zod").ZodEnum<{
                    text: "text";
                    markdown: "markdown";
                }>;
                content: import("zod").ZodString;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                action: import("zod").ZodLiteral<"documents">;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                action: import("zod").ZodLiteral<"document-get">;
                documentId: import("zod").ZodString;
            }, import("zod/v4/core").$strict>], "action">]>;
        };
    }];
    readonly cancellation: {
        readonly parameter: "signal";
    };
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
                    scenario: import("zod").ZodEnum<{
                        qa: "qa";
                        present: "present";
                        read: "read";
                        investigate: "investigate";
                    }>;
                    documentId: import("zod").ZodNullable<import("zod").ZodString>;
                    citation: import("zod").ZodNullable<import("zod").ZodObject<{
                        entry: import("zod").ZodDiscriminatedUnion<[import("zod").ZodObject<{
                            kind: import("zod").ZodLiteral<"assistant-message">;
                            anchorSeq: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            kind: import("zod").ZodLiteral<"tool-result">;
                            anchorSeq: import("zod").ZodNumber;
                            callId: import("zod").ZodString;
                            toolName: import("zod").ZodString;
                            projection: import("zod").ZodEnum<{
                                "result-text": "result-text";
                                terminal: "terminal";
                                diff: "diff";
                            }>;
                            fileIndex: import("zod").ZodOptional<import("zod").ZodNumber>;
                            side: import("zod").ZodOptional<import("zod").ZodEnum<{
                                old: "old";
                                new: "new";
                            }>>;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            kind: import("zod").ZodLiteral<"document-range">;
                            documentId: import("zod").ZodString;
                            startOffset: import("zod").ZodNumber;
                            endOffset: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>], "kind">;
                        selectionFingerprint: import("zod").ZodString;
                        createdAt: import("zod").ZodNumber;
                        sourceSessionId: import("zod").ZodString;
                        anchorSeq: import("zod").ZodNumber;
                        startOffset: import("zod").ZodNumber;
                        endOffset: import("zod").ZodNumber;
                        sourceText: import("zod").ZodString;
                        displayText: import("zod").ZodString;
                        prefixText: import("zod").ZodString;
                        suffixText: import("zod").ZodString;
                        schemaVersion: import("zod").ZodLiteral<4>;
                    }, import("zod/v4/core").$strict>>;
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
                messages: import("zod").ZodArray<import("zod").ZodDiscriminatedUnion<[import("zod").ZodObject<{
                    role: import("zod").ZodLiteral<"user">;
                    text: import("zod").ZodString;
                    id: import("zod").ZodString;
                    seq: import("zod").ZodNumber;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    role: import("zod").ZodLiteral<"assistant">;
                    text: import("zod").ZodString;
                    reasoning: import("zod").ZodNullable<import("zod").ZodString>;
                    streaming: import("zod").ZodBoolean;
                    id: import("zod").ZodString;
                    seq: import("zod").ZodNumber;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    role: import("zod").ZodLiteral<"context">;
                    label: import("zod").ZodString;
                    text: import("zod").ZodString;
                    id: import("zod").ZodString;
                    seq: import("zod").ZodNumber;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    role: import("zod").ZodLiteral<"tool">;
                    name: import("zod").ZodString;
                    arguments: import("zod").ZodString;
                    result: import("zod").ZodNullable<import("zod").ZodString>;
                    isError: import("zod").ZodBoolean;
                    running: import("zod").ZodBoolean;
                    id: import("zod").ZodString;
                    seq: import("zod").ZodNumber;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    role: import("zod").ZodLiteral<"error">;
                    text: import("zod").ZodString;
                    bodyRetained: import("zod").ZodBoolean;
                    attempt: import("zod").ZodNumber;
                    status: import("zod").ZodEnum<{
                        failed: "failed";
                        stopped: "stopped";
                    }>;
                    id: import("zod").ZodString;
                    seq: import("zod").ZodNumber;
                }, import("zod/v4/core").$strict>], "role">>;
                pendingQuestion: import("zod").ZodNullable<import("zod").ZodObject<{
                    key: import("zod").ZodString;
                    questions: import("zod").ZodArray<import("zod").ZodObject<{
                        id: import("zod").ZodString;
                        question: import("zod").ZodString;
                        header: import("zod").ZodOptional<import("zod").ZodString>;
                        options: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                            label: import("zod").ZodString;
                            description: import("zod").ZodOptional<import("zod").ZodString>;
                        }, import("zod/v4/core").$strict>>>;
                        multiSelect: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    }, import("zod/v4/core").$strict>>;
                }, import("zod/v4/core").$strict>>;
                error: import("zod").ZodNullable<import("zod").ZodString>;
                board: import("zod").ZodOptional<import("zod").ZodObject<{
                    version: import("zod").ZodLiteral<4>;
                    revision: import("zod").ZodNumber;
                    elements: import("zod").ZodArray<import("zod").ZodObject<{
                        id: import("zod").ZodString;
                        kind: import("zod").ZodEnum<{
                            text: "text";
                            markdown: "markdown";
                            math: "math";
                            svg: "svg";
                            html: "html";
                            image: "image";
                            table: "table";
                        }>;
                        content: import("zod").ZodString;
                        x: import("zod").ZodNumber;
                        y: import("zod").ZodNumber;
                        w: import("zod").ZodNumber;
                        h: import("zod").ZodNumber;
                        style: import("zod").ZodObject<{
                            color: import("zod").ZodOptional<import("zod").ZodString>;
                            fontSize: import("zod").ZodOptional<import("zod").ZodString>;
                        }, import("zod/v4/core").$strict>;
                        focused: import("zod").ZodBoolean;
                        animation: import("zod").ZodOptional<import("zod").ZodObject<{
                            name: import("zod").ZodEnum<{
                                "fade-in": "fade-in";
                                "slide-in": "slide-in";
                                pulse: "pulse";
                                highlight: "highlight";
                            }>;
                            durationMs: import("zod").ZodNumber;
                            iterations: import("zod").ZodNumber;
                            run: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict>>;
                    invalid: import("zod").ZodNumber;
                }, import("zod/v4/core").$strict>>;
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
                scenario: import("zod").ZodEnum<{
                    qa: "qa";
                    present: "present";
                    read: "read";
                    investigate: "investigate";
                }>;
                documentId: import("zod").ZodNullable<import("zod").ZodString>;
                citation: import("zod").ZodNullable<import("zod").ZodObject<{
                    entry: import("zod").ZodDiscriminatedUnion<[import("zod").ZodObject<{
                        kind: import("zod").ZodLiteral<"assistant-message">;
                        anchorSeq: import("zod").ZodNumber;
                    }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                        kind: import("zod").ZodLiteral<"tool-result">;
                        anchorSeq: import("zod").ZodNumber;
                        callId: import("zod").ZodString;
                        toolName: import("zod").ZodString;
                        projection: import("zod").ZodEnum<{
                            "result-text": "result-text";
                            terminal: "terminal";
                            diff: "diff";
                        }>;
                        fileIndex: import("zod").ZodOptional<import("zod").ZodNumber>;
                        side: import("zod").ZodOptional<import("zod").ZodEnum<{
                            old: "old";
                            new: "new";
                        }>>;
                    }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                        kind: import("zod").ZodLiteral<"document-range">;
                        documentId: import("zod").ZodString;
                        startOffset: import("zod").ZodNumber;
                        endOffset: import("zod").ZodNumber;
                    }, import("zod/v4/core").$strict>], "kind">;
                    selectionFingerprint: import("zod").ZodString;
                    createdAt: import("zod").ZodNumber;
                    sourceSessionId: import("zod").ZodString;
                    anchorSeq: import("zod").ZodNumber;
                    startOffset: import("zod").ZodNumber;
                    endOffset: import("zod").ZodNumber;
                    sourceText: import("zod").ZodString;
                    displayText: import("zod").ZodString;
                    prefixText: import("zod").ZodString;
                    suffixText: import("zod").ZodString;
                    schemaVersion: import("zod").ZodLiteral<4>;
                }, import("zod/v4/core").$strict>>;
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
            sourceSessionId: import("zod").ZodString;
            topicId: import("zod").ZodNumber;
            cleanup: import("zod").ZodEnum<{
                complete: "complete";
                pending: "pending";
            }>;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            kind: import("zod").ZodLiteral<"document">;
            document: import("zod").ZodObject<{
                documentId: import("zod").ZodString;
                title: import("zod").ZodString;
                format: import("zod").ZodEnum<{
                    text: "text";
                    markdown: "markdown";
                }>;
                size: import("zod").ZodNumber;
                importedAt: import("zod").ZodNumber;
            }, import("zod/v4/core").$strict>;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            kind: import("zod").ZodLiteral<"documents">;
            documents: import("zod").ZodArray<import("zod").ZodObject<{
                documentId: import("zod").ZodString;
                title: import("zod").ZodString;
                format: import("zod").ZodEnum<{
                    text: "text";
                    markdown: "markdown";
                }>;
                size: import("zod").ZodNumber;
                importedAt: import("zod").ZodNumber;
            }, import("zod/v4/core").$strict>>;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            kind: import("zod").ZodLiteral<"document-content">;
            document: import("zod").ZodObject<{
                documentId: import("zod").ZodString;
                title: import("zod").ZodString;
                format: import("zod").ZodEnum<{
                    text: "text";
                    markdown: "markdown";
                }>;
                content: import("zod").ZodString;
                truncated: import("zod").ZodBoolean;
            }, import("zod/v4/core").$strict>;
        }, import("zod/v4/core").$strict>], "kind">;
    };
    readonly sourceLocation: {
        readonly file: "src/index.ts";
        readonly line: 127;
        readonly column: 3;
    };
};
/** Strict root-scoped read-only update check shared by Host and browser manifests. */
export declare const updateCheckDescriptor: {
    readonly id: "@kirkchinese/dsh-citeciter#citeciter/checkUpdate";
    readonly service: "citeciter";
    readonly namespace: "citeciter";
    readonly method: "checkUpdate";
    readonly invocation: {
        readonly kind: "direct";
    };
    readonly parameters: readonly [];
    readonly cancellation: {
        readonly parameter: "signal";
    };
    readonly result: {
        readonly mode: "strict";
        readonly typeSymbol: "@kirkchinese/dsh-citeciter#UpdateCheckResponse";
        readonly schema: import("zod").ZodDiscriminatedUnion<[import("zod").ZodObject<{
            kind: import("zod").ZodLiteral<"success">;
            installedVersion: import("zod").ZodString;
            latestVersion: import("zod").ZodString;
            updateAvailable: import("zod").ZodBoolean;
            checkedAt: import("zod").ZodNumber;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            kind: import("zod").ZodLiteral<"error">;
            code: import("zod").ZodEnum<{
                "installed-version-invalid": "installed-version-invalid";
                "registry-timeout": "registry-timeout";
                "registry-network": "registry-network";
                "registry-http": "registry-http";
                "registry-response-too-large": "registry-response-too-large";
                "registry-response-invalid": "registry-response-invalid";
                "registry-version-invalid": "registry-version-invalid";
            }>;
            checkedAt: import("zod").ZodNumber;
        }, import("zod/v4/core").$strict>], "kind">;
    };
    readonly sourceLocation: {
        readonly file: "src/index.ts";
        readonly line: 134;
        readonly column: 3;
    };
};

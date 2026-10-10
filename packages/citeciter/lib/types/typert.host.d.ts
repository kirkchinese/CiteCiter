/** Handwritten strict Host contribution matching the single Remote decorator. */
export declare const TYPERT: {
    readonly package: "@kirkchinese/dsh-citeciter";
    readonly face: "host";
    readonly schemas: readonly [{
        name: string;
        create: () => import("zod").ZodObject<{
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
        name: string;
        create: () => import("zod").ZodObject<{
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
                    new: "new";
                    old: "old";
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
        }, import("zod/v4/core").$strict>;
    }, {
        name: string;
        create: () => import("zod").ZodObject<{
            modelSelectionRequired: import("zod").ZodOptional<import("zod").ZodBoolean>;
            permission: import("zod").ZodOptional<import("zod").ZodEnum<{
                "read-only": "read-only";
                "workspace-write": "workspace-write";
                "danger-full-access": "danger-full-access";
            }>>;
            topicId: import("zod").ZodNumber;
            sessionId: import("zod").ZodString;
            sourceSessionId: import("zod").ZodString;
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
                        new: "new";
                        old: "old";
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
    }, {
        name: string;
        create: () => import("zod").ZodObject<{
            captureId: import("zod").ZodOptional<import("zod").ZodString>;
            documentTitle: import("zod").ZodOptional<import("zod").ZodString>;
            topic: import("zod").ZodObject<{
                modelSelectionRequired: import("zod").ZodOptional<import("zod").ZodBoolean>;
                permission: import("zod").ZodOptional<import("zod").ZodEnum<{
                    "read-only": "read-only";
                    "workspace-write": "workspace-write";
                    "danger-full-access": "danger-full-access";
                }>>;
                topicId: import("zod").ZodNumber;
                sessionId: import("zod").ZodString;
                sourceSessionId: import("zod").ZodString;
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
                            new: "new";
                            old: "old";
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
                questionReply: import("zod").ZodOptional<import("zod").ZodObject<{
                    callId: import("zod").ZodString;
                    items: import("zod").ZodArray<import("zod").ZodObject<{
                        id: import("zod").ZodString;
                        question: import("zod").ZodString;
                        header: import("zod").ZodOptional<import("zod").ZodString>;
                        values: import("zod").ZodArray<import("zod").ZodString>;
                    }, import("zod/v4/core").$strict>>;
                }, import("zod/v4/core").$strict>>;
                attachments: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                    kind: import("zod").ZodEnum<{
                        file: "file";
                        image: "image";
                    }>;
                    id: import("zod").ZodString;
                    name: import("zod").ZodString;
                }, import("zod/v4/core").$strict>>>;
                text: import("zod").ZodString;
                id: import("zod").ZodString;
                seq: import("zod").ZodNumber;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                role: import("zod").ZodLiteral<"assistant">;
                renderKey: import("zod").ZodOptional<import("zod").ZodString>;
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
                questionReply: import("zod").ZodOptional<import("zod").ZodObject<{
                    callId: import("zod").ZodString;
                    items: import("zod").ZodArray<import("zod").ZodObject<{
                        id: import("zod").ZodString;
                        question: import("zod").ZodString;
                        header: import("zod").ZodOptional<import("zod").ZodString>;
                        values: import("zod").ZodArray<import("zod").ZodString>;
                    }, import("zod/v4/core").$strict>>;
                }, import("zod/v4/core").$strict>>;
                attachments: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                    kind: import("zod").ZodEnum<{
                        file: "file";
                        image: "image";
                    }>;
                    id: import("zod").ZodString;
                    name: import("zod").ZodString;
                }, import("zod/v4/core").$strict>>>;
                name: import("zod").ZodString;
                arguments: import("zod").ZodString;
                result: import("zod").ZodNullable<import("zod").ZodString>;
                isError: import("zod").ZodBoolean;
                errorCode: import("zod").ZodOptional<import("zod").ZodEnum<{
                    ASK_CANCELLED: "ASK_CANCELLED";
                    ASK_ABORTED: "ASK_ABORTED";
                }>>;
                approvalOutcome: import("zod").ZodOptional<import("zod").ZodLiteral<"rejected">>;
                interruptionOutcome: import("zod").ZodOptional<import("zod").ZodLiteral<"interrupted">>;
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
                    detail: import("zod").ZodOptional<import("zod").ZodString>;
                    options: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                        label: import("zod").ZodString;
                        description: import("zod").ZodOptional<import("zod").ZodString>;
                    }, import("zod/v4/core").$strict>>>;
                    multiSelect: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod/v4/core").$strict>>;
                state: import("zod").ZodOptional<import("zod").ZodEnum<{
                    open: "open";
                    continued: "continued";
                }>>;
                callId: import("zod").ZodOptional<import("zod").ZodString>;
                timed: import("zod").ZodOptional<import("zod").ZodBoolean>;
                blocking: import("zod").ZodOptional<import("zod").ZodBoolean>;
            }, import("zod/v4/core").$strict>>;
            pendingQuestions: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                key: import("zod").ZodString;
                questions: import("zod").ZodArray<import("zod").ZodObject<{
                    id: import("zod").ZodString;
                    question: import("zod").ZodString;
                    header: import("zod").ZodOptional<import("zod").ZodString>;
                    detail: import("zod").ZodOptional<import("zod").ZodString>;
                    options: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                        label: import("zod").ZodString;
                        description: import("zod").ZodOptional<import("zod").ZodString>;
                    }, import("zod/v4/core").$strict>>>;
                    multiSelect: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod/v4/core").$strict>>;
                state: import("zod").ZodOptional<import("zod").ZodEnum<{
                    open: "open";
                    continued: "continued";
                }>>;
                callId: import("zod").ZodOptional<import("zod").ZodString>;
                timed: import("zod").ZodOptional<import("zod").ZodBoolean>;
                blocking: import("zod").ZodOptional<import("zod").ZodBoolean>;
            }, import("zod/v4/core").$strict>>>;
            error: import("zod").ZodNullable<import("zod").ZodString>;
            board: import("zod").ZodOptional<import("zod").ZodObject<{
                version: import("zod").ZodLiteral<4>;
                revision: import("zod").ZodNumber;
                elements: import("zod").ZodArray<import("zod").ZodObject<{
                    id: import("zod").ZodString;
                    kind: import("zod").ZodEnum<{
                        text: "text";
                        image: "image";
                        markdown: "markdown";
                        math: "math";
                        svg: "svg";
                        html: "html";
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
    }, {
        name: string;
        create: () => import("zod").ZodUnion<readonly [import("zod").ZodUnion<readonly [import("zod").ZodObject<{
            sourceSessionId: import("zod").ZodString;
            action: import("zod").ZodLiteral<"create">;
            modelRoute: import("zod").ZodOptional<import("zod").ZodObject<{
                provider: import("zod").ZodString;
                model: import("zod").ZodString;
            }, import("zod/v4/core").$strict>>;
            requestId: import("zod").ZodString;
            question: import("zod").ZodString;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            selectionClaim: import("zod").ZodObject<{
                sourceSessionId: import("zod").ZodString;
                anchorSeq: import("zod").ZodNumber;
                displayText: import("zod").ZodString;
                sourceHintText: import("zod").ZodOptional<import("zod").ZodString>;
                prefixText: import("zod").ZodString;
                suffixText: import("zod").ZodString;
            }, import("zod/v4/core").$strict>;
            action: import("zod").ZodLiteral<"create">;
            modelRoute: import("zod").ZodOptional<import("zod").ZodObject<{
                provider: import("zod").ZodString;
                model: import("zod").ZodString;
            }, import("zod/v4/core").$strict>>;
            requestId: import("zod").ZodString;
            question: import("zod").ZodString;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
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
            action: import("zod").ZodLiteral<"create">;
            modelRoute: import("zod").ZodOptional<import("zod").ZodObject<{
                provider: import("zod").ZodString;
                model: import("zod").ZodString;
            }, import("zod/v4/core").$strict>>;
            requestId: import("zod").ZodString;
            question: import("zod").ZodString;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            documentClaim: import("zod").ZodObject<{
                sourceSessionId: import("zod").ZodString;
                documentId: import("zod").ZodString;
                displayText: import("zod").ZodString;
                prefixText: import("zod").ZodString;
                suffixText: import("zod").ZodString;
            }, import("zod/v4/core").$strict>;
            action: import("zod").ZodLiteral<"create">;
            modelRoute: import("zod").ZodOptional<import("zod").ZodObject<{
                provider: import("zod").ZodString;
                model: import("zod").ZodString;
            }, import("zod/v4/core").$strict>>;
            requestId: import("zod").ZodString;
            question: import("zod").ZodString;
        }, import("zod/v4/core").$strict>]>, import("zod").ZodDiscriminatedUnion<[import("zod").ZodObject<{
            action: import("zod").ZodLiteral<"question-draft-get">;
            topicSessionId: import("zod").ZodString;
            key: import("zod").ZodString;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            action: import("zod").ZodLiteral<"question-draft-save">;
            topicSessionId: import("zod").ZodString;
            key: import("zod").ZodString;
            state: import("zod").ZodObject<{
                version: import("zod").ZodLiteral<1>;
                revision: import("zod").ZodNumber;
                content: import("zod").ZodObject<{
                    answers: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodObject<{
                        selected: import("zod").ZodArray<import("zod").ZodString>;
                        custom: import("zod").ZodString;
                    }, import("zod/v4/core").$strict>>;
                    page: import("zod").ZodNumber;
                    edited: import("zod").ZodBoolean;
                    held: import("zod").ZodBoolean;
                }, import("zod/v4/core").$strict>;
            }, import("zod/v4/core").$strict>;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            action: import("zod").ZodLiteral<"draft-get">;
            topicSessionId: import("zod").ZodString;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            action: import("zod").ZodLiteral<"draft-save">;
            topicSessionId: import("zod").ZodString;
            state: import("zod").ZodObject<{
                version: import("zod").ZodLiteral<1>;
                revision: import("zod").ZodNumber;
                content: import("zod").ZodObject<{
                    text: import("zod").ZodString;
                    references: import("zod").ZodArray<import("zod").ZodObject<{
                        id: import("zod").ZodString;
                        kind: import("zod").ZodEnum<{
                            source: "source";
                            excerpt: "excerpt";
                            board: "board";
                        }>;
                        label: import("zod").ZodString;
                        content: import("zod").ZodString;
                        address: import("zod").ZodOptional<import("zod").ZodString>;
                    }, import("zod/v4/core").$strict>>;
                    files: import("zod").ZodArray<import("zod").ZodObject<{
                        id: import("zod").ZodUUID;
                        name: import("zod").ZodString;
                        type: import("zod").ZodString;
                        size: import("zod").ZodNumber;
                        lastModified: import("zod").ZodNumber;
                    }, import("zod/v4/core").$strict>>;
                }, import("zod/v4/core").$strict>;
                pending: import("zod").ZodNullable<import("zod").ZodObject<{
                    requestId: import("zod").ZodUUID;
                    content: import("zod").ZodObject<{
                        text: import("zod").ZodString;
                        references: import("zod").ZodArray<import("zod").ZodObject<{
                            id: import("zod").ZodString;
                            kind: import("zod").ZodEnum<{
                                source: "source";
                                excerpt: "excerpt";
                                board: "board";
                            }>;
                            label: import("zod").ZodString;
                            content: import("zod").ZodString;
                            address: import("zod").ZodOptional<import("zod").ZodString>;
                        }, import("zod/v4/core").$strict>>;
                        files: import("zod").ZodArray<import("zod").ZodObject<{
                            id: import("zod").ZodUUID;
                            name: import("zod").ZodString;
                            type: import("zod").ZodString;
                            size: import("zod").ZodNumber;
                            lastModified: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict>;
                }, import("zod/v4/core").$strict>>;
            }, import("zod/v4/core").$strict>;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            action: import("zod").ZodLiteral<"draft-file-put">;
            topicSessionId: import("zod").ZodString;
            file: import("zod").ZodObject<{
                id: import("zod").ZodUUID;
                name: import("zod").ZodString;
                type: import("zod").ZodString;
                size: import("zod").ZodNumber;
                lastModified: import("zod").ZodNumber;
            }, import("zod/v4/core").$strict>;
            offset: import("zod").ZodNumber;
            data: import("zod").ZodString;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            action: import("zod").ZodLiteral<"draft-file-get">;
            topicSessionId: import("zod").ZodString;
            fileId: import("zod").ZodUUID;
            offset: import("zod").ZodNumber;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            action: import("zod").ZodLiteral<"list">;
            sourceSessionId: import("zod").ZodString;
            includeArchived: import("zod").ZodOptional<import("zod").ZodBoolean>;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            action: import("zod").ZodLiteral<"board-capture">;
            topicSessionId: import("zod").ZodString;
            id: import("zod").ZodString;
            png: import("zod").ZodOptional<import("zod").ZodString>;
            error: import("zod").ZodOptional<import("zod").ZodString>;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            action: import("zod").ZodLiteral<"board-capture-pending">;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            action: import("zod").ZodLiteral<"get">;
            topicSessionId: import("zod").ZodString;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            action: import("zod").ZodLiteral<"native-state">;
            topicSessionId: import("zod").ZodString;
            requestIds: import("zod").ZodArray<import("zod").ZodString>;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            action: import("zod").ZodLiteral<"native-attachment">;
            topicSessionId: import("zod").ZodString;
            attachmentId: import("zod").ZodString;
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
            draftRevision: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            action: import("zod").ZodLiteral<"cancel-question">;
            topicSessionId: import("zod").ZodString;
            key: import("zod").ZodString;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            action: import("zod").ZodLiteral<"timeout-question">;
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
            action: import("zod").ZodLiteral<"set-permission">;
            topicSessionId: import("zod").ZodString;
            mode: import("zod").ZodEnum<{
                "read-only": "read-only";
                "workspace-write": "workspace-write";
                "danger-full-access": "danger-full-access";
            }>;
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
            page: import("zod").ZodOptional<import("zod").ZodNumber>;
        }, import("zod/v4/core").$strict>], "action">]>;
    }, {
        name: string;
        create: () => import("zod").ZodDiscriminatedUnion<[import("zod").ZodObject<{
            kind: import("zod").ZodLiteral<"question-draft">;
            state: import("zod").ZodObject<{
                version: import("zod").ZodLiteral<1>;
                revision: import("zod").ZodNumber;
                content: import("zod").ZodObject<{
                    answers: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodObject<{
                        selected: import("zod").ZodArray<import("zod").ZodString>;
                        custom: import("zod").ZodString;
                    }, import("zod/v4/core").$strict>>;
                    page: import("zod").ZodNumber;
                    edited: import("zod").ZodBoolean;
                    held: import("zod").ZodBoolean;
                }, import("zod/v4/core").$strict>;
            }, import("zod/v4/core").$strict>;
            conflict: import("zod").ZodBoolean;
            closed: import("zod").ZodBoolean;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            kind: import("zod").ZodLiteral<"draft">;
            state: import("zod").ZodObject<{
                version: import("zod").ZodLiteral<1>;
                revision: import("zod").ZodNumber;
                content: import("zod").ZodObject<{
                    text: import("zod").ZodString;
                    references: import("zod").ZodArray<import("zod").ZodObject<{
                        id: import("zod").ZodString;
                        kind: import("zod").ZodEnum<{
                            source: "source";
                            excerpt: "excerpt";
                            board: "board";
                        }>;
                        label: import("zod").ZodString;
                        content: import("zod").ZodString;
                        address: import("zod").ZodOptional<import("zod").ZodString>;
                    }, import("zod/v4/core").$strict>>;
                    files: import("zod").ZodArray<import("zod").ZodObject<{
                        id: import("zod").ZodUUID;
                        name: import("zod").ZodString;
                        type: import("zod").ZodString;
                        size: import("zod").ZodNumber;
                        lastModified: import("zod").ZodNumber;
                    }, import("zod/v4/core").$strict>>;
                }, import("zod/v4/core").$strict>;
                pending: import("zod").ZodNullable<import("zod").ZodObject<{
                    requestId: import("zod").ZodUUID;
                    content: import("zod").ZodObject<{
                        text: import("zod").ZodString;
                        references: import("zod").ZodArray<import("zod").ZodObject<{
                            id: import("zod").ZodString;
                            kind: import("zod").ZodEnum<{
                                source: "source";
                                excerpt: "excerpt";
                                board: "board";
                            }>;
                            label: import("zod").ZodString;
                            content: import("zod").ZodString;
                            address: import("zod").ZodOptional<import("zod").ZodString>;
                        }, import("zod/v4/core").$strict>>;
                        files: import("zod").ZodArray<import("zod").ZodObject<{
                            id: import("zod").ZodUUID;
                            name: import("zod").ZodString;
                            type: import("zod").ZodString;
                            size: import("zod").ZodNumber;
                            lastModified: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict>;
                }, import("zod/v4/core").$strict>>;
            }, import("zod/v4/core").$strict>;
            conflict: import("zod").ZodBoolean;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            kind: import("zod").ZodLiteral<"draft-file-saved">;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            kind: import("zod").ZodLiteral<"draft-file">;
            data: import("zod").ZodString;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            kind: import("zod").ZodLiteral<"board-captures">;
            jobs: import("zod").ZodArray<import("zod").ZodObject<{
                id: import("zod").ZodString;
                sessionId: import("zod").ZodString;
                board: import("zod").ZodObject<{
                    version: import("zod").ZodLiteral<4>;
                    revision: import("zod").ZodNumber;
                    elements: import("zod").ZodArray<import("zod").ZodObject<{
                        id: import("zod").ZodString;
                        kind: import("zod").ZodEnum<{
                            text: "text";
                            image: "image";
                            markdown: "markdown";
                            math: "math";
                            svg: "svg";
                            html: "html";
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
                }, import("zod/v4/core").$strict>;
            }, import("zod/v4/core").$strict>>;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            kind: import("zod").ZodLiteral<"board-capture-accepted">;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            kind: import("zod").ZodLiteral<"native-state">;
            state: import("zod").ZodObject<{
                modelSelectionRequired: import("zod").ZodOptional<import("zod").ZodBoolean>;
                running: import("zod").ZodBoolean;
                blank: import("zod").ZodBoolean;
                error: import("zod").ZodNullable<import("zod").ZodString>;
                queue: import("zod").ZodArray<import("zod").ZodObject<{
                    id: import("zod").ZodString;
                    placement: import("zod").ZodEnum<{
                        queued: "queued";
                        steering: "steering";
                        context: "context";
                    }>;
                    rpcId: import("zod").ZodOptional<import("zod").ZodString>;
                    text: import("zod").ZodString;
                    attachments: import("zod").ZodArray<import("zod").ZodDiscriminatedUnion<[import("zod").ZodObject<{
                        type: import("zod").ZodLiteral<"image">;
                        attachment: import("zod").ZodPipe<import("zod").ZodObject<{
                            attachmentId: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<import("@deepseek-ai/dsh-attachment").AttachmentId, string>>;
                            mediaType: import("zod").ZodEnum<{
                                "image/png": "image/png";
                                "image/jpeg": "image/jpeg";
                                "image/webp": "image/webp";
                                "image/gif": "image/gif";
                            }>;
                            bytes: import("zod").ZodNumber;
                            width: import("zod").ZodNumber;
                            height: import("zod").ZodNumber;
                            name: import("zod").ZodOptional<import("zod").ZodString>;
                            originalDimensions: import("zod").ZodOptional<import("zod").ZodObject<{
                                width: import("zod").ZodNumber;
                                height: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strict>>;
                        }, import("zod/v4/core").$strict>, import("zod").ZodTransform<import("@deepseek-ai/dsh-attachment").ImageAttachmentRef, {
                            attachmentId: import("@deepseek-ai/dsh-attachment").AttachmentId;
                            mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
                            bytes: number;
                            width: number;
                            height: number;
                            name?: string | undefined;
                            originalDimensions?: {
                                width: number;
                                height: number;
                            } | undefined;
                        }>>;
                    }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                        type: import("zod").ZodLiteral<"file">;
                        attachment: import("zod").ZodObject<{
                            attachmentId: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<import("@deepseek-ai/dsh-attachment").AttachmentId, string>>;
                            name: import("zod").ZodString;
                            bytes: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                    }, import("zod/v4/core").$strict>], "type">>;
                }, import("zod/v4/core").$strict>>;
                receipts: import("zod").ZodArray<import("zod").ZodObject<{
                    requestId: import("zod").ZodString;
                    attachments: import("zod").ZodArray<import("zod").ZodDiscriminatedUnion<[import("zod").ZodObject<{
                        type: import("zod").ZodLiteral<"image">;
                        attachment: import("zod").ZodPipe<import("zod").ZodObject<{
                            attachmentId: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<import("@deepseek-ai/dsh-attachment").AttachmentId, string>>;
                            mediaType: import("zod").ZodEnum<{
                                "image/png": "image/png";
                                "image/jpeg": "image/jpeg";
                                "image/webp": "image/webp";
                                "image/gif": "image/gif";
                            }>;
                            bytes: import("zod").ZodNumber;
                            width: import("zod").ZodNumber;
                            height: import("zod").ZodNumber;
                            name: import("zod").ZodOptional<import("zod").ZodString>;
                            originalDimensions: import("zod").ZodOptional<import("zod").ZodObject<{
                                width: import("zod").ZodNumber;
                                height: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strict>>;
                        }, import("zod/v4/core").$strict>, import("zod").ZodTransform<import("@deepseek-ai/dsh-attachment").ImageAttachmentRef, {
                            attachmentId: import("@deepseek-ai/dsh-attachment").AttachmentId;
                            mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
                            bytes: number;
                            width: number;
                            height: number;
                            name?: string | undefined;
                            originalDimensions?: {
                                width: number;
                                height: number;
                            } | undefined;
                        }>>;
                    }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                        type: import("zod").ZodLiteral<"file">;
                        attachment: import("zod").ZodObject<{
                            attachmentId: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<import("@deepseek-ai/dsh-attachment").AttachmentId, string>>;
                            name: import("zod").ZodString;
                            bytes: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                    }, import("zod/v4/core").$strict>], "type">>;
                }, import("zod/v4/core").$strict>>;
            }, import("zod/v4/core").$strict>;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            kind: import("zod").ZodLiteral<"native-attachment">;
            attachment: import("zod").ZodUnion<readonly [import("zod").ZodPipe<import("zod").ZodObject<{
                attachmentId: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<import("@deepseek-ai/dsh-attachment").AttachmentId, string>>;
                mediaType: import("zod").ZodEnum<{
                    "image/png": "image/png";
                    "image/jpeg": "image/jpeg";
                    "image/webp": "image/webp";
                    "image/gif": "image/gif";
                }>;
                bytes: import("zod").ZodNumber;
                width: import("zod").ZodNumber;
                height: import("zod").ZodNumber;
                name: import("zod").ZodOptional<import("zod").ZodString>;
                originalDimensions: import("zod").ZodOptional<import("zod").ZodObject<{
                    width: import("zod").ZodNumber;
                    height: import("zod").ZodNumber;
                }, import("zod/v4/core").$strict>>;
            }, import("zod/v4/core").$strict>, import("zod").ZodTransform<import("@deepseek-ai/dsh-attachment").ImageAttachmentRef, {
                attachmentId: import("@deepseek-ai/dsh-attachment").AttachmentId;
                mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
                bytes: number;
                width: number;
                height: number;
                name?: string | undefined;
                originalDimensions?: {
                    width: number;
                    height: number;
                } | undefined;
            }>>, import("zod").ZodObject<{
                attachmentId: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<import("@deepseek-ai/dsh-attachment").AttachmentId, string>>;
                name: import("zod").ZodString;
                bytes: import("zod").ZodNumber;
            }, import("zod/v4/core").$strict>]>;
            data: import("zod").ZodString;
        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
            kind: import("zod").ZodLiteral<"topic">;
            topic: import("zod").ZodObject<{
                captureId: import("zod").ZodOptional<import("zod").ZodString>;
                documentTitle: import("zod").ZodOptional<import("zod").ZodString>;
                topic: import("zod").ZodObject<{
                    modelSelectionRequired: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    permission: import("zod").ZodOptional<import("zod").ZodEnum<{
                        "read-only": "read-only";
                        "workspace-write": "workspace-write";
                        "danger-full-access": "danger-full-access";
                    }>>;
                    topicId: import("zod").ZodNumber;
                    sessionId: import("zod").ZodString;
                    sourceSessionId: import("zod").ZodString;
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
                                new: "new";
                                old: "old";
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
                    questionReply: import("zod").ZodOptional<import("zod").ZodObject<{
                        callId: import("zod").ZodString;
                        items: import("zod").ZodArray<import("zod").ZodObject<{
                            id: import("zod").ZodString;
                            question: import("zod").ZodString;
                            header: import("zod").ZodOptional<import("zod").ZodString>;
                            values: import("zod").ZodArray<import("zod").ZodString>;
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict>>;
                    attachments: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                        kind: import("zod").ZodEnum<{
                            file: "file";
                            image: "image";
                        }>;
                        id: import("zod").ZodString;
                        name: import("zod").ZodString;
                    }, import("zod/v4/core").$strict>>>;
                    text: import("zod").ZodString;
                    id: import("zod").ZodString;
                    seq: import("zod").ZodNumber;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    role: import("zod").ZodLiteral<"assistant">;
                    renderKey: import("zod").ZodOptional<import("zod").ZodString>;
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
                    questionReply: import("zod").ZodOptional<import("zod").ZodObject<{
                        callId: import("zod").ZodString;
                        items: import("zod").ZodArray<import("zod").ZodObject<{
                            id: import("zod").ZodString;
                            question: import("zod").ZodString;
                            header: import("zod").ZodOptional<import("zod").ZodString>;
                            values: import("zod").ZodArray<import("zod").ZodString>;
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict>>;
                    attachments: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                        kind: import("zod").ZodEnum<{
                            file: "file";
                            image: "image";
                        }>;
                        id: import("zod").ZodString;
                        name: import("zod").ZodString;
                    }, import("zod/v4/core").$strict>>>;
                    name: import("zod").ZodString;
                    arguments: import("zod").ZodString;
                    result: import("zod").ZodNullable<import("zod").ZodString>;
                    isError: import("zod").ZodBoolean;
                    errorCode: import("zod").ZodOptional<import("zod").ZodEnum<{
                        ASK_CANCELLED: "ASK_CANCELLED";
                        ASK_ABORTED: "ASK_ABORTED";
                    }>>;
                    approvalOutcome: import("zod").ZodOptional<import("zod").ZodLiteral<"rejected">>;
                    interruptionOutcome: import("zod").ZodOptional<import("zod").ZodLiteral<"interrupted">>;
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
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        options: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                            label: import("zod").ZodString;
                            description: import("zod").ZodOptional<import("zod").ZodString>;
                        }, import("zod/v4/core").$strict>>>;
                        multiSelect: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    }, import("zod/v4/core").$strict>>;
                    state: import("zod").ZodOptional<import("zod").ZodEnum<{
                        open: "open";
                        continued: "continued";
                    }>>;
                    callId: import("zod").ZodOptional<import("zod").ZodString>;
                    timed: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    blocking: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod/v4/core").$strict>>;
                pendingQuestions: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                    key: import("zod").ZodString;
                    questions: import("zod").ZodArray<import("zod").ZodObject<{
                        id: import("zod").ZodString;
                        question: import("zod").ZodString;
                        header: import("zod").ZodOptional<import("zod").ZodString>;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        options: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                            label: import("zod").ZodString;
                            description: import("zod").ZodOptional<import("zod").ZodString>;
                        }, import("zod/v4/core").$strict>>>;
                        multiSelect: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    }, import("zod/v4/core").$strict>>;
                    state: import("zod").ZodOptional<import("zod").ZodEnum<{
                        open: "open";
                        continued: "continued";
                    }>>;
                    callId: import("zod").ZodOptional<import("zod").ZodString>;
                    timed: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    blocking: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod/v4/core").$strict>>>;
                error: import("zod").ZodNullable<import("zod").ZodString>;
                board: import("zod").ZodOptional<import("zod").ZodObject<{
                    version: import("zod").ZodLiteral<4>;
                    revision: import("zod").ZodNumber;
                    elements: import("zod").ZodArray<import("zod").ZodObject<{
                        id: import("zod").ZodString;
                        kind: import("zod").ZodEnum<{
                            text: "text";
                            image: "image";
                            markdown: "markdown";
                            math: "math";
                            svg: "svg";
                            html: "html";
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
                modelSelectionRequired: import("zod").ZodOptional<import("zod").ZodBoolean>;
                permission: import("zod").ZodOptional<import("zod").ZodEnum<{
                    "read-only": "read-only";
                    "workspace-write": "workspace-write";
                    "danger-full-access": "danger-full-access";
                }>>;
                topicId: import("zod").ZodNumber;
                sessionId: import("zod").ZodString;
                sourceSessionId: import("zod").ZodString;
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
                            new: "new";
                            old: "old";
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
                pending: "pending";
                complete: "complete";
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
                page: import("zod").ZodDefault<import("zod").ZodNumber>;
                pageCount: import("zod").ZodDefault<import("zod").ZodNumber>;
            }, import("zod/v4/core").$strict>;
        }, import("zod/v4/core").$strict>], "kind">;
    }, {
        name: string;
        create: () => import("zod").ZodDiscriminatedUnion<[import("zod").ZodObject<{
            kind: import("zod").ZodLiteral<"success">;
            installedVersion: import("zod").ZodString;
            latestVersion: import("zod").ZodString;
            updateAvailable: import("zod").ZodBoolean;
            checkedAt: import("zod").ZodNumber;
            profile: import("zod").ZodOptional<import("zod").ZodString>;
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
                mode: "strict";
                typeSymbol: string;
                create: () => import("zod").ZodUnion<readonly [import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                    sourceSessionId: import("zod").ZodString;
                    action: import("zod").ZodLiteral<"create">;
                    modelRoute: import("zod").ZodOptional<import("zod").ZodObject<{
                        provider: import("zod").ZodString;
                        model: import("zod").ZodString;
                    }, import("zod/v4/core").$strict>>;
                    requestId: import("zod").ZodString;
                    question: import("zod").ZodString;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    selectionClaim: import("zod").ZodObject<{
                        sourceSessionId: import("zod").ZodString;
                        anchorSeq: import("zod").ZodNumber;
                        displayText: import("zod").ZodString;
                        sourceHintText: import("zod").ZodOptional<import("zod").ZodString>;
                        prefixText: import("zod").ZodString;
                        suffixText: import("zod").ZodString;
                    }, import("zod/v4/core").$strict>;
                    action: import("zod").ZodLiteral<"create">;
                    modelRoute: import("zod").ZodOptional<import("zod").ZodObject<{
                        provider: import("zod").ZodString;
                        model: import("zod").ZodString;
                    }, import("zod/v4/core").$strict>>;
                    requestId: import("zod").ZodString;
                    question: import("zod").ZodString;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
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
                    action: import("zod").ZodLiteral<"create">;
                    modelRoute: import("zod").ZodOptional<import("zod").ZodObject<{
                        provider: import("zod").ZodString;
                        model: import("zod").ZodString;
                    }, import("zod/v4/core").$strict>>;
                    requestId: import("zod").ZodString;
                    question: import("zod").ZodString;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    documentClaim: import("zod").ZodObject<{
                        sourceSessionId: import("zod").ZodString;
                        documentId: import("zod").ZodString;
                        displayText: import("zod").ZodString;
                        prefixText: import("zod").ZodString;
                        suffixText: import("zod").ZodString;
                    }, import("zod/v4/core").$strict>;
                    action: import("zod").ZodLiteral<"create">;
                    modelRoute: import("zod").ZodOptional<import("zod").ZodObject<{
                        provider: import("zod").ZodString;
                        model: import("zod").ZodString;
                    }, import("zod/v4/core").$strict>>;
                    requestId: import("zod").ZodString;
                    question: import("zod").ZodString;
                }, import("zod/v4/core").$strict>]>, import("zod").ZodDiscriminatedUnion<[import("zod").ZodObject<{
                    action: import("zod").ZodLiteral<"question-draft-get">;
                    topicSessionId: import("zod").ZodString;
                    key: import("zod").ZodString;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    action: import("zod").ZodLiteral<"question-draft-save">;
                    topicSessionId: import("zod").ZodString;
                    key: import("zod").ZodString;
                    state: import("zod").ZodObject<{
                        version: import("zod").ZodLiteral<1>;
                        revision: import("zod").ZodNumber;
                        content: import("zod").ZodObject<{
                            answers: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodObject<{
                                selected: import("zod").ZodArray<import("zod").ZodString>;
                                custom: import("zod").ZodString;
                            }, import("zod/v4/core").$strict>>;
                            page: import("zod").ZodNumber;
                            edited: import("zod").ZodBoolean;
                            held: import("zod").ZodBoolean;
                        }, import("zod/v4/core").$strict>;
                    }, import("zod/v4/core").$strict>;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    action: import("zod").ZodLiteral<"draft-get">;
                    topicSessionId: import("zod").ZodString;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    action: import("zod").ZodLiteral<"draft-save">;
                    topicSessionId: import("zod").ZodString;
                    state: import("zod").ZodObject<{
                        version: import("zod").ZodLiteral<1>;
                        revision: import("zod").ZodNumber;
                        content: import("zod").ZodObject<{
                            text: import("zod").ZodString;
                            references: import("zod").ZodArray<import("zod").ZodObject<{
                                id: import("zod").ZodString;
                                kind: import("zod").ZodEnum<{
                                    source: "source";
                                    excerpt: "excerpt";
                                    board: "board";
                                }>;
                                label: import("zod").ZodString;
                                content: import("zod").ZodString;
                                address: import("zod").ZodOptional<import("zod").ZodString>;
                            }, import("zod/v4/core").$strict>>;
                            files: import("zod").ZodArray<import("zod").ZodObject<{
                                id: import("zod").ZodUUID;
                                name: import("zod").ZodString;
                                type: import("zod").ZodString;
                                size: import("zod").ZodNumber;
                                lastModified: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strict>>;
                        }, import("zod/v4/core").$strict>;
                        pending: import("zod").ZodNullable<import("zod").ZodObject<{
                            requestId: import("zod").ZodUUID;
                            content: import("zod").ZodObject<{
                                text: import("zod").ZodString;
                                references: import("zod").ZodArray<import("zod").ZodObject<{
                                    id: import("zod").ZodString;
                                    kind: import("zod").ZodEnum<{
                                        source: "source";
                                        excerpt: "excerpt";
                                        board: "board";
                                    }>;
                                    label: import("zod").ZodString;
                                    content: import("zod").ZodString;
                                    address: import("zod").ZodOptional<import("zod").ZodString>;
                                }, import("zod/v4/core").$strict>>;
                                files: import("zod").ZodArray<import("zod").ZodObject<{
                                    id: import("zod").ZodUUID;
                                    name: import("zod").ZodString;
                                    type: import("zod").ZodString;
                                    size: import("zod").ZodNumber;
                                    lastModified: import("zod").ZodNumber;
                                }, import("zod/v4/core").$strict>>;
                            }, import("zod/v4/core").$strict>;
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict>;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    action: import("zod").ZodLiteral<"draft-file-put">;
                    topicSessionId: import("zod").ZodString;
                    file: import("zod").ZodObject<{
                        id: import("zod").ZodUUID;
                        name: import("zod").ZodString;
                        type: import("zod").ZodString;
                        size: import("zod").ZodNumber;
                        lastModified: import("zod").ZodNumber;
                    }, import("zod/v4/core").$strict>;
                    offset: import("zod").ZodNumber;
                    data: import("zod").ZodString;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    action: import("zod").ZodLiteral<"draft-file-get">;
                    topicSessionId: import("zod").ZodString;
                    fileId: import("zod").ZodUUID;
                    offset: import("zod").ZodNumber;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    action: import("zod").ZodLiteral<"list">;
                    sourceSessionId: import("zod").ZodString;
                    includeArchived: import("zod").ZodOptional<import("zod").ZodBoolean>;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    action: import("zod").ZodLiteral<"board-capture">;
                    topicSessionId: import("zod").ZodString;
                    id: import("zod").ZodString;
                    png: import("zod").ZodOptional<import("zod").ZodString>;
                    error: import("zod").ZodOptional<import("zod").ZodString>;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    action: import("zod").ZodLiteral<"board-capture-pending">;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    action: import("zod").ZodLiteral<"get">;
                    topicSessionId: import("zod").ZodString;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    action: import("zod").ZodLiteral<"native-state">;
                    topicSessionId: import("zod").ZodString;
                    requestIds: import("zod").ZodArray<import("zod").ZodString>;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    action: import("zod").ZodLiteral<"native-attachment">;
                    topicSessionId: import("zod").ZodString;
                    attachmentId: import("zod").ZodString;
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
                    draftRevision: import("zod").ZodOptional<import("zod").ZodNumber>;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    action: import("zod").ZodLiteral<"cancel-question">;
                    topicSessionId: import("zod").ZodString;
                    key: import("zod").ZodString;
                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                    action: import("zod").ZodLiteral<"timeout-question">;
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
                    action: import("zod").ZodLiteral<"set-permission">;
                    topicSessionId: import("zod").ZodString;
                    mode: import("zod").ZodEnum<{
                        "read-only": "read-only";
                        "workspace-write": "workspace-write";
                        "danger-full-access": "danger-full-access";
                    }>;
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
                    page: import("zod").ZodOptional<import("zod").ZodNumber>;
                }, import("zod/v4/core").$strict>], "action">]>;
            };
        }];
        readonly cancellation: {
            readonly parameter: "signal";
        };
        readonly result: {
            mode: "strict";
            typeSymbol: string;
            create: () => import("zod").ZodDiscriminatedUnion<[import("zod").ZodObject<{
                kind: import("zod").ZodLiteral<"question-draft">;
                state: import("zod").ZodObject<{
                    version: import("zod").ZodLiteral<1>;
                    revision: import("zod").ZodNumber;
                    content: import("zod").ZodObject<{
                        answers: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodObject<{
                            selected: import("zod").ZodArray<import("zod").ZodString>;
                            custom: import("zod").ZodString;
                        }, import("zod/v4/core").$strict>>;
                        page: import("zod").ZodNumber;
                        edited: import("zod").ZodBoolean;
                        held: import("zod").ZodBoolean;
                    }, import("zod/v4/core").$strict>;
                }, import("zod/v4/core").$strict>;
                conflict: import("zod").ZodBoolean;
                closed: import("zod").ZodBoolean;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                kind: import("zod").ZodLiteral<"draft">;
                state: import("zod").ZodObject<{
                    version: import("zod").ZodLiteral<1>;
                    revision: import("zod").ZodNumber;
                    content: import("zod").ZodObject<{
                        text: import("zod").ZodString;
                        references: import("zod").ZodArray<import("zod").ZodObject<{
                            id: import("zod").ZodString;
                            kind: import("zod").ZodEnum<{
                                source: "source";
                                excerpt: "excerpt";
                                board: "board";
                            }>;
                            label: import("zod").ZodString;
                            content: import("zod").ZodString;
                            address: import("zod").ZodOptional<import("zod").ZodString>;
                        }, import("zod/v4/core").$strict>>;
                        files: import("zod").ZodArray<import("zod").ZodObject<{
                            id: import("zod").ZodUUID;
                            name: import("zod").ZodString;
                            type: import("zod").ZodString;
                            size: import("zod").ZodNumber;
                            lastModified: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict>;
                    pending: import("zod").ZodNullable<import("zod").ZodObject<{
                        requestId: import("zod").ZodUUID;
                        content: import("zod").ZodObject<{
                            text: import("zod").ZodString;
                            references: import("zod").ZodArray<import("zod").ZodObject<{
                                id: import("zod").ZodString;
                                kind: import("zod").ZodEnum<{
                                    source: "source";
                                    excerpt: "excerpt";
                                    board: "board";
                                }>;
                                label: import("zod").ZodString;
                                content: import("zod").ZodString;
                                address: import("zod").ZodOptional<import("zod").ZodString>;
                            }, import("zod/v4/core").$strict>>;
                            files: import("zod").ZodArray<import("zod").ZodObject<{
                                id: import("zod").ZodUUID;
                                name: import("zod").ZodString;
                                type: import("zod").ZodString;
                                size: import("zod").ZodNumber;
                                lastModified: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strict>>;
                        }, import("zod/v4/core").$strict>;
                    }, import("zod/v4/core").$strict>>;
                }, import("zod/v4/core").$strict>;
                conflict: import("zod").ZodBoolean;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                kind: import("zod").ZodLiteral<"draft-file-saved">;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                kind: import("zod").ZodLiteral<"draft-file">;
                data: import("zod").ZodString;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                kind: import("zod").ZodLiteral<"board-captures">;
                jobs: import("zod").ZodArray<import("zod").ZodObject<{
                    id: import("zod").ZodString;
                    sessionId: import("zod").ZodString;
                    board: import("zod").ZodObject<{
                        version: import("zod").ZodLiteral<4>;
                        revision: import("zod").ZodNumber;
                        elements: import("zod").ZodArray<import("zod").ZodObject<{
                            id: import("zod").ZodString;
                            kind: import("zod").ZodEnum<{
                                text: "text";
                                image: "image";
                                markdown: "markdown";
                                math: "math";
                                svg: "svg";
                                html: "html";
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
                    }, import("zod/v4/core").$strict>;
                }, import("zod/v4/core").$strict>>;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                kind: import("zod").ZodLiteral<"board-capture-accepted">;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                kind: import("zod").ZodLiteral<"native-state">;
                state: import("zod").ZodObject<{
                    modelSelectionRequired: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    running: import("zod").ZodBoolean;
                    blank: import("zod").ZodBoolean;
                    error: import("zod").ZodNullable<import("zod").ZodString>;
                    queue: import("zod").ZodArray<import("zod").ZodObject<{
                        id: import("zod").ZodString;
                        placement: import("zod").ZodEnum<{
                            queued: "queued";
                            steering: "steering";
                            context: "context";
                        }>;
                        rpcId: import("zod").ZodOptional<import("zod").ZodString>;
                        text: import("zod").ZodString;
                        attachments: import("zod").ZodArray<import("zod").ZodDiscriminatedUnion<[import("zod").ZodObject<{
                            type: import("zod").ZodLiteral<"image">;
                            attachment: import("zod").ZodPipe<import("zod").ZodObject<{
                                attachmentId: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<import("@deepseek-ai/dsh-attachment").AttachmentId, string>>;
                                mediaType: import("zod").ZodEnum<{
                                    "image/png": "image/png";
                                    "image/jpeg": "image/jpeg";
                                    "image/webp": "image/webp";
                                    "image/gif": "image/gif";
                                }>;
                                bytes: import("zod").ZodNumber;
                                width: import("zod").ZodNumber;
                                height: import("zod").ZodNumber;
                                name: import("zod").ZodOptional<import("zod").ZodString>;
                                originalDimensions: import("zod").ZodOptional<import("zod").ZodObject<{
                                    width: import("zod").ZodNumber;
                                    height: import("zod").ZodNumber;
                                }, import("zod/v4/core").$strict>>;
                            }, import("zod/v4/core").$strict>, import("zod").ZodTransform<import("@deepseek-ai/dsh-attachment").ImageAttachmentRef, {
                                attachmentId: import("@deepseek-ai/dsh-attachment").AttachmentId;
                                mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
                                bytes: number;
                                width: number;
                                height: number;
                                name?: string | undefined;
                                originalDimensions?: {
                                    width: number;
                                    height: number;
                                } | undefined;
                            }>>;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            type: import("zod").ZodLiteral<"file">;
                            attachment: import("zod").ZodObject<{
                                attachmentId: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<import("@deepseek-ai/dsh-attachment").AttachmentId, string>>;
                                name: import("zod").ZodString;
                                bytes: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strict>;
                        }, import("zod/v4/core").$strict>], "type">>;
                    }, import("zod/v4/core").$strict>>;
                    receipts: import("zod").ZodArray<import("zod").ZodObject<{
                        requestId: import("zod").ZodString;
                        attachments: import("zod").ZodArray<import("zod").ZodDiscriminatedUnion<[import("zod").ZodObject<{
                            type: import("zod").ZodLiteral<"image">;
                            attachment: import("zod").ZodPipe<import("zod").ZodObject<{
                                attachmentId: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<import("@deepseek-ai/dsh-attachment").AttachmentId, string>>;
                                mediaType: import("zod").ZodEnum<{
                                    "image/png": "image/png";
                                    "image/jpeg": "image/jpeg";
                                    "image/webp": "image/webp";
                                    "image/gif": "image/gif";
                                }>;
                                bytes: import("zod").ZodNumber;
                                width: import("zod").ZodNumber;
                                height: import("zod").ZodNumber;
                                name: import("zod").ZodOptional<import("zod").ZodString>;
                                originalDimensions: import("zod").ZodOptional<import("zod").ZodObject<{
                                    width: import("zod").ZodNumber;
                                    height: import("zod").ZodNumber;
                                }, import("zod/v4/core").$strict>>;
                            }, import("zod/v4/core").$strict>, import("zod").ZodTransform<import("@deepseek-ai/dsh-attachment").ImageAttachmentRef, {
                                attachmentId: import("@deepseek-ai/dsh-attachment").AttachmentId;
                                mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
                                bytes: number;
                                width: number;
                                height: number;
                                name?: string | undefined;
                                originalDimensions?: {
                                    width: number;
                                    height: number;
                                } | undefined;
                            }>>;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            type: import("zod").ZodLiteral<"file">;
                            attachment: import("zod").ZodObject<{
                                attachmentId: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<import("@deepseek-ai/dsh-attachment").AttachmentId, string>>;
                                name: import("zod").ZodString;
                                bytes: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strict>;
                        }, import("zod/v4/core").$strict>], "type">>;
                    }, import("zod/v4/core").$strict>>;
                }, import("zod/v4/core").$strict>;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                kind: import("zod").ZodLiteral<"native-attachment">;
                attachment: import("zod").ZodUnion<readonly [import("zod").ZodPipe<import("zod").ZodObject<{
                    attachmentId: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<import("@deepseek-ai/dsh-attachment").AttachmentId, string>>;
                    mediaType: import("zod").ZodEnum<{
                        "image/png": "image/png";
                        "image/jpeg": "image/jpeg";
                        "image/webp": "image/webp";
                        "image/gif": "image/gif";
                    }>;
                    bytes: import("zod").ZodNumber;
                    width: import("zod").ZodNumber;
                    height: import("zod").ZodNumber;
                    name: import("zod").ZodOptional<import("zod").ZodString>;
                    originalDimensions: import("zod").ZodOptional<import("zod").ZodObject<{
                        width: import("zod").ZodNumber;
                        height: import("zod").ZodNumber;
                    }, import("zod/v4/core").$strict>>;
                }, import("zod/v4/core").$strict>, import("zod").ZodTransform<import("@deepseek-ai/dsh-attachment").ImageAttachmentRef, {
                    attachmentId: import("@deepseek-ai/dsh-attachment").AttachmentId;
                    mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
                    bytes: number;
                    width: number;
                    height: number;
                    name?: string | undefined;
                    originalDimensions?: {
                        width: number;
                        height: number;
                    } | undefined;
                }>>, import("zod").ZodObject<{
                    attachmentId: import("zod").ZodPipe<import("zod").ZodString, import("zod").ZodTransform<import("@deepseek-ai/dsh-attachment").AttachmentId, string>>;
                    name: import("zod").ZodString;
                    bytes: import("zod").ZodNumber;
                }, import("zod/v4/core").$strict>]>;
                data: import("zod").ZodString;
            }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                kind: import("zod").ZodLiteral<"topic">;
                topic: import("zod").ZodObject<{
                    captureId: import("zod").ZodOptional<import("zod").ZodString>;
                    documentTitle: import("zod").ZodOptional<import("zod").ZodString>;
                    topic: import("zod").ZodObject<{
                        modelSelectionRequired: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        permission: import("zod").ZodOptional<import("zod").ZodEnum<{
                            "read-only": "read-only";
                            "workspace-write": "workspace-write";
                            "danger-full-access": "danger-full-access";
                        }>>;
                        topicId: import("zod").ZodNumber;
                        sessionId: import("zod").ZodString;
                        sourceSessionId: import("zod").ZodString;
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
                                    new: "new";
                                    old: "old";
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
                        questionReply: import("zod").ZodOptional<import("zod").ZodObject<{
                            callId: import("zod").ZodString;
                            items: import("zod").ZodArray<import("zod").ZodObject<{
                                id: import("zod").ZodString;
                                question: import("zod").ZodString;
                                header: import("zod").ZodOptional<import("zod").ZodString>;
                                values: import("zod").ZodArray<import("zod").ZodString>;
                            }, import("zod/v4/core").$strict>>;
                        }, import("zod/v4/core").$strict>>;
                        attachments: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                            kind: import("zod").ZodEnum<{
                                file: "file";
                                image: "image";
                            }>;
                            id: import("zod").ZodString;
                            name: import("zod").ZodString;
                        }, import("zod/v4/core").$strict>>>;
                        text: import("zod").ZodString;
                        id: import("zod").ZodString;
                        seq: import("zod").ZodNumber;
                    }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                        role: import("zod").ZodLiteral<"assistant">;
                        renderKey: import("zod").ZodOptional<import("zod").ZodString>;
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
                        questionReply: import("zod").ZodOptional<import("zod").ZodObject<{
                            callId: import("zod").ZodString;
                            items: import("zod").ZodArray<import("zod").ZodObject<{
                                id: import("zod").ZodString;
                                question: import("zod").ZodString;
                                header: import("zod").ZodOptional<import("zod").ZodString>;
                                values: import("zod").ZodArray<import("zod").ZodString>;
                            }, import("zod/v4/core").$strict>>;
                        }, import("zod/v4/core").$strict>>;
                        attachments: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                            kind: import("zod").ZodEnum<{
                                file: "file";
                                image: "image";
                            }>;
                            id: import("zod").ZodString;
                            name: import("zod").ZodString;
                        }, import("zod/v4/core").$strict>>>;
                        name: import("zod").ZodString;
                        arguments: import("zod").ZodString;
                        result: import("zod").ZodNullable<import("zod").ZodString>;
                        isError: import("zod").ZodBoolean;
                        errorCode: import("zod").ZodOptional<import("zod").ZodEnum<{
                            ASK_CANCELLED: "ASK_CANCELLED";
                            ASK_ABORTED: "ASK_ABORTED";
                        }>>;
                        approvalOutcome: import("zod").ZodOptional<import("zod").ZodLiteral<"rejected">>;
                        interruptionOutcome: import("zod").ZodOptional<import("zod").ZodLiteral<"interrupted">>;
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
                            detail: import("zod").ZodOptional<import("zod").ZodString>;
                            options: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                                label: import("zod").ZodString;
                                description: import("zod").ZodOptional<import("zod").ZodString>;
                            }, import("zod/v4/core").$strict>>>;
                            multiSelect: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        }, import("zod/v4/core").$strict>>;
                        state: import("zod").ZodOptional<import("zod").ZodEnum<{
                            open: "open";
                            continued: "continued";
                        }>>;
                        callId: import("zod").ZodOptional<import("zod").ZodString>;
                        timed: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        blocking: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    }, import("zod/v4/core").$strict>>;
                    pendingQuestions: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                        key: import("zod").ZodString;
                        questions: import("zod").ZodArray<import("zod").ZodObject<{
                            id: import("zod").ZodString;
                            question: import("zod").ZodString;
                            header: import("zod").ZodOptional<import("zod").ZodString>;
                            detail: import("zod").ZodOptional<import("zod").ZodString>;
                            options: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                                label: import("zod").ZodString;
                                description: import("zod").ZodOptional<import("zod").ZodString>;
                            }, import("zod/v4/core").$strict>>>;
                            multiSelect: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        }, import("zod/v4/core").$strict>>;
                        state: import("zod").ZodOptional<import("zod").ZodEnum<{
                            open: "open";
                            continued: "continued";
                        }>>;
                        callId: import("zod").ZodOptional<import("zod").ZodString>;
                        timed: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        blocking: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    }, import("zod/v4/core").$strict>>>;
                    error: import("zod").ZodNullable<import("zod").ZodString>;
                    board: import("zod").ZodOptional<import("zod").ZodObject<{
                        version: import("zod").ZodLiteral<4>;
                        revision: import("zod").ZodNumber;
                        elements: import("zod").ZodArray<import("zod").ZodObject<{
                            id: import("zod").ZodString;
                            kind: import("zod").ZodEnum<{
                                text: "text";
                                image: "image";
                                markdown: "markdown";
                                math: "math";
                                svg: "svg";
                                html: "html";
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
                    modelSelectionRequired: import("zod").ZodOptional<import("zod").ZodBoolean>;
                    permission: import("zod").ZodOptional<import("zod").ZodEnum<{
                        "read-only": "read-only";
                        "workspace-write": "workspace-write";
                        "danger-full-access": "danger-full-access";
                    }>>;
                    topicId: import("zod").ZodNumber;
                    sessionId: import("zod").ZodString;
                    sourceSessionId: import("zod").ZodString;
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
                                new: "new";
                                old: "old";
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
                    pending: "pending";
                    complete: "complete";
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
                    page: import("zod").ZodDefault<import("zod").ZodNumber>;
                    pageCount: import("zod").ZodDefault<import("zod").ZodNumber>;
                }, import("zod/v4/core").$strict>;
            }, import("zod/v4/core").$strict>], "kind">;
        };
        readonly sourceLocation: {
            readonly file: "src/index.ts";
            readonly line: 127;
            readonly column: 3;
        };
    }, {
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
            mode: "strict";
            typeSymbol: string;
            create: () => import("zod").ZodDiscriminatedUnion<[import("zod").ZodObject<{
                kind: import("zod").ZodLiteral<"success">;
                installedVersion: import("zod").ZodString;
                latestVersion: import("zod").ZodString;
                updateAvailable: import("zod").ZodBoolean;
                checkedAt: import("zod").ZodNumber;
                profile: import("zod").ZodOptional<import("zod").ZodString>;
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
    }];
};
export default TYPERT;

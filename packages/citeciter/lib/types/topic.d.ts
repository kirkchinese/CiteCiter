import { z } from 'zod';
/** Durable Citation version used by Observer Topics. */
export declare const CITATION_SCHEMA_VERSION: 3;
/** Navigation metadata version. Chat history remains in the DSH Session log. */
export declare const TOPIC_METADATA_SCHEMA_VERSION: 1;
/** Host settings namespace mirrored by the browser settings scope. */
export declare const CITECITER_SETTINGS_NAMESPACE: "citeciter";
/** Topic-scoped system prompt section. */
export declare const TUTOR_SECTION_NAME: "@kirkchinese/dsh-citeciter:tutor";
/** Topic-scoped, user-role Citation context. */
export declare const CITATION_CONTEXT_NAME: "@kirkchinese/dsh-citeciter:citation";
export declare const topicModeSchema: z.ZodEnum<{
    observer: "observer";
    "exact-fork": "exact-fork";
}>;
export type TopicMode = z.infer<typeof topicModeSchema>;
/** User preferences applied to new Topics and source reads. */
export declare const citeCiterSettingsSchema: z.ZodObject<{
    defaultMode: z.ZodEnum<{
        observer: "observer";
        "exact-when-available": "exact-when-available";
    }>;
    includeSourceReasoning: z.ZodBoolean;
    allowSourceFiles: z.ZodBoolean;
    panelWidthPercent: z.ZodNumber;
    reopenLastTopic: z.ZodBoolean;
}, z.core.$strict>;
export type CiteCiterSettings = z.infer<typeof citeCiterSettingsSchema>;
/** Settings used before an optional DSH settings provider becomes available. */
export declare const DEFAULT_CITECITER_SETTINGS: CiteCiterSettings;
/** Browser-visible selection resolved by the Host against one committed model call. */
export declare const citationSelectionClaimSchema: z.ZodObject<{
    sourceSessionId: z.ZodString;
    anchorSeq: z.ZodNumber;
    displayText: z.ZodString;
    sourceHintText: z.ZodOptional<z.ZodString>;
    prefixText: z.ZodString;
    suffixText: z.ZodString;
}, z.core.$strict>;
export type CitationSelectionClaim = z.infer<typeof citationSelectionClaimSchema>;
/** Host-verifiable Markdown evidence plus the browser-visible quote used by the UI. */
export declare const citationDraftSchema: z.ZodObject<{
    sourceSessionId: z.ZodString;
    anchorSeq: z.ZodNumber;
    startOffset: z.ZodNumber;
    endOffset: z.ZodNumber;
    sourceText: z.ZodString;
    displayText: z.ZodString;
    prefixText: z.ZodString;
    suffixText: z.ZodString;
    selectionFingerprint: z.ZodString;
}, z.core.$strict>;
/** Exact Citation retained for durable data and legacy 0.3.1 requests. */
export type CitationDraft = z.infer<typeof citationDraftSchema>;
export declare const citationRecordSchema: z.ZodObject<{
    sourceSessionId: z.ZodString;
    anchorSeq: z.ZodNumber;
    startOffset: z.ZodNumber;
    endOffset: z.ZodNumber;
    sourceText: z.ZodString;
    displayText: z.ZodString;
    prefixText: z.ZodString;
    suffixText: z.ZodString;
    selectionFingerprint: z.ZodString;
    schemaVersion: z.ZodLiteral<3>;
    createdAt: z.ZodNumber;
}, z.core.$strict>;
/** Immutable evidence identity owned by one Topic. */
export type CitationRecord = z.infer<typeof citationRecordSchema>;
export declare const modelConfigSchema: z.ZodObject<{
    provider: z.ZodString;
    model: z.ZodString;
    reasoningEffort: z.ZodOptional<z.ZodString>;
    temperature: z.ZodOptional<z.ZodNumber>;
    maxTokens: z.ZodOptional<z.ZodNumber>;
    stop: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export type TopicModelConfig = z.infer<typeof modelConfigSchema>;
export declare const topicMetadataSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    topicId: z.ZodNumber;
    createRequestId: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodString;
    sourceSessionId: z.ZodString;
    sourceCwd: z.ZodString;
    mode: z.ZodEnum<{
        observer: "observer";
        "exact-fork": "exact-fork";
    }>;
    citation: z.ZodObject<{
        sourceSessionId: z.ZodString;
        anchorSeq: z.ZodNumber;
        startOffset: z.ZodNumber;
        endOffset: z.ZodNumber;
        sourceText: z.ZodString;
        displayText: z.ZodString;
        prefixText: z.ZodString;
        suffixText: z.ZodString;
        selectionFingerprint: z.ZodString;
        schemaVersion: z.ZodLiteral<3>;
        createdAt: z.ZodNumber;
    }, z.core.$strict>;
    modelConfig: z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
        reasoningEffort: z.ZodOptional<z.ZodString>;
        temperature: z.ZodOptional<z.ZodNumber>;
        maxTokens: z.ZodOptional<z.ZodNumber>;
        stop: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>;
    forkThroughSeq: z.ZodNullable<z.ZodNumber>;
    temporaryTitle: z.ZodString;
    cachedTitle: z.ZodNullable<z.ZodString>;
    cachedTitleSource: z.ZodNullable<z.ZodEnum<{
        provider: "provider";
        fallback: "fallback";
        user: "user";
    }>>;
    cachedTitleEventSeq: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    archivedAt: z.ZodNullable<z.ZodNumber>;
    sourceAvailable: z.ZodBoolean;
    observedThroughSeq: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strict>;
/** Small navigation record stored outside the standard Topic Session log. */
export type TopicMetadata = z.infer<typeof topicMetadataSchema>;
export declare const topicSummarySchema: z.ZodObject<{
    topicId: z.ZodNumber;
    sessionId: z.ZodString;
    sourceSessionId: z.ZodString;
    mode: z.ZodEnum<{
        observer: "observer";
        "exact-fork": "exact-fork";
    }>;
    citation: z.ZodObject<{
        sourceSessionId: z.ZodString;
        anchorSeq: z.ZodNumber;
        startOffset: z.ZodNumber;
        endOffset: z.ZodNumber;
        sourceText: z.ZodString;
        displayText: z.ZodString;
        prefixText: z.ZodString;
        suffixText: z.ZodString;
        selectionFingerprint: z.ZodString;
        schemaVersion: z.ZodLiteral<3>;
        createdAt: z.ZodNumber;
    }, z.core.$strict>;
    title: z.ZodString;
    titlePending: z.ZodBoolean;
    createdAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
    archived: z.ZodBoolean;
    running: z.ZodBoolean;
    sourceAvailable: z.ZodBoolean;
    observedThroughSeq: z.ZodNullable<z.ZodNumber>;
    modelConfig: z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
        reasoningEffort: z.ZodOptional<z.ZodString>;
        temperature: z.ZodOptional<z.ZodNumber>;
        maxTokens: z.ZodOptional<z.ZodNumber>;
        stop: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type TopicSummary = z.infer<typeof topicSummarySchema>;
export declare const topicMessageSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    role: z.ZodLiteral<"user">;
    text: z.ZodString;
    id: z.ZodString;
    seq: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    role: z.ZodLiteral<"assistant">;
    text: z.ZodString;
    reasoning: z.ZodNullable<z.ZodString>;
    streaming: z.ZodBoolean;
    id: z.ZodString;
    seq: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    role: z.ZodLiteral<"context">;
    label: z.ZodString;
    text: z.ZodString;
    id: z.ZodString;
    seq: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    role: z.ZodLiteral<"tool">;
    name: z.ZodString;
    arguments: z.ZodString;
    result: z.ZodNullable<z.ZodString>;
    isError: z.ZodBoolean;
    running: z.ZodBoolean;
    id: z.ZodString;
    seq: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    role: z.ZodLiteral<"error">;
    text: z.ZodString;
    bodyRetained: z.ZodBoolean;
    attempt: z.ZodNumber;
    status: z.ZodEnum<{
        failed: "failed";
        stopped: "stopped";
    }>;
    id: z.ZodString;
    seq: z.ZodNumber;
}, z.core.$strict>], "role">;
export type TopicMessage = z.infer<typeof topicMessageSchema>;
export declare const questionOptionSchema: z.ZodObject<{
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const questionItemSchema: z.ZodObject<{
    id: z.ZodString;
    question: z.ZodString;
    header: z.ZodOptional<z.ZodString>;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>>;
    multiSelect: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
export declare const questionAnswerSchema: z.ZodObject<{
    answers: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        selected: z.ZodArray<z.ZodString>;
        custom: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type QuestionAnswer = z.infer<typeof questionAnswerSchema>;
export declare const pendingQuestionSchema: z.ZodObject<{
    key: z.ZodString;
    questions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        question: z.ZodString;
        header: z.ZodOptional<z.ZodString>;
        options: z.ZodOptional<z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>>;
        multiSelect: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type PendingQuestion = z.infer<typeof pendingQuestionSchema>;
export declare const topicSnapshotSchema: z.ZodObject<{
    topic: z.ZodObject<{
        topicId: z.ZodNumber;
        sessionId: z.ZodString;
        sourceSessionId: z.ZodString;
        mode: z.ZodEnum<{
            observer: "observer";
            "exact-fork": "exact-fork";
        }>;
        citation: z.ZodObject<{
            sourceSessionId: z.ZodString;
            anchorSeq: z.ZodNumber;
            startOffset: z.ZodNumber;
            endOffset: z.ZodNumber;
            sourceText: z.ZodString;
            displayText: z.ZodString;
            prefixText: z.ZodString;
            suffixText: z.ZodString;
            selectionFingerprint: z.ZodString;
            schemaVersion: z.ZodLiteral<3>;
            createdAt: z.ZodNumber;
        }, z.core.$strict>;
        title: z.ZodString;
        titlePending: z.ZodBoolean;
        createdAt: z.ZodNumber;
        updatedAt: z.ZodNumber;
        archived: z.ZodBoolean;
        running: z.ZodBoolean;
        sourceAvailable: z.ZodBoolean;
        observedThroughSeq: z.ZodNullable<z.ZodNumber>;
        modelConfig: z.ZodObject<{
            provider: z.ZodString;
            model: z.ZodString;
            reasoningEffort: z.ZodOptional<z.ZodString>;
            temperature: z.ZodOptional<z.ZodNumber>;
            maxTokens: z.ZodOptional<z.ZodNumber>;
            stop: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    messages: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        role: z.ZodLiteral<"user">;
        text: z.ZodString;
        id: z.ZodString;
        seq: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        role: z.ZodLiteral<"assistant">;
        text: z.ZodString;
        reasoning: z.ZodNullable<z.ZodString>;
        streaming: z.ZodBoolean;
        id: z.ZodString;
        seq: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        role: z.ZodLiteral<"context">;
        label: z.ZodString;
        text: z.ZodString;
        id: z.ZodString;
        seq: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        role: z.ZodLiteral<"tool">;
        name: z.ZodString;
        arguments: z.ZodString;
        result: z.ZodNullable<z.ZodString>;
        isError: z.ZodBoolean;
        running: z.ZodBoolean;
        id: z.ZodString;
        seq: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        role: z.ZodLiteral<"error">;
        text: z.ZodString;
        bodyRetained: z.ZodBoolean;
        attempt: z.ZodNumber;
        status: z.ZodEnum<{
            failed: "failed";
            stopped: "stopped";
        }>;
        id: z.ZodString;
        seq: z.ZodNumber;
    }, z.core.$strict>], "role">>;
    pendingQuestion: z.ZodNullable<z.ZodObject<{
        key: z.ZodString;
        questions: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            question: z.ZodString;
            header: z.ZodOptional<z.ZodString>;
            options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                label: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>>;
            multiSelect: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    error: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type TopicSnapshot = z.infer<typeof topicSnapshotSchema>;
export declare const modelOptionSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    reasoningEfforts: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const providerOptionSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    models: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        reasoningEfforts: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ProviderOption = z.infer<typeof providerOptionSchema>;
/** One strict direct-RPC command for the private CiteCiter runtime. */
export declare const citeCiterRequestSchema: z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodObject<{
    action: z.ZodLiteral<"create">;
    requestId: z.ZodString;
    citation: z.ZodObject<{
        sourceSessionId: z.ZodString;
        anchorSeq: z.ZodNumber;
        startOffset: z.ZodNumber;
        endOffset: z.ZodNumber;
        sourceText: z.ZodString;
        displayText: z.ZodString;
        prefixText: z.ZodString;
        suffixText: z.ZodString;
        selectionFingerprint: z.ZodString;
    }, z.core.$strict>;
    question: z.ZodString;
    mode: z.ZodEnum<{
        observer: "observer";
        "exact-fork": "exact-fork";
        "exact-when-available": "exact-when-available";
    }>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"create">;
    requestId: z.ZodString;
    selectionClaim: z.ZodObject<{
        sourceSessionId: z.ZodString;
        anchorSeq: z.ZodNumber;
        displayText: z.ZodString;
        sourceHintText: z.ZodOptional<z.ZodString>;
        prefixText: z.ZodString;
        suffixText: z.ZodString;
    }, z.core.$strict>;
    question: z.ZodString;
    mode: z.ZodEnum<{
        observer: "observer";
        "exact-fork": "exact-fork";
        "exact-when-available": "exact-when-available";
    }>;
}, z.core.$strict>]>, z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"list">;
    sourceSessionId: z.ZodString;
    includeArchived: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"get">;
    topicSessionId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"ask">;
    requestId: z.ZodOptional<z.ZodString>;
    topicSessionId: z.ZodString;
    question: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"stop">;
    topicSessionId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"answer-question">;
    topicSessionId: z.ZodString;
    key: z.ZodString;
    answer: z.ZodObject<{
        answers: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            selected: z.ZodArray<z.ZodString>;
            custom: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"cancel-question">;
    topicSessionId: z.ZodString;
    key: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"rename">;
    topicSessionId: z.ZodString;
    title: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"archive">;
    topicSessionId: z.ZodString;
    archived: z.ZodBoolean;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"delete">;
    topicSessionId: z.ZodString;
    confirmSessionId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"models">;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"set-model-route">;
    topicSessionId: z.ZodString;
    provider: z.ZodString;
    model: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"set-reasoning-effort">;
    topicSessionId: z.ZodString;
    reasoningEffort: z.ZodNullable<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"select-model">;
    topicSessionId: z.ZodString;
    provider: z.ZodString;
    model: z.ZodString;
    reasoningEffort: z.ZodNullable<z.ZodString>;
}, z.core.$strict>], "action">]>;
export type CiteCiterRequest = z.infer<typeof citeCiterRequestSchema>;
/** Strict response union returned by the single Remote command endpoint. */
export declare const citeCiterResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"topic">;
    topic: z.ZodObject<{
        topic: z.ZodObject<{
            topicId: z.ZodNumber;
            sessionId: z.ZodString;
            sourceSessionId: z.ZodString;
            mode: z.ZodEnum<{
                observer: "observer";
                "exact-fork": "exact-fork";
            }>;
            citation: z.ZodObject<{
                sourceSessionId: z.ZodString;
                anchorSeq: z.ZodNumber;
                startOffset: z.ZodNumber;
                endOffset: z.ZodNumber;
                sourceText: z.ZodString;
                displayText: z.ZodString;
                prefixText: z.ZodString;
                suffixText: z.ZodString;
                selectionFingerprint: z.ZodString;
                schemaVersion: z.ZodLiteral<3>;
                createdAt: z.ZodNumber;
            }, z.core.$strict>;
            title: z.ZodString;
            titlePending: z.ZodBoolean;
            createdAt: z.ZodNumber;
            updatedAt: z.ZodNumber;
            archived: z.ZodBoolean;
            running: z.ZodBoolean;
            sourceAvailable: z.ZodBoolean;
            observedThroughSeq: z.ZodNullable<z.ZodNumber>;
            modelConfig: z.ZodObject<{
                provider: z.ZodString;
                model: z.ZodString;
                reasoningEffort: z.ZodOptional<z.ZodString>;
                temperature: z.ZodOptional<z.ZodNumber>;
                maxTokens: z.ZodOptional<z.ZodNumber>;
                stop: z.ZodOptional<z.ZodArray<z.ZodString>>;
            }, z.core.$strict>;
        }, z.core.$strict>;
        messages: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            role: z.ZodLiteral<"user">;
            text: z.ZodString;
            id: z.ZodString;
            seq: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            role: z.ZodLiteral<"assistant">;
            text: z.ZodString;
            reasoning: z.ZodNullable<z.ZodString>;
            streaming: z.ZodBoolean;
            id: z.ZodString;
            seq: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            role: z.ZodLiteral<"context">;
            label: z.ZodString;
            text: z.ZodString;
            id: z.ZodString;
            seq: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            role: z.ZodLiteral<"tool">;
            name: z.ZodString;
            arguments: z.ZodString;
            result: z.ZodNullable<z.ZodString>;
            isError: z.ZodBoolean;
            running: z.ZodBoolean;
            id: z.ZodString;
            seq: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            role: z.ZodLiteral<"error">;
            text: z.ZodString;
            bodyRetained: z.ZodBoolean;
            attempt: z.ZodNumber;
            status: z.ZodEnum<{
                failed: "failed";
                stopped: "stopped";
            }>;
            id: z.ZodString;
            seq: z.ZodNumber;
        }, z.core.$strict>], "role">>;
        pendingQuestion: z.ZodNullable<z.ZodObject<{
            key: z.ZodString;
            questions: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                question: z.ZodString;
                header: z.ZodOptional<z.ZodString>;
                options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    label: z.ZodString;
                    description: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>>;
                multiSelect: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        error: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"topics">;
    topics: z.ZodArray<z.ZodObject<{
        topicId: z.ZodNumber;
        sessionId: z.ZodString;
        sourceSessionId: z.ZodString;
        mode: z.ZodEnum<{
            observer: "observer";
            "exact-fork": "exact-fork";
        }>;
        citation: z.ZodObject<{
            sourceSessionId: z.ZodString;
            anchorSeq: z.ZodNumber;
            startOffset: z.ZodNumber;
            endOffset: z.ZodNumber;
            sourceText: z.ZodString;
            displayText: z.ZodString;
            prefixText: z.ZodString;
            suffixText: z.ZodString;
            selectionFingerprint: z.ZodString;
            schemaVersion: z.ZodLiteral<3>;
            createdAt: z.ZodNumber;
        }, z.core.$strict>;
        title: z.ZodString;
        titlePending: z.ZodBoolean;
        createdAt: z.ZodNumber;
        updatedAt: z.ZodNumber;
        archived: z.ZodBoolean;
        running: z.ZodBoolean;
        sourceAvailable: z.ZodBoolean;
        observedThroughSeq: z.ZodNullable<z.ZodNumber>;
        modelConfig: z.ZodObject<{
            provider: z.ZodString;
            model: z.ZodString;
            reasoningEffort: z.ZodOptional<z.ZodString>;
            temperature: z.ZodOptional<z.ZodNumber>;
            maxTokens: z.ZodOptional<z.ZodNumber>;
            stop: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"models">;
    providers: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        models: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            reasoningEfforts: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"deleted">;
    sessionId: z.ZodString;
}, z.core.$strict>], "kind">;
export type CiteCiterResponse = z.infer<typeof citeCiterResponseSchema>;
/** Fields whose canonical serialization defines selection identity. */
export declare function canonicalCitationIdentity(citation: Omit<CitationDraft, 'selectionFingerprint'>): string;
/** Render the immutable Citation as explicitly untrusted user-role context. */
export declare function renderCitationContext(citation: CitationRecord): string;

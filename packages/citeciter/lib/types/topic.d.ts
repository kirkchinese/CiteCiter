import { z } from 'zod';
/** Durable Citation version used by Observer Topics. v4 adds the EvidenceRef entry discriminator. */
export declare const CITATION_SCHEMA_VERSION: 4;
/** Navigation metadata version. v2 permits source-bound Topics without a selected Citation. */
export declare const TOPIC_METADATA_SCHEMA_VERSION: 2;
/** Scenario applied when neither the creator nor the stored metadata selects one. */
export declare const DEFAULT_TOPIC_SCENARIO: "qa";
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
/**
 * Topic turn-content scenario. Orthogonal to {@link TopicMode}: mode describes
 * the source-session timing relation, scenario selects the assembled tool set,
 * prompt sections, and future loop decorations for this Topic.
 */
export declare const topicScenarioSchema: z.ZodEnum<{
    qa: "qa";
    present: "present";
    read: "read";
    investigate: "investigate";
}>;
export type TopicScenario = z.infer<typeof topicScenarioSchema>;
/** One user-editable prompt template shown beside the selection popover. */
export declare const promptTemplateSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    text: z.ZodString;
}, z.core.$strict>;
export type PromptTemplate = z.infer<typeof promptTemplateSchema>;
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
    tutorPrompt: z.ZodOptional<z.ZodString>;
    followupQuestions: z.ZodOptional<z.ZodBoolean>;
    promptTemplates: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        text: z.ZodString;
    }, z.core.$strict>>>;
    shortcutOpenPanel: z.ZodOptional<z.ZodString>;
    boardAnimations: z.ZodOptional<z.ZodBoolean>;
    updateNotifications: z.ZodOptional<z.ZodBoolean>;
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
/**
 * Evidence anchor discriminator for one durable Citation. `anchorSeq` mirrors
 * the record-level coordinate; the canonical schema enforces equality.
 */
export declare const citationEntrySchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"assistant-message">;
    anchorSeq: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"tool-result">;
    anchorSeq: z.ZodNumber;
    callId: z.ZodString;
    toolName: z.ZodString;
    projection: z.ZodEnum<{
        "result-text": "result-text";
        terminal: "terminal";
        diff: "diff";
    }>;
    fileIndex: z.ZodOptional<z.ZodNumber>;
    side: z.ZodOptional<z.ZodEnum<{
        old: "old";
        new: "new";
    }>>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"document-range">;
    documentId: z.ZodString;
    startOffset: z.ZodNumber;
    endOffset: z.ZodNumber;
}, z.core.$strict>], "kind">;
/** One anchor kind plus the tool-result coordinates that identify the evidence. */
export type CitationEntry = z.infer<typeof citationEntrySchema>;
/** Canonical v4 Citation: the shared text projection plus one EvidenceRef entry. */
export declare const citationRecordSchema: z.ZodObject<{
    entry: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"assistant-message">;
        anchorSeq: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"tool-result">;
        anchorSeq: z.ZodNumber;
        callId: z.ZodString;
        toolName: z.ZodString;
        projection: z.ZodEnum<{
            "result-text": "result-text";
            terminal: "terminal";
            diff: "diff";
        }>;
        fileIndex: z.ZodOptional<z.ZodNumber>;
        side: z.ZodOptional<z.ZodEnum<{
            old: "old";
            new: "new";
        }>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"document-range">;
        documentId: z.ZodString;
        startOffset: z.ZodNumber;
        endOffset: z.ZodNumber;
    }, z.core.$strict>], "kind">;
    selectionFingerprint: z.ZodString;
    createdAt: z.ZodNumber;
    sourceSessionId: z.ZodString;
    anchorSeq: z.ZodNumber;
    startOffset: z.ZodNumber;
    endOffset: z.ZodNumber;
    sourceText: z.ZodString;
    displayText: z.ZodString;
    prefixText: z.ZodString;
    suffixText: z.ZodString;
    schemaVersion: z.ZodLiteral<4>;
}, z.core.$strict>;
/** Immutable EvidenceRef identity owned by one Topic. */
export type CitationRecord = z.infer<typeof citationRecordSchema>;
/** Verified evidence fields before the durable record adds version, time, and fingerprint. */
export type CitationEvidence = Omit<CitationRecord, 'schemaVersion' | 'createdAt' | 'selectionFingerprint'>;
/** On-disk Citation written by v3 (no entry) or v4. */
declare const citationRecordFileSchema: z.ZodObject<{
    entry: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"assistant-message">;
        anchorSeq: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"tool-result">;
        anchorSeq: z.ZodNumber;
        callId: z.ZodString;
        toolName: z.ZodString;
        projection: z.ZodEnum<{
            "result-text": "result-text";
            terminal: "terminal";
            diff: "diff";
        }>;
        fileIndex: z.ZodOptional<z.ZodNumber>;
        side: z.ZodOptional<z.ZodEnum<{
            old: "old";
            new: "new";
        }>>;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"document-range">;
        documentId: z.ZodString;
        startOffset: z.ZodNumber;
        endOffset: z.ZodNumber;
    }, z.core.$strict>], "kind">>;
    selectionFingerprint: z.ZodString;
    createdAt: z.ZodNumber;
    sourceSessionId: z.ZodString;
    anchorSeq: z.ZodNumber;
    startOffset: z.ZodNumber;
    endOffset: z.ZodNumber;
    sourceText: z.ZodString;
    displayText: z.ZodString;
    prefixText: z.ZodString;
    suffixText: z.ZodString;
    schemaVersion: z.ZodUnion<readonly [z.ZodLiteral<3>, z.ZodLiteral<4>]>;
}, z.core.$strict>;
type CitationRecordFile = z.infer<typeof citationRecordFileSchema>;
/**
 * Normalize one durable Citation file record to canonical v4.
 * @param raw - parsed v3 or v4 file record.
 * @returns canonical v4 record; v3 synthesizes its assistant-message entry.
 */
export declare function normalizeCitationRecord(raw: CitationRecordFile): CitationRecord;
/**
 * Parse a durable Citation written by v3 or v4.
 * @param raw - stored Citation value.
 * @returns canonical v4 CitationRecord.
 */
export declare function parseCitationRecord(raw: unknown): CitationRecord;
export declare const modelConfigSchema: z.ZodObject<{
    provider: z.ZodString;
    model: z.ZodString;
    reasoningEffort: z.ZodOptional<z.ZodString>;
    temperature: z.ZodOptional<z.ZodNumber>;
    maxTokens: z.ZodOptional<z.ZodNumber>;
    stop: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export type TopicModelConfig = z.infer<typeof modelConfigSchema>;
/** Canonical Topic metadata committed by the current runtime. */
export declare const topicMetadataSchema: z.ZodObject<{
    citation: z.ZodNullable<z.ZodObject<{
        entry: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"assistant-message">;
            anchorSeq: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"tool-result">;
            anchorSeq: z.ZodNumber;
            callId: z.ZodString;
            toolName: z.ZodString;
            projection: z.ZodEnum<{
                "result-text": "result-text";
                terminal: "terminal";
                diff: "diff";
            }>;
            fileIndex: z.ZodOptional<z.ZodNumber>;
            side: z.ZodOptional<z.ZodEnum<{
                old: "old";
                new: "new";
            }>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"document-range">;
            documentId: z.ZodString;
            startOffset: z.ZodNumber;
            endOffset: z.ZodNumber;
        }, z.core.$strict>], "kind">;
        selectionFingerprint: z.ZodString;
        createdAt: z.ZodNumber;
        sourceSessionId: z.ZodString;
        anchorSeq: z.ZodNumber;
        startOffset: z.ZodNumber;
        endOffset: z.ZodNumber;
        sourceText: z.ZodString;
        displayText: z.ZodString;
        prefixText: z.ZodString;
        suffixText: z.ZodString;
        schemaVersion: z.ZodLiteral<4>;
    }, z.core.$strict>>;
    scenario: z.ZodEnum<{
        qa: "qa";
        present: "present";
        read: "read";
        investigate: "investigate";
    }>;
    documentId: z.ZodNullable<z.ZodString>;
    topicId: z.ZodNumber;
    createRequestId: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodString;
    sourceSessionId: z.ZodString;
    sourceCwd: z.ZodString;
    mode: z.ZodEnum<{
        observer: "observer";
        "exact-fork": "exact-fork";
    }>;
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
    schemaVersion: z.ZodLiteral<2>;
}, z.core.$strict>;
/** Small navigation record stored outside the standard Topic Session log. */
export type TopicMetadata = z.infer<typeof topicMetadataSchema>;
/**
 * Parse one on-disk Topic metadata record, normalizing legacy v3 Citations and
 * missing scenario/document fields to their current defaults.
 * @param raw - stored metadata value.
 * @returns canonical TopicMetadata.
 */
export declare function parseTopicMetadataFile(raw: unknown): TopicMetadata;
export declare const topicSummarySchema: z.ZodObject<{
    topicId: z.ZodNumber;
    sessionId: z.ZodString;
    sourceSessionId: z.ZodString;
    mode: z.ZodEnum<{
        observer: "observer";
        "exact-fork": "exact-fork";
    }>;
    scenario: z.ZodEnum<{
        qa: "qa";
        present: "present";
        read: "read";
        investigate: "investigate";
    }>;
    documentId: z.ZodNullable<z.ZodString>;
    citation: z.ZodNullable<z.ZodObject<{
        entry: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"assistant-message">;
            anchorSeq: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"tool-result">;
            anchorSeq: z.ZodNumber;
            callId: z.ZodString;
            toolName: z.ZodString;
            projection: z.ZodEnum<{
                "result-text": "result-text";
                terminal: "terminal";
                diff: "diff";
            }>;
            fileIndex: z.ZodOptional<z.ZodNumber>;
            side: z.ZodOptional<z.ZodEnum<{
                old: "old";
                new: "new";
            }>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"document-range">;
            documentId: z.ZodString;
            startOffset: z.ZodNumber;
            endOffset: z.ZodNumber;
        }, z.core.$strict>], "kind">;
        selectionFingerprint: z.ZodString;
        createdAt: z.ZodNumber;
        sourceSessionId: z.ZodString;
        anchorSeq: z.ZodNumber;
        startOffset: z.ZodNumber;
        endOffset: z.ZodNumber;
        sourceText: z.ZodString;
        displayText: z.ZodString;
        prefixText: z.ZodString;
        suffixText: z.ZodString;
        schemaVersion: z.ZodLiteral<4>;
    }, z.core.$strict>>;
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
        scenario: z.ZodEnum<{
            qa: "qa";
            present: "present";
            read: "read";
            investigate: "investigate";
        }>;
        documentId: z.ZodNullable<z.ZodString>;
        citation: z.ZodNullable<z.ZodObject<{
            entry: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"assistant-message">;
                anchorSeq: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"tool-result">;
                anchorSeq: z.ZodNumber;
                callId: z.ZodString;
                toolName: z.ZodString;
                projection: z.ZodEnum<{
                    "result-text": "result-text";
                    terminal: "terminal";
                    diff: "diff";
                }>;
                fileIndex: z.ZodOptional<z.ZodNumber>;
                side: z.ZodOptional<z.ZodEnum<{
                    old: "old";
                    new: "new";
                }>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"document-range">;
                documentId: z.ZodString;
                startOffset: z.ZodNumber;
                endOffset: z.ZodNumber;
            }, z.core.$strict>], "kind">;
            selectionFingerprint: z.ZodString;
            createdAt: z.ZodNumber;
            sourceSessionId: z.ZodString;
            anchorSeq: z.ZodNumber;
            startOffset: z.ZodNumber;
            endOffset: z.ZodNumber;
            sourceText: z.ZodString;
            displayText: z.ZodString;
            prefixText: z.ZodString;
            suffixText: z.ZodString;
            schemaVersion: z.ZodLiteral<4>;
        }, z.core.$strict>>;
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
    board: z.ZodOptional<z.ZodObject<{
        version: z.ZodLiteral<4>;
        revision: z.ZodNumber;
        elements: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            kind: z.ZodEnum<{
                text: "text";
                markdown: "markdown";
                math: "math";
                svg: "svg";
                html: "html";
                image: "image";
                table: "table";
            }>;
            content: z.ZodString;
            x: z.ZodNumber;
            y: z.ZodNumber;
            w: z.ZodNumber;
            h: z.ZodNumber;
            style: z.ZodObject<{
                color: z.ZodOptional<z.ZodString>;
                fontSize: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
            focused: z.ZodBoolean;
            animation: z.ZodOptional<z.ZodObject<{
                name: z.ZodEnum<{
                    "fade-in": "fade-in";
                    "slide-in": "slide-in";
                    pulse: "pulse";
                    highlight: "highlight";
                }>;
                durationMs: z.ZodNumber;
                iterations: z.ZodNumber;
                run: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        invalid: z.ZodNumber;
    }, z.core.$strict>>;
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
/** Whole-card tool-result claim; the Host verifies it against the committed `tool/result`. */
export declare const toolEvidenceClaimSchema: z.ZodObject<{
    sourceSessionId: z.ZodString;
    callId: z.ZodString;
    displayText: z.ZodString;
    projection: z.ZodOptional<z.ZodEnum<{
        "result-text": "result-text";
        terminal: "terminal";
        diff: "diff";
    }>>;
}, z.core.$strict>;
/** Browser-submitted claim that anchors one Topic on a committed tool result. */
export type ToolEvidenceClaim = z.infer<typeof toolEvidenceClaimSchema>;
/** Browser-submitted claim that anchors one Topic on a CiteCiter document range. */
export declare const documentEvidenceClaimSchema: z.ZodObject<{
    sourceSessionId: z.ZodString;
    documentId: z.ZodString;
    displayText: z.ZodString;
    prefixText: z.ZodString;
    suffixText: z.ZodString;
}, z.core.$strict>;
/** Browser claim whose offsets the Host re-resolves against the stored document text. */
export type DocumentEvidenceClaim = z.infer<typeof documentEvidenceClaimSchema>;
/** Document format accepted by the CiteCiter private document library. */
export declare const documentFormatSchema: z.ZodEnum<{
    text: "text";
    markdown: "markdown";
}>;
export type DocumentFormat = z.infer<typeof documentFormatSchema>;
/** Document-library metadata exposed to the Reader and document Topics. */
export declare const documentSummarySchema: z.ZodObject<{
    documentId: z.ZodString;
    title: z.ZodString;
    format: z.ZodEnum<{
        text: "text";
        markdown: "markdown";
    }>;
    size: z.ZodNumber;
    importedAt: z.ZodNumber;
}, z.core.$strict>;
export type DocumentSummary = z.infer<typeof documentSummarySchema>;
/** Bounded document content page returned to the Reader. */
export declare const documentContentSchema: z.ZodObject<{
    documentId: z.ZodString;
    title: z.ZodString;
    format: z.ZodEnum<{
        text: "text";
        markdown: "markdown";
    }>;
    content: z.ZodString;
    truncated: z.ZodBoolean;
}, z.core.$strict>;
export type DocumentContent = z.infer<typeof documentContentSchema>;
/** One strict direct-RPC command for the private CiteCiter runtime. */
export declare const citeCiterRequestSchema: z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodObject<{
    action: z.ZodLiteral<"create">;
    requestId: z.ZodString;
    sourceSessionId: z.ZodString;
    question: z.ZodString;
    mode: z.ZodLiteral<"observer">;
    scenario: z.ZodOptional<z.ZodEnum<{
        qa: "qa";
        present: "present";
    }>>;
}, z.core.$strict>, z.ZodObject<{
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
    scenario: z.ZodOptional<z.ZodEnum<{
        qa: "qa";
        present: "present";
        read: "read";
        investigate: "investigate";
    }>>;
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
    scenario: z.ZodOptional<z.ZodEnum<{
        qa: "qa";
        present: "present";
        read: "read";
        investigate: "investigate";
    }>>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"create">;
    requestId: z.ZodString;
    toolClaim: z.ZodObject<{
        sourceSessionId: z.ZodString;
        callId: z.ZodString;
        displayText: z.ZodString;
        projection: z.ZodOptional<z.ZodEnum<{
            "result-text": "result-text";
            terminal: "terminal";
            diff: "diff";
        }>>;
    }, z.core.$strict>;
    question: z.ZodString;
    mode: z.ZodEnum<{
        observer: "observer";
        "exact-fork": "exact-fork";
        "exact-when-available": "exact-when-available";
    }>;
    scenario: z.ZodOptional<z.ZodEnum<{
        qa: "qa";
        present: "present";
        read: "read";
        investigate: "investigate";
    }>>;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"create">;
    requestId: z.ZodString;
    documentClaim: z.ZodObject<{
        sourceSessionId: z.ZodString;
        documentId: z.ZodString;
        displayText: z.ZodString;
        prefixText: z.ZodString;
        suffixText: z.ZodString;
    }, z.core.$strict>;
    question: z.ZodString;
    mode: z.ZodEnum<{
        observer: "observer";
        "exact-fork": "exact-fork";
        "exact-when-available": "exact-when-available";
    }>;
    scenario: z.ZodOptional<z.ZodEnum<{
        qa: "qa";
        present: "present";
        read: "read";
        investigate: "investigate";
    }>>;
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
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"document-import">;
    requestId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    format: z.ZodEnum<{
        text: "text";
        markdown: "markdown";
    }>;
    content: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"documents">;
}, z.core.$strict>, z.ZodObject<{
    action: z.ZodLiteral<"document-get">;
    documentId: z.ZodString;
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
            scenario: z.ZodEnum<{
                qa: "qa";
                present: "present";
                read: "read";
                investigate: "investigate";
            }>;
            documentId: z.ZodNullable<z.ZodString>;
            citation: z.ZodNullable<z.ZodObject<{
                entry: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"assistant-message">;
                    anchorSeq: z.ZodNumber;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"tool-result">;
                    anchorSeq: z.ZodNumber;
                    callId: z.ZodString;
                    toolName: z.ZodString;
                    projection: z.ZodEnum<{
                        "result-text": "result-text";
                        terminal: "terminal";
                        diff: "diff";
                    }>;
                    fileIndex: z.ZodOptional<z.ZodNumber>;
                    side: z.ZodOptional<z.ZodEnum<{
                        old: "old";
                        new: "new";
                    }>>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"document-range">;
                    documentId: z.ZodString;
                    startOffset: z.ZodNumber;
                    endOffset: z.ZodNumber;
                }, z.core.$strict>], "kind">;
                selectionFingerprint: z.ZodString;
                createdAt: z.ZodNumber;
                sourceSessionId: z.ZodString;
                anchorSeq: z.ZodNumber;
                startOffset: z.ZodNumber;
                endOffset: z.ZodNumber;
                sourceText: z.ZodString;
                displayText: z.ZodString;
                prefixText: z.ZodString;
                suffixText: z.ZodString;
                schemaVersion: z.ZodLiteral<4>;
            }, z.core.$strict>>;
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
        board: z.ZodOptional<z.ZodObject<{
            version: z.ZodLiteral<4>;
            revision: z.ZodNumber;
            elements: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                kind: z.ZodEnum<{
                    text: "text";
                    markdown: "markdown";
                    math: "math";
                    svg: "svg";
                    html: "html";
                    image: "image";
                    table: "table";
                }>;
                content: z.ZodString;
                x: z.ZodNumber;
                y: z.ZodNumber;
                w: z.ZodNumber;
                h: z.ZodNumber;
                style: z.ZodObject<{
                    color: z.ZodOptional<z.ZodString>;
                    fontSize: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>;
                focused: z.ZodBoolean;
                animation: z.ZodOptional<z.ZodObject<{
                    name: z.ZodEnum<{
                        "fade-in": "fade-in";
                        "slide-in": "slide-in";
                        pulse: "pulse";
                        highlight: "highlight";
                    }>;
                    durationMs: z.ZodNumber;
                    iterations: z.ZodNumber;
                    run: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            invalid: z.ZodNumber;
        }, z.core.$strict>>;
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
        scenario: z.ZodEnum<{
            qa: "qa";
            present: "present";
            read: "read";
            investigate: "investigate";
        }>;
        documentId: z.ZodNullable<z.ZodString>;
        citation: z.ZodNullable<z.ZodObject<{
            entry: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"assistant-message">;
                anchorSeq: z.ZodNumber;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"tool-result">;
                anchorSeq: z.ZodNumber;
                callId: z.ZodString;
                toolName: z.ZodString;
                projection: z.ZodEnum<{
                    "result-text": "result-text";
                    terminal: "terminal";
                    diff: "diff";
                }>;
                fileIndex: z.ZodOptional<z.ZodNumber>;
                side: z.ZodOptional<z.ZodEnum<{
                    old: "old";
                    new: "new";
                }>>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"document-range">;
                documentId: z.ZodString;
                startOffset: z.ZodNumber;
                endOffset: z.ZodNumber;
            }, z.core.$strict>], "kind">;
            selectionFingerprint: z.ZodString;
            createdAt: z.ZodNumber;
            sourceSessionId: z.ZodString;
            anchorSeq: z.ZodNumber;
            startOffset: z.ZodNumber;
            endOffset: z.ZodNumber;
            sourceText: z.ZodString;
            displayText: z.ZodString;
            prefixText: z.ZodString;
            suffixText: z.ZodString;
            schemaVersion: z.ZodLiteral<4>;
        }, z.core.$strict>>;
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
    sourceSessionId: z.ZodString;
    topicId: z.ZodNumber;
    cleanup: z.ZodEnum<{
        complete: "complete";
        pending: "pending";
    }>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"document">;
    document: z.ZodObject<{
        documentId: z.ZodString;
        title: z.ZodString;
        format: z.ZodEnum<{
            text: "text";
            markdown: "markdown";
        }>;
        size: z.ZodNumber;
        importedAt: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"documents">;
    documents: z.ZodArray<z.ZodObject<{
        documentId: z.ZodString;
        title: z.ZodString;
        format: z.ZodEnum<{
            text: "text";
            markdown: "markdown";
        }>;
        size: z.ZodNumber;
        importedAt: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"document-content">;
    document: z.ZodObject<{
        documentId: z.ZodString;
        title: z.ZodString;
        format: z.ZodEnum<{
            text: "text";
            markdown: "markdown";
        }>;
        content: z.ZodString;
        truncated: z.ZodBoolean;
    }, z.core.$strict>;
}, z.core.$strict>], "kind">;
export type CiteCiterResponse = z.infer<typeof citeCiterResponseSchema>;
/** Fields whose canonical serialization defines evidence identity. */
export type CitationIdentity = Omit<CitationDraft, 'selectionFingerprint'> & {
    readonly entry?: CitationEntry;
};
/** Serialize the identity-bearing fields. Legacy drafts without an entry keep their v3 identity. */
export declare function canonicalCitationIdentity(citation: CitationIdentity): string;
/** Render the immutable Citation as explicitly untrusted user-role context. */
export declare function renderCitationContext(citation: CitationRecord): string;
export {};

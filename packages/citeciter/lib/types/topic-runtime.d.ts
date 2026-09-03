import { Context } from '@deepseek-ai/cordis';
import { type SessionEvent, type SessionHeader } from '@deepseek-ai/dsh-session';
import { type SessionTitleProviderRequest } from '@deepseek-ai/dsh-session-title';
import { z } from 'zod';
import { type BoardSnapshot } from './board.ts';
import { type ObserverSourceSnapshot } from './observer.ts';
import { type CiteCiterRequest, type CiteCiterResponse, type CiteCiterSettings, type CitationRecord, type TopicMessage, type TopicMetadata, type TopicMode, type TopicScenario, type TopicSummary } from './topic.ts';
type CreateRequest = Extract<CiteCiterRequest, {
    action: 'create';
}>;
type DeleteResponse = Extract<CiteCiterResponse, {
    kind: 'deleted';
}>;
type TopicChangeListener = (name: 'created' | 'updated' | 'deleted', payload: {
    topic: TopicSummary;
} | Omit<DeleteResponse, 'kind'>) => void;
/** Decide both model visibility and execution access for one private Topic tool. */
export declare function citeCiterToolAvailable(name: string, allowSourceFiles: boolean, scenario?: TopicScenario): boolean;
/**
 * Render selected evidence only when this Topic actually owns a Citation.
 * @param citation - immutable Citation or explicit absence for a free Topic.
 * @returns model context text, or `undefined` when no quote was selected.
 */
export declare function topicCitationContext(citation: CitationRecord | null): string | undefined;
/**
 * Keep product safety and scenario rules authoritative over optional teaching-style preferences.
 * @param scenario - Topic behavior selected at creation.
 * @param custom - optional user-authored teaching preferences.
 * @returns the complete tutor prompt.
 */
export declare function composeTutorPrompt(scenario: TopicScenario, custom: string | undefined): string;
/** Complete model-visible parameter schema for blackboard_apply. */
export declare const BLACKBOARD_APPLY_PARAMETERS: {
    readonly ops: {
        readonly type: "array";
        readonly required: true;
        readonly description: "Ordered atomic batch containing 1-50 board operations.";
        readonly items: {
            readonly oneOf: readonly [{
                readonly type: "object";
                readonly additionalProperties: false;
                readonly properties: {
                    readonly op: {
                        readonly type: "string";
                        readonly const: "clear";
                        readonly required: true;
                    };
                };
            }, {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly properties: {
                    readonly style: {
                        readonly type: "object";
                        readonly additionalProperties: false;
                        readonly properties: {
                            readonly color: {
                                readonly type: "string";
                                readonly description: "CSS color restricted by the board validator.";
                            };
                            readonly fontSize: {
                                readonly type: "string";
                                readonly description: "CSS length in px, em, rem, or percent.";
                            };
                        };
                    };
                    readonly x: {
                        readonly type: "number";
                        readonly required: true;
                        readonly description: "Left edge as canvas percent; x + w must be at most 100.";
                    };
                    readonly y: {
                        readonly type: "number";
                        readonly required: true;
                        readonly description: "Top edge as canvas percent; y + h must be at most 100.";
                    };
                    readonly w: {
                        readonly type: "number";
                        readonly required: true;
                        readonly description: "Width as canvas percent, from 0.5 to 100.";
                    };
                    readonly h: {
                        readonly type: "number";
                        readonly required: true;
                        readonly description: "Height as canvas percent, from 0.5 to 100.";
                    };
                    readonly op: {
                        readonly type: "string";
                        readonly const: "set";
                        readonly required: true;
                    };
                    readonly id: {
                        readonly type: "string";
                        readonly required: true;
                    };
                    readonly kind: {
                        readonly type: "string";
                        readonly enum: readonly ["text", "markdown", "math", "svg", "html", "image", "table"];
                        readonly required: true;
                    };
                    readonly content: {
                        readonly type: "string";
                        readonly required: true;
                    };
                };
            }, {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly properties: {
                    readonly op: {
                        readonly type: "string";
                        readonly const: "update";
                        readonly required: true;
                    };
                    readonly id: {
                        readonly type: "string";
                        readonly required: true;
                    };
                    readonly content: {
                        readonly type: "string";
                    };
                    readonly x: {
                        readonly type: "number";
                    };
                    readonly y: {
                        readonly type: "number";
                    };
                    readonly w: {
                        readonly type: "number";
                    };
                    readonly h: {
                        readonly type: "number";
                    };
                    readonly style: {
                        readonly type: "object";
                        readonly additionalProperties: false;
                        readonly properties: {
                            readonly color: {
                                readonly type: "string";
                                readonly description: "CSS color restricted by the board validator.";
                            };
                            readonly fontSize: {
                                readonly type: "string";
                                readonly description: "CSS length in px, em, rem, or percent.";
                            };
                        };
                    };
                };
            }, {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly properties: {
                    readonly op: {
                        readonly type: "string";
                        readonly const: "remove";
                        readonly required: true;
                    };
                    readonly id: {
                        readonly type: "string";
                        readonly required: true;
                    };
                };
            }, {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly properties: {
                    readonly x: {
                        readonly type: "number";
                        readonly required: true;
                        readonly description: "Left edge as canvas percent; x + w must be at most 100.";
                    };
                    readonly y: {
                        readonly type: "number";
                        readonly required: true;
                        readonly description: "Top edge as canvas percent; y + h must be at most 100.";
                    };
                    readonly w: {
                        readonly type: "number";
                        readonly required: true;
                        readonly description: "Width as canvas percent, from 0.5 to 100.";
                    };
                    readonly h: {
                        readonly type: "number";
                        readonly required: true;
                        readonly description: "Height as canvas percent, from 0.5 to 100.";
                    };
                    readonly op: {
                        readonly type: "string";
                        readonly const: "clear_region";
                        readonly required: true;
                    };
                };
            }, {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly properties: {
                    readonly op: {
                        readonly type: "string";
                        readonly const: "animate";
                        readonly required: true;
                    };
                    readonly id: {
                        readonly type: "string";
                        readonly required: true;
                    };
                    readonly animation: {
                        readonly type: "string";
                        readonly enum: readonly ["fade-in", "slide-in", "pulse", "highlight"];
                        readonly required: true;
                    };
                    readonly durationMs: {
                        readonly type: "integer";
                        readonly description: "Animation duration from 50 to 5000 milliseconds.";
                    };
                    readonly iterations: {
                        readonly type: "integer";
                        readonly description: "Iteration count from 1 to 5.";
                    };
                };
            }, {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly properties: {
                    readonly op: {
                        readonly type: "string";
                        readonly const: "focus";
                        readonly required: true;
                    };
                    readonly id: {
                        readonly oneOf: readonly [{
                            readonly type: "string";
                        }, {
                            readonly type: "null";
                        }];
                        readonly required: true;
                        readonly description: "Existing element id, or null to clear focus.";
                    };
                };
            }];
        };
    };
};
/** Select the first human question added after a Topic's inherited seed. */
export declare function selectTopicTitleMessage(request: SessionTitleProviderRequest): import("@deepseek-ai/dsh-session-title").SessionTitleUserMessage;
/** Session header and events used to project one private Topic. */
export interface RuntimeTopicLog {
    readonly header: SessionHeader;
    readonly events: readonly SessionEvent[];
}
/**
 * Remove one artifact from a caller-owned JSONL root without following links.
 * @param root - fixed private JSONL root owned by the caller.
 * @param artifact - location returned by that exact JSONL backend.
 * @returns when the file/link and its empty per-session directory are absent.
 */
export declare function removeOwnedJsonlArtifact(root: string, artifact: {
    readonly kind: string;
    readonly path: string;
} | undefined): Promise<void>;
declare const topicDeletionMarkerSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    sessionId: z.ZodString;
    sourceSessionId: z.ZodString;
    topicId: z.ZodNumber;
    sessionHeader: z.ZodObject<{
        version: z.ZodNumber;
        id: z.ZodString;
        createdAt: z.ZodNumber;
        cwd: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
type TopicDeletionMarker = Omit<z.infer<typeof topicDeletionMarkerSchema>, 'sessionHeader'> & {
    readonly sessionHeader: SessionHeader;
};
/** Minimal on-disk navigation index; Session history stays in standard DSH JSONL. */
export declare class TopicIndex {
    private readonly root;
    /** @param root - private Topic index root. */
    constructor(root?: string);
    reserve(sourceSessionId: string): Promise<{
        topicId: number;
        directory: string;
    }>;
    save(metadata: TopicMetadata): Promise<void>;
    loadBySessionId(sessionId: string): Promise<TopicMetadata>;
    list(sourceSessionId: string): Promise<TopicMetadata[]>;
    /** Commit a minimal deletion marker before making Topic metadata unreachable. */
    markDeleting(metadata: TopicMetadata, sessionHeader: SessionHeader): Promise<TopicDeletionMarker>;
    /** Discover committed deletion markers without following linked directories. */
    listDeleting(): Promise<TopicDeletionMarker[]>;
    /** Remove the marker and its now-empty Topic directory after artifact cleanup. */
    finishDeleting(marker: TopicDeletionMarker): Promise<void>;
    private directory;
    private read;
    private readIfPresent;
    private deletionMarkerIfPresent;
}
/**
 * Project transcript rows and the latest turn's active failure banner.
 * @param log - private Topic Session contents.
 * @returns transcript rows plus an error only while the newest turn remains failed.
 */
export declare function topicMessages(log: RuntimeTopicLog): {
    messages: TopicMessage[];
    error: string | null;
};
/**
 * Project final blackboard state from successful blackboard_apply call/result pairs.
 * @param log - private Topic Session contents.
 * @returns versioned final state, successful commit revision, and invalid-commit count.
 */
export declare function projectBoardFromLog(log: RuntimeTopicLog): BoardSnapshot;
/**
 * Return the first genuine Topic question after any Exact Fork seed.
 * @param log - private Topic Session contents.
 * @returns the first post-seed question, or `null` when it has not been committed.
 */
export declare function firstPostSeedUserQuestion(log: RuntimeTopicLog): string | null;
/**
 * Find a post-seed user question by its durable message identifier.
 * @param log - private Topic Session contents.
 * @param messageId - request identity stored as the user-message identity.
 * @returns the matching question, or `null` when the request is not committed.
 */
export declare function postSeedUserQuestionById(log: RuntimeTopicLog, messageId: string): string | null;
/** Fold only titles created inside the private Topic, excluding inherited fork titles. */
export declare function foldTopicTitle(metadata: TopicMetadata, events: readonly SessionEvent[]): import("@deepseek-ai/dsh-session-title").SessionTitleSnapshot | undefined;
/** Resolve the actual Topic mode without forking through an open DSH turn. */
export declare function resolveTopicModeAndSeed(requested: CreateRequest, source: ObserverSourceSnapshot, anchorSeq: number): {
    mode: TopicMode;
    forkThroughSeq: number | null;
    seed: readonly SessionEvent[];
};
/** One process-local private DSH tree with standard Session logs and Agent loop. */
export declare class TopicRuntime {
    private readonly host;
    private readonly settings;
    private readonly runtime;
    private readonly index;
    private readonly documents;
    private readonly lifecycleAbort;
    private readonly fibers;
    private readonly handles;
    private readonly selections;
    private readonly opening;
    private readonly requests;
    private readonly cleanupFailures;
    private readonly pendingQuestions;
    private readonly creations;
    private readonly asks;
    private readonly topicAdmissions;
    private readonly deleting;
    private readonly titleRefreshes;
    private readonly titleRefreshAttempted;
    private readonly titleHydrated;
    private readonly sourceAvailability;
    private readonly sourceAvailabilityChecks;
    private readonly ready;
    private readonly topicListeners;
    private disposal;
    private releasing;
    private releaseLlm;
    private releaseFs;
    private releaseSubprocess;
    private releaseSandboxPolicy;
    private releaseQuestionProvider;
    private hasSourceFiles;
    private closed;
    /** @param host - owning DSH context. @param settings - current user preferences. */
    constructor(host: Context, settings?: () => CiteCiterSettings);
    /** Wait until every private DSH service has started. */
    initialize(): Promise<void>;
    /** Execute one validated browser command against private Topics. */
    request(rawRequest: CiteCiterRequest, callerSignal: AbortSignal): Promise<CiteCiterResponse>;
    /**
     * Observe committed Topic state changes.
     * @param listener - receives the change kind and durable summary.
     * @returns disposer removing the exact listener.
     */
    onTopicChange(listener: TopicChangeListener): () => void;
    private executeRequest;
    /** Stop every owned Agent and plugin fiber before releasing bridged services. */
    dispose(): Promise<void>;
    private disposeOwned;
    private beginClosing;
    private assertOpen;
    private start;
    private releaseRuntime;
    private releaseOwnedRuntime;
    private settleOwnedOperations;
    private create;
    /** Let a caller stop waiting without cancelling an accepted idempotent mutation. */
    private waitForCaller;
    private createIdempotent;
    private resumeOrCreate;
    private createHandle;
    private setupAgent;
    private globTool;
    private blackboardApplyTool;
    private readDocumentTool;
    private searchDocumentTool;
    private sourceTool;
    private ensureHandle;
    private disposeLateHandle;
    /** Resolve only after the accepted question is present in the durable model-input log. */
    private commitFollowup;
    private ask;
    private askIdempotent;
    private queueAsk;
    private queueTopicAdmission;
    private askUser;
    private answerQuestion;
    private cancelQuestion;
    private stop;
    private rename;
    private archive;
    private delete;
    private deleteAdmitted;
    /** Await rc.2 JSONL retirement without populating its prepared-session cache. */
    private readRetiredSessionHeader;
    /** Remove one artifact only from CiteCiter's fixed private JSONL backend. */
    private removeSessionArtifact;
    private finishDeletion;
    private recoverDeletions;
    private clearDeletedTopicState;
    private enqueueModelChange;
    private setModelRoute;
    private setReasoningEffort;
    private selectModel;
    private applyModelSelection;
    private importDocument;
    private models;
    private list;
    private summary;
    private summaryFromMetadata;
    private get;
    private readLog;
    private scheduleSourceAvailabilityCheck;
    private rememberSourceAvailability;
    private snapshot;
    private patchMetadata;
    private patchMetadataSerialized;
    private scheduleExactTitleRefresh;
}
export {};

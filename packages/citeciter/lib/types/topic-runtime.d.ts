import type { Context } from '@deepseek-ai/cordis';
import { type SessionEvent, type SessionHeader, type SessionLogOffset } from '@deepseek-ai/dsh-session';
import { type BoardSnapshot } from './board.ts';
import { type CiteCiterRequest, type CiteCiterResponse, type CiteCiterSettings, type TopicMessage, type TopicSummary } from './topic.ts';
type DeleteResponse = Extract<CiteCiterResponse, {
    kind: 'deleted';
}>;
type TopicChangeListener = (name: 'created' | 'updated' | 'deleted', payload: {
    topic: TopicSummary;
} | Omit<DeleteResponse, 'kind'>) => void;
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
/** Session header and events used to project one Topic. */
export interface RuntimeTopicLog {
    readonly header: SessionHeader;
    readonly events: readonly SessionEvent[];
    readonly inheritedEventCount: SessionLogOffset;
    readonly liveMessage?: TopicMessage | undefined;
    readonly renderKeys?: ReadonlyMap<number, string> | undefined;
}
/**
 * Project transcript rows and the latest turn's active failure banner.
 * @param log - Topic Session contents; an inherited prefix from older versions is skipped.
 * @returns transcript rows plus an error only while the newest turn remains failed.
 */
export declare function topicMessages(log: RuntimeTopicLog): {
    messages: TopicMessage[];
    error: string | null;
};
/**
 * Project final blackboard state from successful blackboard_apply call/result pairs.
 * @param log - Topic Session contents.
 * @returns versioned final state, successful commit revision, and invalid-commit count.
 */
export declare function projectBoardFromLog(log: RuntimeTopicLog): BoardSnapshot;
/**
 * Fold Topic-owned titles, skipping an inherited prefix kept by older Topics.
 * @param log - restored Topic events and the host-owned inherited event count.
 * @returns the latest Topic title projection, or undefined before any title is recorded.
 */
export declare function foldTopicTitle(log: RuntimeTopicLog): import("@deepseek-ai/dsh-session-title").SessionTitleSnapshot | undefined;
/** Process-local Topic coordinator over native DSH Sessions stored in each source's Citer directory. */
export declare class TopicRuntime {
    private readonly host;
    private readonly settings;
    private readonly native;
    private readonly index;
    private readonly sourceStorage;
    private readonly documents;
    private readonly lifecycleAbort;
    private readonly handles;
    private readonly opening;
    private readonly requests;
    private readonly pendingQuestions;
    private readonly questionReplies;
    private readonly creations;
    private readonly asks;
    private readonly topicAdmissions;
    private readonly deleting;
    private readonly titleHydrated;
    private readonly sourceAvailability;
    private readonly sourceAvailabilityChecks;
    private readonly ready;
    private readonly topicListeners;
    private readonly streams;
    private readonly boardCapture;
    private disposal;
    private releasing;
    private closed;
    /** @param host - owning DSH context. @param settings - current user preferences. */
    constructor(host: Context, settings?: () => CiteCiterSettings);
    /** Wait until source roots are bound and interrupted deletions and migrations have finished. */
    initialize(): Promise<void>;
    /** Execute one validated browser command against Topics. */
    request(rawRequest: CiteCiterRequest, callerSignal: AbortSignal): Promise<CiteCiterResponse>;
    /**
     * Observe committed Topic state changes.
     * @param listener - receives the change kind and durable summary.
     * @returns disposer removing the exact listener.
     */
    onTopicChange(listener: TopicChangeListener): () => void;
    private executeRequest;
    /** Stop every owned Agent before releasing bridged services. */
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
    /** A retried request returns the Topic its first attempt committed. */
    private resumeOrCreate;
    private createHandle;
    /** Contribute Citer prompts, tools and observers to one native Topic Agent. */
    private setupAgent;
    private learningCardsTool;
    private blackboardApplyTool;
    /** Keep storage and submitted-reference authorization outside the shared document tool contract. */
    private registerDocumentTools;
    /** Read the source only after the user has sent its address as an attachment. */
    private registerSourceTool;
    private ensureHandle;
    /** Submit a question through the Host session controller, as the composer would. */
    private ask;
    private askIdempotent;
    private queueAsk;
    private queueTopicAdmission;
    /** Validate partial selections against the exact Host question, without normalizing unsent text. */
    private validateQuestionDraft;
    /** Commit cleanup through the same admission queue as saves and permanent deletion. */
    private trackQuestionDraftReceipts;
    private askUser;
    private answerQuestion;
    private cancelQuestion;
    private timeoutQuestion;
    private stop;
    private rename;
    private archive;
    /** Restore only admissions newer than the latest explicit archive; serialize with rename/delete/archive. */
    private restoreSubmittedTopic;
    private delete;
    private deleteAdmitted;
    /** Observe the retired Session after its Agent has released write ownership. */
    private readRetiredSessionHeader;
    private finishDeletion;
    private recoverDeletions;
    private clearDeletedTopicState;
    private setModelRoute;
    private setReasoningEffort;
    private importDocument;
    private models;
    private list;
    private summary;
    private summaryFromMetadata;
    /** Serialize reads/saves with deletion and report only durable, exact deletion evidence. */
    private withOwnedTopic;
    private readLog;
    private scheduleSourceAvailabilityCheck;
    private rememberSourceAvailability;
    private snapshot;
    /** Recover persisted blocking cards only; rendering never enqueues a model request. */
    private recoveredBlockingQuestions;
    private patchMetadata;
    private patchMetadataSerialized;
}
export {};

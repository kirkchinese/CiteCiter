import { Context } from '@deepseek-ai/cordis';
import { type SessionEvent, type SessionHeader } from '@deepseek-ai/dsh-session';
import { type SessionTitleProviderRequest } from '@deepseek-ai/dsh-session-title';
import { type ObserverSourceSnapshot } from './observer.ts';
import { type CiteCiterRequest, type CiteCiterResponse, type CiteCiterSettings, type TopicMetadata, type TopicMode } from './topic.ts';
type CreateRequest = Extract<CiteCiterRequest, {
    action: 'create';
}>;
/** Decide both model visibility and execution access for one private Topic tool. */
export declare function citeCiterToolAvailable(name: string, allowSourceFiles: boolean): boolean;
/** Select the first human question added after a Topic's inherited seed. */
export declare function selectTopicTitleMessage(request: SessionTitleProviderRequest): import("@deepseek-ai/dsh-session-title").SessionTitleUserMessage;
/** Session header and events used to project one private Topic. */
export interface RuntimeTopicLog {
    readonly header: SessionHeader;
    readonly events: readonly SessionEvent[];
}
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
    remove(metadata: TopicMetadata): Promise<void>;
    private directory;
    private read;
    private readIfPresent;
}
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
    private readonly modelChanges;
    private readonly titleRefreshes;
    private readonly titleRefreshAttempted;
    private readonly titleHydrated;
    private readonly sourceAvailability;
    private readonly sourceAvailabilityChecks;
    private readonly ready;
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
    private removeSessionArtifact;
    private enqueueModelChange;
    private setModelRoute;
    private setReasoningEffort;
    private selectModel;
    private applyModelSelection;
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
    private scheduleExactTitleRefresh;
}
export {};

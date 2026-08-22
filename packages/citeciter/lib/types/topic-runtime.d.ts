import { Context } from '@deepseek-ai/cordis';
import { type SessionEvent } from '@deepseek-ai/dsh-session';
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
    private readonly fibers;
    private readonly handles;
    private readonly selections;
    private readonly opening;
    private readonly pendingQuestions;
    private readonly creations;
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
    request(rawRequest: CiteCiterRequest): Promise<CiteCiterResponse>;
    /** Stop every owned Agent and plugin fiber before releasing bridged services. */
    dispose(): Promise<void>;
    private disposeOwned;
    private start;
    private releaseRuntime;
    private releaseOwnedRuntime;
    private create;
    private createIdempotent;
    private createHandle;
    private setupAgent;
    private globTool;
    private sourceTool;
    private ensureHandle;
    private ask;
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
    private readLog;
    private scheduleSourceAvailabilityCheck;
    private rememberSourceAvailability;
    private snapshot;
    private patchMetadata;
    private scheduleExactTitleRefresh;
}
export {};

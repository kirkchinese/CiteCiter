import type { Context } from '@deepseek-ai/cordis';
import { type CiteCiterRequest, type CiteCiterResponse, type CiteCiterSettings, type TopicSummary } from './topic.ts';
type DeleteResponse = Extract<CiteCiterResponse, {
    kind: 'deleted';
}>;
type TopicChangeListener = (name: 'created' | 'updated' | 'deleted', payload: {
    topic: TopicSummary;
} | Omit<DeleteResponse, 'kind'>) => void;
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

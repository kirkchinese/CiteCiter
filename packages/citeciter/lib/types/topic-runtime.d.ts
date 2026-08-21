import { Context } from '@deepseek-ai/cordis';
import { type CiteCiterRequest, type CiteCiterResponse, type CiteCiterSettings } from './topic.ts';
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
    private createHandle;
    private setupAgent;
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
    private selectModel;
    private models;
    private list;
    private readLog;
    private sourceAvailable;
    private snapshot;
}

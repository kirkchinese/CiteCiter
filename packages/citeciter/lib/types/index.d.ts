/** Host entry for private Observer Topics and their browser Remote API. */
import { Service, type Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import z from '@deepseek-ai/schemastery';
import { type UpdateCheckResponse } from './update.ts';
import { type CiteCiterRequest, type CiteCiterResponse } from './topic.ts';
/** Cordis/Typert package identity. */
export declare const name = "@kirkchinese/dsh-citeciter";
/** Services required by the private Topic runtime. */
export declare const inject: readonly ["llm", "sessionQuery", "subprocess"];
/** Host settings identity shared with the browser settings scope. */
export declare const CITECITER_SETTINGS_NS: import("@deepseek-ai/dsh-settings").SettingsNamespace;
/** Native settings schema for new Topics and the companion panel. */
export declare const CITECITER_SETTINGS_SCHEMA: z<object>;
/** Root-scoped Remote service owning one isolated DSH runtime. */
export declare class CiteCiterHost extends TypertRemoteService {
    static inject: readonly ["llm", "sessionQuery", "subprocess"];
    private readonly topics;
    private readonly updates;
    private readonly service;
    private releaseService;
    constructor(ctx: Context);
    /** Do not publish the Remote service until its private runtime is ready. */
    [Service.init](): Promise<void>;
    /** Resolve one create/ask command into a committed Topic snapshot. */
    private topicSnapshot;
    /** Validate and execute one strict Topic command. */
    request(rawRequest: CiteCiterRequest, signal: AbortSignal): Promise<CiteCiterResponse>;
    /** Check npm for an installable stable version without changing this installation. */
    checkUpdate(signal: AbortSignal): Promise<UpdateCheckResponse>;
}
/** Register optional settings and mount the Host Remote service. */
export declare function apply(ctx: Context): Promise<void>;
export type { CiteCiterService } from './service.ts';
export { updateCheckErrorCodeSchema, updateCheckResponseSchema } from './update.ts';
export type { UpdateCheckErrorCode, UpdateCheckResponse } from './update.ts';
export type { CiteCiterRequest, CiteCiterResponse, CiteCiterSettings, CitationSelectionClaim, CitationDraft, CitationEntry, CitationEvidence, CitationRecord, DocumentContent, DocumentEvidenceClaim, DocumentFormat, DocumentSummary, ToolEvidenceClaim, TopicMode, TopicScenario, TopicSnapshot, TopicSummary, } from './topic.ts';
export default CiteCiterHost;

/** Host entry for private Observer Topics and their browser Remote API. */
import { Service, type Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import z from '@deepseek-ai/schemastery';
import { type CiteCiterRequest, type CiteCiterResponse } from './topic.ts';
/** Cordis/Typert package identity. */
export declare const name = "@kirkchinese/dsh-citeciter";
/** Services required by the private Topic runtime. */
export declare const inject: readonly ["llm", "sessionQuery", "subprocess"];
/** Host settings identity shared with the browser settings scope. */
export declare const CITECITER_SETTINGS_NS: import("@deepseek-ai/dsh-settings").SettingsNamespace;
/** Native settings schema for new Topics and the companion panel. */
export declare const CITECITER_SETTINGS_SCHEMA: z<Schemastery.ObjectS<{
    defaultMode: z<"observer" | "exact-when-available", "observer" | "exact-when-available">;
    includeSourceReasoning: z<boolean, boolean>;
    allowSourceFiles: z<boolean, boolean>;
    panelWidthPercent: z<number, number>;
    reopenLastTopic: z<boolean, boolean>;
}>, Schemastery.ObjectT<{
    defaultMode: z<"observer" | "exact-when-available", "observer" | "exact-when-available">;
    includeSourceReasoning: z<boolean, boolean>;
    allowSourceFiles: z<boolean, boolean>;
    panelWidthPercent: z<number, number>;
    reopenLastTopic: z<boolean, boolean>;
}>>;
/** Root-scoped Remote service owning one isolated DSH runtime. */
export declare class CiteCiterHost extends TypertRemoteService {
    static inject: readonly ["llm", "sessionQuery", "subprocess"];
    private readonly topics;
    constructor(ctx: Context);
    /** Do not publish the Remote service until its private runtime is ready. */
    [Service.init](): Promise<void>;
    /** Validate and execute one strict Topic command. */
    request(rawRequest: CiteCiterRequest): Promise<CiteCiterResponse>;
}
/** Register optional settings and mount the Host Remote service. */
export declare function apply(ctx: Context): Promise<void>;
export type { CiteCiterRequest, CiteCiterResponse, CiteCiterSettings, CitationDraft, CitationRecord, TopicSnapshot, TopicSummary, } from './topic.ts';
export default CiteCiterHost;

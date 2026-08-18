import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { type CitationRecord } from './thread.ts';
/** Public Citation wire shape referenced by the strict Typert manifest. */
export type { CitationRecord } from './thread.ts';
/** Cordis/Typert service identity and package name. */
export declare const name = "@kirkchinese/dsh-citeciter";
export interface PrepareThreadResult {
    readonly ready: true;
    readonly citation: CitationRecord;
}
/** Host service for durable, isolated Citation Threads. */
export declare class CiteCiterHost extends TypertRemoteService {
    static inject: string[];
    private readonly active;
    private projectionRegistry;
    constructor(ctx: Context);
    /** Validate one forked child and install its immutable Citation Thread scope. */
    prepareThread(agent: Agent, rawCitation: CitationRecord): Promise<PrepareThreadResult>;
    private restore;
    private install;
}
/** Loader-facing namespace plugin wrapper (the bundle patch imports the package root). */
export declare const inject: readonly ["agents"];
/** Mount the Remote Service class inside the package entry's owning fiber. */
export declare function apply(ctx: Context): void;
export default CiteCiterHost;

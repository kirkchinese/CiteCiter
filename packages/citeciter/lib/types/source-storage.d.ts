import type { Context } from '@deepseek-ai/cordis';
/** Locate only source-owned Citer directories through the installed JSONL backend; persisted paths are never trusted. */
export declare class SourceStorage {
    private readonly host;
    private readonly pending;
    private historicalDirectories;
    constructor(host: Context);
    /** @returns a canonical source/citeciter directory, optionally creating its ownership marker. */
    root(sourceSessionId: string, create?: boolean): Promise<string | undefined>;
    private resolveRoot;
    /** Locate historical source containers only; DSH alone reads and migrates their logs. */
    private findHistoricalDirectories;
    /** Discover owned roots without creating directories or changing Host Session data. */
    discover(): Promise<ReadonlyMap<string, string>>;
}

import type { Context } from '@deepseek-ai/cordis';
/** Locate only source-owned Citer directories through the installed JSONL backend; persisted paths are never trusted. */
export declare class SourceStorage {
    private readonly host;
    private readonly pending;
    constructor(host: Context);
    /** @returns a canonical source/citeciter directory, optionally creating its ownership marker. */
    root(sourceSessionId: string, create?: boolean): Promise<string | undefined>;
    private resolveRoot;
    /**
     * Locate one historical source container; DSH alone reads and migrates its log. One directory probe per project,
     * never a listing of every Session.
     * @returns the directory, `undefined` when none holds a log, or `null` when more than one project does.
     */
    private findHistoricalDirectory;
    /**
     * Every project directory under the JSONL root with its Session directory names. Links and files are skipped,
     * and a project that cannot be listed is skipped with a warning instead of failing the whole scan.
     */
    private sessionDirectories;
    /**
     * Discover owned roots without creating directories or changing Host Session data.
     *
     * Startup cost must not grow with Sessions × projects. Resolving each listed Session through the backend scans
     * every project directory per Session: with 7,000 Sessions in 1,263 projects that took about 42 minutes and held
     * DSH at "Loading plugins". Instead the JSONL root is listed once, one `citeciter/owner.json` probe per Session
     * directory; only the few marked sources are then checked, and a source that cannot be checked is skipped with
     * a warning rather than failing discovery.
     * @param signal - aborts the scan when Citer shuts down.
     */
    discover(signal?: AbortSignal): Promise<ReadonlyMap<string, string>>;
    /** A source directory found by the scan, held to the checks `root()` applies: a real Session container. */
    private checkedRoot;
    /** Discovery for a backend without a configured root directory: one backend lookup per listed Session. */
    private discoverThroughBackend;
}

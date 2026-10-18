/** How the per-turn workspace notice reports changes. */
export type WorkspaceChangeMode = 'off' | 'summary' | 'diff';
/** One changed path between two snapshots. */
export interface WorkspaceFileChange {
    readonly path: string;
    readonly status: 'added' | 'modified' | 'deleted' | 'changed';
    /** Added and deleted line counts; null for binary files. */
    readonly added: number | null;
    readonly deleted: number | null;
}
/** Persisted snapshot cursor of one Topic. */
export interface WorkspaceSnapshotState {
    readonly version: 1;
    readonly root: string;
    /** Tree recorded when the latest turn began. */
    readonly tree: string;
    readonly time: number;
    /** Tree recorded when the turn before it began; null before the second turn. */
    readonly previousTree: string | null;
    readonly previousTime: number | null;
}
/** Result of advancing the snapshot at the start of a turn. */
export interface WorkspaceAdvance {
    readonly state: WorkspaceSnapshotState;
    /** Changes since the previous snapshot; null on the first snapshot. */
    readonly files: readonly WorkspaceFileChange[] | null;
    readonly elapsedMs: number | null;
}
/** Parse the persisted cursor field by field; anything malformed means no snapshot. */
export declare function readWorkspaceState(raw: unknown): WorkspaceSnapshotState | null;
/** Parse `git diff --numstat -z` and `--name-status -z` output (without rename detection). */
export declare function parseWorkspaceChanges(numstat: string, nameStatus: string): WorkspaceFileChange[];
/** Snapshots of one Topic's working directory, stored under a Citer-owned directory. */
export declare class WorkspaceSnapshots {
    private readonly directory;
    private readonly cwd;
    /**
     * @param directory - Citer-owned directory for the private index, objects and cursor.
     * @param cwd - the Topic's working directory inside a git work tree.
     */
    constructor(directory: string, cwd: string);
    private repository;
    private environment;
    private stage;
    /** Read the persisted cursor, or null before the first snapshot. */
    state(): Promise<WorkspaceSnapshotState | null>;
    private save;
    private changes;
    /**
     * Record a new snapshot at the start of a turn and report what changed since the previous one.
     * @param now - snapshot time.
     * @returns the new cursor and changes, or null outside a git work tree.
     */
    advance(now: number, signal?: AbortSignal): Promise<WorkspaceAdvance | null>;
    /**
     * Delete loose objects in the Citer-owned store that the kept trees no longer reach.
     * Only this store is touched; objects in the repository (the alternate) are never candidates.
     */
    private prune;
    /**
     * Diff the snapshot taken when the previous turn began (or this turn, before a previous one exists) against the live working tree.
     * @param paths - optional repository-relative paths to restrict the patch.
     * @returns changed files and their unified patches, or null when nothing has been recorded.
     */
    live(paths: readonly string[], signal?: AbortSignal): Promise<{
        readonly baseTime: number;
        readonly files: readonly WorkspaceFileChange[];
        readonly patch: string;
    } | null>;
    /** Unified patch of one path between two recorded trees. */
    filePatch(from: string, to: string, path: string, signal?: AbortSignal): Promise<string>;
}
/** Human-readable elapsed time such as "2h 13m" or "45s". */
export declare function formatElapsed(ms: number): string;
/** Markdown list of changed files with a total line count. */
export declare function renderFileList(files: readonly WorkspaceFileChange[]): string;
/** Name of the model tool that reads workspace changes. */
export declare const WORKSPACE_CHANGES_TOOL = "workspace_changes";
/**
 * Compose the per-turn workspace notice injected before the first step of a turn.
 * @param input - elapsed time, repository root, changed files, per-file patches (diff mode) and byte budget.
 * @returns the Markdown notice.
 */
export declare function renderWorkspaceNotice(input: {
    readonly elapsedMs: number;
    readonly root: string;
    readonly files: readonly WorkspaceFileChange[];
    readonly patches?: ReadonlyMap<string, string>;
    readonly budgetBytes?: number;
}): string;

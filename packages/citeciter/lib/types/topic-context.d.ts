/**
 * Per-turn context Citer appends to a Topic before its first step: an optional source excerpt
 * and a workspace change notice. Both are logged as sourced user messages, so model input
 * stays reconstructable from the Topic log.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { type UserMessage } from '@deepseek-ai/dsh-llm';
import type { SessionEvent } from '@deepseek-ai/dsh-session';
import type { ObserverSourceSnapshot } from './observer.ts';
import { type WorkspaceChangeMode, type WorkspaceSnapshots } from './workspace-changes.ts';
/** Producer kind of every message Citer itself appends to a Topic (DSH format v4 `plugin:<package>`). */
export declare const CITER_CONTEXT_KIND = "plugin:@kirkchinese/dsh-citeciter";
/** System prompt section describing workspace notices and their tool. */
export declare const WORKSPACE_SECTION_NAME = "@kirkchinese/dsh-citeciter:workspace";
/** Byte budget of one automatic source excerpt. */
export declare const SOURCE_WINDOW_BYTES: number;
/** Byte budget for patches inside one workspace notice in diff mode. */
export declare const WORKSPACE_NOTICE_PATCH_BYTES: number;
/** Static guidance; the changes themselves arrive as per-turn context messages. */
export declare const WORKSPACE_PROMPT = "Before your first step in a turn, Citer may add a \"Workspace changes\" context message listing files that changed in this Topic's git working tree since your previous turn began, with line counts and sometimes diffs. It is background awareness, not a request: mention or act on it only when it bears on the user's current request, and never assume a file's current content from a summary. Call workspace_changes to read line-level diffs since your previous turn began, optionally limited to paths; read files directly when you need their full current content.";
/**
 * Message sources in one Topic event that DSH's format v4 persistence refuses: a missing
 * source, an empty kind, or the retired `{ kind: 'plugin', plugin }` wrapper. Only the
 * attribution fields are returned, never message content, so they can be logged to name
 * the plugin that produced them.
 */
export declare function refusedMessageSources(event: {
    readonly type: string;
    readonly data?: unknown;
}): Array<{
    readonly kind: unknown;
    readonly plugin?: unknown;
}>;
/** Citer's own form of one context message it appended, or undefined for other messages. */
export declare function citerContextForm(source: {
    readonly kind: string;
} & Record<string, unknown>): string | undefined;
/**
 * Whether a proposed step would be the first of its turn: the latest `turn/start` for
 * that turn has no `step/start` after it yet.
 */
export declare function isFirstStepOfTurn(events: readonly {
    readonly type: string;
    readonly data?: unknown;
}[], turn: number): boolean;
/** The last source seq an automatic excerpt in this Topic log covered. */
export declare function lastSourceWindowSeq(events: readonly SessionEvent[]): number | null;
/**
 * Compose an automatic source excerpt: the records leading to a cited anchor, the newest records,
 * or the records added since the previous excerpt.
 * @returns the message, or null when there is nothing new.
 */
export declare function composeSourceWindow(source: ObserverSourceSnapshot, options: {
    readonly includeReasoning: boolean;
    readonly anchorSeq: number | null;
    readonly afterSeq: number | null;
}): UserMessage | null;
/** Dependencies the per-turn context needs from the Topic runtime. */
export interface TopicContextOptions {
    readonly agent: Agent;
    readonly autoReadSource: () => boolean;
    readonly workspaceMode: () => WorkspaceChangeMode;
    readonly includeReasoning: () => boolean;
    /** Whether the user has sent the source address, in the log or in this step's pending messages; reads are refused otherwise. */
    readonly sourceSent: (pending: readonly UserMessage[]) => boolean;
    readonly readSource: (signal: AbortSignal) => Promise<ObserverSourceSnapshot>;
    readonly anchorSeq: number | null;
    /** Null when the Topic has no working directory. */
    readonly workspace: WorkspaceSnapshots | null;
    readonly warn: (message: string, error: unknown) => void;
}
/**
 * Append Citer's per-turn context to one Topic Agent. The listener delegates first, adds messages
 * only when the step is entered, and never fails the turn because a context source is unavailable.
 */
export declare function attachTopicContext(agentCtx: Context, options: TopicContextOptions): void;
/**
 * The `workspace_changes` tool: line-level diffs since the previous turn began, against the live tree.
 * @param workspace - this Topic's snapshot store.
 */
export declare function createWorkspaceChangesTool(workspace: WorkspaceSnapshots): import("@deepseek-ai/dsh-tools").ToolDefinition;

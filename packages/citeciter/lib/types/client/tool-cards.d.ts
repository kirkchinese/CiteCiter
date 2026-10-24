import type { DiffHunk, ReadBlockLine, SearchFileGroup } from '@deepseek-ai/dsh-client-ui-primitives';
import type { TopicMessage } from '../topic.ts';
import type { QuestionReply } from '../question-reply.ts';
type ToolMessage = Extract<TopicMessage, {
    role: 'tool';
}>;
export type ToolCard = {
    readonly kind: 'read';
    readonly label: string;
    readonly lines: readonly ReadBlockLine[];
    readonly totalLines: number;
    readonly lang?: string;
} | {
    readonly kind: 'diff';
    readonly diffs: DiffHunk[];
    readonly added: number;
    readonly removed: number;
    readonly path: string;
} | {
    readonly kind: 'terminal';
    readonly command: string;
    readonly cwd?: string;
    readonly output?: string;
    readonly exitCode?: number | null;
    readonly signal?: string;
    readonly running: boolean;
} | {
    readonly kind: 'search';
    readonly shape: 'matches';
    readonly files: SearchFileGroup[];
    readonly total: number;
    readonly truncated: boolean;
    readonly recovery?: string;
} | {
    readonly kind: 'search';
    readonly shape: 'paths';
    readonly paths: string[];
    readonly total: number;
    readonly truncated: boolean;
    readonly recovery?: string;
};
/** Render a recorded read window only when its lines and model-facing envelope agree. */
export declare function deriveReadCard(message: ToolMessage): Extract<ToolCard, {
    kind: 'read';
}> | null;
/** Prefer the applied metadata hunks; an unconfirmed settled edit stays generic. */
export declare function deriveDiffCard(message: ToolMessage): Extract<ToolCard, {
    kind: 'diff';
}> | null;
/**
 * Added and removed line counts for the row summary: the lines left after the common leading and
 * trailing lines of each hunk. Exact for one contiguous edit, which is what edit tools record; the
 * expanded DiffBlock shows the precise diff.
 */
export declare function lineTotals(diffs: readonly DiffHunk[]): {
    added: number;
    removed: number;
};
/** Shell aliases share a terminal view, but run_code remains a parent tool tree. */
export declare function isShellTool(name: string): boolean;
/** Parse exit markers without ever treating the marker as command output. */
export declare function deriveTerminalCard(message: ToolMessage): Extract<ToolCard, {
    kind: 'terminal';
}> | null;
/** Validate retained search hits and counts before passing them to SearchBlock. */
export declare function deriveSearchCard(message: ToolMessage): Extract<ToolCard, {
    kind: 'search';
}> | null;
/** Reconstruct ordinary completed question choices when there is no late-reply projection. */
export declare function deriveQuestionReply(message: ToolMessage): QuestionReply | null;
/** Select one shared primitive, or null for the lossless generic tool inspector. */
export declare function deriveToolCard(message: ToolMessage): ToolCard | null;
export {};

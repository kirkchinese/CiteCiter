import { type ObserverSourceSnapshot } from './observer.ts';
export declare const SOURCE_READ_SECTION_NAME = "@kirkchinese/dsh-citeciter:source-read";
/** Describe the actual readable snapshot without injecting citation metadata or unsent attachments. */
export declare function sourceReadPrompt(frozen: boolean): string;
/**
 * Build the source-read contract independently of Session ownership and UI.
 * @param options - an authorized snapshot reader, reasoning preference and immutable-prefix flag.
 * @returns a native tool with explicit snapshot, range and continuation semantics.
 */
export declare function createSourceReadTool(options: {
    readonly read: (signal: AbortSignal) => Promise<ObserverSourceSnapshot>;
    readonly includeReasoning: () => boolean;
    readonly frozen: boolean;
}): import("@deepseek-ai/dsh-tools").ToolDefinition;

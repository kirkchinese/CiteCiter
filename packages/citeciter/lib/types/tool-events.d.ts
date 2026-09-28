import type { ContentBlock } from '@deepseek-ai/dsh-llm';
import type { SessionEvent } from '@deepseek-ai/dsh-session';
/** One committed tool dispatch, independent of native or run_code transport. */
export interface ToolCallRecord {
    readonly callId: string;
    readonly name: string;
    readonly arguments: string;
}
export interface ToolResultRecord {
    readonly callId: string;
    readonly content: readonly ContentBlock[];
    readonly isError: boolean;
    readonly meta?: SessionEvent<'tool/result'>['data']['meta'];
}
/** Normalize native and PTC starts using the actual child call identity. No synthetic model messages. */
export declare function toolCallRecord(event: SessionEvent): ToolCallRecord | undefined;
/** Normalize settled results for transcript, board, source and attachment readers. */
export declare function toolResultRecord(event: SessionEvent): ToolResultRecord | undefined;

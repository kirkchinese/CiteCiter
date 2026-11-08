import type { ContentBlock } from '@deepseek-ai/dsh-llm';
import type { SessionEvent } from '@deepseek-ai/dsh-session';
import type { QuestionToolOutcomeCode } from './tool-outcome-contract.ts';
/** A structured tool failure as logged on `tool/result` and `tool/ptc-dispatch`. */
export interface ToolErrorRecord {
    readonly name?: string;
    readonly code?: string;
}
/** One committed tool dispatch, independent of native or run_code transport. */
export interface ToolCallRecord {
    readonly callId: string;
    readonly name: string;
    readonly arguments: string;
    /** The run_code call that dispatched a programmatic child call. */
    readonly parentCallId?: string;
}
export interface ToolResultRecord {
    readonly callId: string;
    readonly content: readonly ContentBlock[];
    readonly isError: boolean;
    readonly errorCode?: QuestionToolOutcomeCode;
    readonly meta?: SessionEvent<'tool/result'>['data']['meta'];
}
/** A `run_code` child dispatch start: its own id, its direct parent and the outermost run_code call. */
export interface PtcStartRecord {
    readonly subCallId: string;
    readonly parentCallId: string;
    readonly rootCallId: string;
    readonly name: string;
    readonly arguments: unknown;
}
/** A settled `run_code` child dispatch; only its identity and outcome are required. */
export interface PtcDispatchRecord {
    readonly subCallId: string;
    readonly content: readonly ContentBlock[];
    readonly isError: boolean;
    readonly meta?: unknown;
    readonly error?: ToolErrorRecord;
}
/** @returns the PTC child start an event records, or undefined for any other or malformed event. */
export declare function ptcStartRecord(event: SessionEvent): PtcStartRecord | undefined;
/** @returns the settled PTC child an event records, or undefined for any other or malformed event. */
export declare function ptcDispatchRecord(event: SessionEvent): PtcDispatchRecord | undefined;
/** @returns the structured error of a settled native or PTC tool call, if it recorded one. */
export declare function toolErrorOf(event: SessionEvent): ToolErrorRecord | undefined;
/** Normalize native and PTC starts using the actual child call identity. No synthetic model messages. */
export declare function toolCallRecord(event: SessionEvent): ToolCallRecord | undefined;
/** Normalize settled results for transcript, board, source and attachment readers. */
export declare function toolResultRecord(event: SessionEvent): ToolResultRecord | undefined;

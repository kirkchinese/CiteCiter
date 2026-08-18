import type { ConversationSnapshot } from '@deepseek-ai/dsh-client-runtime/client';
/** One user-visible entry in the child-only Citation Thread transcript. */
export type TranscriptEntry = {
    readonly id: string;
    readonly role: 'user' | 'assistant' | 'error';
    readonly text: string;
    readonly streaming: boolean;
};
/**
 * Extract only child-owned genuine questions, answers, and durable errors.
 * Runtime-context and permission-command rows remain in the log but are not
 * duplicated in this focused teaching transcript.
 */
export declare function extractTranscript(snapshot: ConversationSnapshot, historyStartSeq: number): readonly TranscriptEntry[];

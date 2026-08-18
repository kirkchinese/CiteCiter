import type { ISessions, IWorkspaces, SessionId, SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import type { PrepareThreadResult } from '../index.ts';
import type { CitationRecord } from '../thread.ts';
import { type ThreadSummary } from './thread.ts';
import { type TranscriptEntry } from './transcript.ts';
import type { CiteSelection } from './types.ts';
export type ExplainPhase = 'idle' | 'draft' | 'creating' | 'ready' | 'running' | 'error';
export interface ExplainSnapshot {
    phase: ExplainPhase;
    selection: CiteSelection | null;
    activeThread: ThreadSummary | null;
    threads: readonly ThreadSummary[];
    transcript: readonly TranscriptEntry[];
    error: string | null;
}
export type PrepareThread = (sessionId: SessionId, citation: CitationRecord) => Promise<RemoteResult<PrepareThreadResult>>;
export interface ExplainFace {
    getSnapshot(): ExplainSnapshot;
    subscribe(listener: () => void): () => void;
    select(selection: CiteSelection): void;
    ask(question: string): Promise<void>;
    switchThread(sessionId: string): Promise<void>;
    renameActive(title: string): Promise<void>;
    archiveActive(): Promise<void>;
    stop(): Promise<void>;
    dispose(): Promise<void>;
}
/** Bind durable Thread orchestration to plugin-owned browser services and state. */
export declare function createExplainerController(sessions: ISessions, workspaces: IWorkspaces, prepareThread: PrepareThread, store: SnapshotStore<ExplainSnapshot>): ExplainFace;
export type { ThreadSummary, TranscriptEntry };

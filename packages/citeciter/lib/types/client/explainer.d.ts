import { type ISessions, type SessionId } from '@deepseek-ai/dsh-client-runtime/client';
import type { CiteSelection } from './types.ts';
export type ExplainPhase = 'idle' | 'creating' | 'ready' | 'running' | 'settled' | 'error';
export interface ExplainSnapshot {
    phase: ExplainPhase;
    childId: SessionId | null;
    selection: CiteSelection | null;
    answerText: string | null;
    error: string | null;
    permissionWarning: string | null;
}
export interface ExplainFace {
    getSnapshot(): ExplainSnapshot;
    subscribe(listener: () => void): () => void;
    start(selection: CiteSelection): Promise<void>;
    stop(): Promise<void>;
}
/** Create the explainer runtime owned by one plugin fiber. */
export declare function createExplainer(sessions: ISessions): ExplainFace;

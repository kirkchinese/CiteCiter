import type { ISessions, SessionId, SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
import type { CiteSelection } from './types.ts';
/** User-visible lifecycle state of one explanation request. */
export type ExplainPhase = 'idle' | 'creating' | 'ready' | 'running' | 'settled' | 'error';
/** Immutable value observed by the CiteCiter panel. */
export interface ExplainSnapshot {
    phase: ExplainPhase;
    childId: SessionId | null;
    selection: CiteSelection | null;
    answerText: string | null;
    error: string | null;
}
/** Observable actions owned by one CiteCiter plugin fiber. */
export interface ExplainFace {
    getSnapshot(): ExplainSnapshot;
    subscribe(listener: () => void): () => void;
    start(selection: CiteSelection): Promise<void>;
    stop(): Promise<void>;
    dispose(): Promise<void>;
}
/**
 * Bind the explanation state machine to a supplied snapshot store.
 *
 * A parent or anchor change detaches the old child and forks a correctly scoped
 * one. Work is serialized so repeated selections cannot create parallel children, and disposal
 * invalidates every in-flight await before it can install another subscription.
 *
 * @param sessions - DSH browser session service.
 * @param store - plugin-owned observable state store.
 * @returns observable explainer state and lifecycle actions.
 */
export declare function createExplainerController(sessions: ISessions, store: SnapshotStore<ExplainSnapshot>): ExplainFace;

import {
  createSnapshotStore,
  type ISessions,
  type IWorkspaces,
} from '@deepseek-ai/dsh-client-runtime/client'
import {
  createExplainerController,
  type ExplainFace,
  type ExplainSnapshot,
  type PrepareThread,
} from './explainer-controller.ts'

export type {
  ExplainFace,
  ExplainPhase,
  ExplainSnapshot,
  ThreadSummary,
  TranscriptEntry,
} from './explainer-controller.ts'

const EMPTY: ExplainSnapshot = {
  phase: 'idle',
  selection: null,
  activeThread: null,
  threads: [],
  transcript: [],
  error: null,
}

/** Create the plugin-owned durable Thread controller. */
export function createExplainer(
  sessions: ISessions,
  workspaces: IWorkspaces,
  prepareThread: PrepareThread,
): ExplainFace {
  return createExplainerController(
    sessions,
    workspaces,
    prepareThread,
    createSnapshotStore(EMPTY),
  )
}

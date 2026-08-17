import {
  createSnapshotStore,
  type ISessions,
} from '@deepseek-ai/dsh-client-runtime/client'
import {
  createExplainerController,
  type ExplainFace,
  type ExplainSnapshot,
} from './explainer-controller.ts'

export type { ExplainFace, ExplainPhase, ExplainSnapshot } from './explainer-controller.ts'

const EMPTY: ExplainSnapshot = {
  phase: 'idle',
  childId: null,
  selection: null,
  answerText: null,
  error: null,
}

/**
 * Create an explainer and its plugin-owned DSH snapshot store.
 * @param sessions - DSH browser session service.
 * @returns observable explainer state and lifecycle actions.
 */
export function createExplainer(sessions: ISessions): ExplainFace {
  return createExplainerController(sessions, createSnapshotStore(EMPTY))
}

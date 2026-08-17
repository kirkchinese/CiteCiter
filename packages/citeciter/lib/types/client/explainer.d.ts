import { type ISessions } from '@deepseek-ai/dsh-client-runtime/client';
import { type ExplainFace } from './explainer-controller.ts';
export type { ExplainFace, ExplainPhase, ExplainSnapshot } from './explainer-controller.ts';
/**
 * Create an explainer and its plugin-owned DSH snapshot store.
 * @param sessions - DSH browser session service.
 * @returns observable explainer state and lifecycle actions.
 */
export declare function createExplainer(sessions: ISessions): ExplainFace;

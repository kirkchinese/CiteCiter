import { type ISessions, type IWorkspaces } from '@deepseek-ai/dsh-client-runtime/client';
import { type ExplainFace, type PrepareThread } from './explainer-controller.ts';
export type { ExplainFace, ExplainPhase, ExplainSnapshot, ThreadSummary, TranscriptEntry, } from './explainer-controller.ts';
/** Create the plugin-owned durable Thread controller. */
export declare function createExplainer(sessions: ISessions, workspaces: IWorkspaces, prepareThread: PrepareThread): ExplainFace;

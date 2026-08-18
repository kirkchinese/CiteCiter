import { createSnapshotStore, } from '@deepseek-ai/dsh-client-runtime/client';
import { createExplainerController, } from "./explainer-controller.js";
const EMPTY = {
    phase: 'idle',
    selection: null,
    activeThread: null,
    threads: [],
    transcript: [],
    error: null,
};
/** Create the plugin-owned durable Thread controller. */
export function createExplainer(sessions, workspaces, prepareThread) {
    return createExplainerController(sessions, workspaces, prepareThread, createSnapshotStore(EMPTY));
}

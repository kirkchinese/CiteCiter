import { createSnapshotStore, } from '@deepseek-ai/dsh-client-runtime/client';
import { createExplainerController, } from "./explainer-controller.js";
const EMPTY = {
    phase: 'idle',
    childId: null,
    selection: null,
    answerText: null,
    error: null,
};
/**
 * Create an explainer and its plugin-owned DSH snapshot store.
 * @param sessions - DSH browser session service.
 * @returns observable explainer state and lifecycle actions.
 */
export function createExplainer(sessions) {
    return createExplainerController(sessions, createSnapshotStore(EMPTY));
}

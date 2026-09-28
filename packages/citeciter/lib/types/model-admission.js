/** Keep an unavailable inherited route visible until the user explicitly replaces it. */
export const MODEL_SELECTION_REQUIRED = '来源模型已不可用。草稿已保留，请选择可用模型后发送。';
/** A retired catalog entry must not discard a newly created, still empty Topic. Other failures propagate. */
export async function selectInitialModel(metadata, select) {
    try {
        await select();
    }
    catch (error) {
        if (typeof error !== 'object' || error === null || !('code' in error) || error.code !== 'session/model-unavailable')
            throw error;
        metadata.modelSelectionRequired = true;
    }
}
/** Check the durable flag before an explicit submission, without changing permissions or model defaults. */
export function requireSelectedModel(metadata) {
    if (metadata.modelSelectionRequired === true)
        throw new Error(MODEL_SELECTION_REQUIRED);
}

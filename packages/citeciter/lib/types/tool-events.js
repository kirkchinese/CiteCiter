/** Read only the public structured error taxonomy, never infer a verdict from model-visible text. */
function questionToolOutcomeCode(error) {
    if (typeof error !== 'object' || error === null || Array.isArray(error))
        return undefined;
    if (!('name' in error) || error.name !== 'UserQuestionError' || !('code' in error))
        return undefined;
    return error.code === 'ASK_CANCELLED' || error.code === 'ASK_ABORTED' ? error.code : undefined;
}
/** Normalize native and PTC starts using the actual child call identity. No synthetic model messages. */
export function toolCallRecord(event) {
    if (event.type === 'tool/call')
        return { callId: event.data.callId, name: event.data.name, arguments: event.data.arguments };
    if (event.type === 'tool/ptc-dispatch-start')
        return { callId: event.data.subCallId, name: event.data.name, arguments: JSON.stringify(event.data.arguments) };
    return undefined;
}
/** Normalize settled results for transcript, board, source and attachment readers. */
export function toolResultRecord(event) {
    if (event.type === 'tool/result') {
        const message = event.data.message;
        // 0.1.5 wraps content in one tool-result block; 0.1.7 puts identity on the message.
        const result = message.toolCallId === undefined
            ? message.content[0]
            : message;
        if (result.toolCallId === undefined)
            throw new Error('DSH 工具结果缺少调用身份');
        const errorCode = questionToolOutcomeCode(event.data.error);
        return {
            callId: result.toolCallId, content: result.content,
            isError: result.isError === true || event.data.error !== undefined,
            ...(errorCode === undefined ? {} : { errorCode }),
            ...(event.data.meta === undefined ? {} : { meta: event.data.meta }),
        };
    }
    if (event.type === 'tool/ptc-dispatch') {
        const error = 'error' in event.data ? event.data.error : undefined;
        const errorCode = questionToolOutcomeCode(error);
        return {
            callId: event.data.subCallId, content: event.data.content,
            isError: event.data.isError || error !== undefined,
            ...(errorCode === undefined ? {} : { errorCode }),
        };
    }
    return undefined;
}

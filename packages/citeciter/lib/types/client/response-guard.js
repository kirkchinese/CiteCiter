/** Return whether an asynchronous Topic response still belongs to the visible source and request. */
export function isCurrentTopicResponse(operationEpoch, currentEpoch, currentSourceSessionId, responseSourceSessionId, responseSessionId, expectedSessionId) {
    return operationEpoch === currentEpoch
        && responseSourceSessionId === currentSourceSessionId
        && (expectedSessionId === undefined || responseSessionId === expectedSessionId);
}
/** Return whether an idle source may restore its remembered Topic. */
export function shouldReopenLastTopic(hasActiveTopic, phaseIsIdle, reopenLastTopic) {
    return !hasActiveTopic && phaseIsIdle && reopenLastTopic;
}

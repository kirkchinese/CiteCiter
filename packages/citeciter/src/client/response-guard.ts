/** Return whether an asynchronous Topic response still belongs to the visible source and request. */
export function isCurrentTopicResponse(
  operationEpoch: number,
  currentEpoch: number,
  currentSourceSessionId: string | null,
  responseSourceSessionId: string,
  responseSessionId: string,
  expectedSessionId?: string,
): boolean {
  return operationEpoch === currentEpoch
    && responseSourceSessionId === currentSourceSessionId
    && (expectedSessionId === undefined || responseSessionId === expectedSessionId)
}

/** Return whether an idle source may restore its remembered Topic. */
export function shouldReopenLastTopic(
  hasActiveTopic: boolean,
  phaseIsIdle: boolean,
  reopenLastTopic: boolean,
  showingArchived = false,
  attempted = false,
  suppressed = false,
): boolean {
  return !hasActiveTopic
    && phaseIsIdle
    && reopenLastTopic
    && !showingArchived
    && !attempted
    && !suppressed
}

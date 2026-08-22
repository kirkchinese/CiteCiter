/** Return whether an asynchronous Topic response still belongs to the visible source and request. */
export declare function isCurrentTopicResponse(operationEpoch: number, currentEpoch: number, currentSourceSessionId: string | null, responseSourceSessionId: string, responseSessionId: string, expectedSessionId?: string): boolean;
/** Return whether an idle source may restore its remembered Topic. */
export declare function shouldReopenLastTopic(hasActiveTopic: boolean, phaseIsIdle: boolean, reopenLastTopic: boolean, showingArchived?: boolean, attempted?: boolean, suppressed?: boolean): boolean;

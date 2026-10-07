/** A named Host call keeps one answer identity across the foreground/continued boundary. */
export function questionKey(sessionId, callId) {
    return `question:${sessionId}:${callId}`;
}
/** Copy only the public question presentation, including supporting plan/detail text. */
export function questionPresentation(questions) {
    return questions.map(question => ({
        id: question.id, question: question.question,
        ...(question.header === undefined ? {} : { header: question.header }),
        ...(question.detail === undefined ? {} : { detail: question.detail }),
        ...(question.options === undefined ? {} : { options: question.options.map(option => ({ ...option })) }),
        ...(question.multiSelect === undefined ? {} : { multiSelect: question.multiSelect }),
    }));
}
/** Project a live private waterfall without assuming that every question blocks indefinitely. */
export function openQuestion(key, questions, wait) {
    return { key, questions: questionPresentation(questions), state: 'open',
        ...(wait === undefined ? {} : { callId: String(wait.callId), timed: wait.timed === true }) };
}
/**
 * Read the Host's durable question projection for this exact owned Agent.
 * Replies already in its native Inbox are excluded until admitted/discarded.
 * No Session is registered in the Host list and no log format is rewritten.
 */
export function continuedQuestions(agent) {
    const state = agent.ctx.get('sessionProjections')?.stateOf(agent.session, 'userQuestions');
    const queued = [...agent.inbox.nextTurn, ...agent.inbox.nextStep];
    return (state?.questions.active ?? [])
        .filter(question => question.state === 'continued' && !queued.some(message => message.source.kind === 'user-question-reply' && message.source.callId === question.callId))
        .map(question => ({ key: questionKey(String(agent.session.header.id), String(question.callId)),
        callId: String(question.callId), state: 'continued', questions: questionPresentation(question.questions) }));
}

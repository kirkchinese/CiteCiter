import { CITATION_CONTEXT_NAME, citeCiterProjectionSchema, parseCitationContext, } from "./thread.js";
const SYSTEM_PROMPT_SOURCE = '@deepseek-ai/dsh-system-prompt';
const EMPTY = Object.freeze({ thread: null });
/** Extract this plugin's named section from one authoritative runtime snapshot. */
function citationSection(event) {
    if (event.type !== 'user/message')
        return null;
    const source = event.data.source;
    if (source.kind !== 'plugin'
        || source.plugin !== SYSTEM_PROMPT_SOURCE
        || source.form !== 'snapshot')
        return null;
    return source.sections.find((section) => section.name === CITATION_CONTEXT_NAME)?.text ?? null;
}
/** Pure durable projection of the first Citation context in a forked child. */
export const citeCiterProjection = {
    key: 'citeciter',
    schema: citeCiterProjectionSchema,
    stateVersion: 1,
    init: () => EMPTY,
    apply(state, event) {
        const text = citationSection(event);
        if (text === null)
            return state;
        const envelope = parseCitationContext(text);
        if (envelope === null)
            return state;
        if (state.thread !== null)
            return state;
        return {
            thread: {
                citation: envelope.citation,
                historyStartSeq: envelope.historyStartSeq,
                contextSeq: event.seq,
            },
        };
    },
    view: (state) => state,
};

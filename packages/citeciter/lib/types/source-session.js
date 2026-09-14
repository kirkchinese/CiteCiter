import { SessionId } from '@deepseek-ai/dsh-session';
/** Read one consistent source cut. Release the observation even when copying fails. */
export async function readSourceSession(ctx, id) {
    const observation = await ctx.sessionQuery.observeSession(SessionId(id), { projectionMode: 'none' });
    try {
        return { session: structuredClone(observation.header), events: structuredClone(observation.events) };
    }
    finally {
        observation[Symbol.dispose]();
    }
}
/** Only an explicitly sent attachment enables later tool reads; unsent metadata grants nothing. */
export function hasSentSource(session, address) {
    return session?.snapshotEvents().some(event => event.type === 'user/message' && event.data.source.kind === 'user' && event.data.content.some(block => block.type === 'text' && block.text.includes(address))) ?? false;
}

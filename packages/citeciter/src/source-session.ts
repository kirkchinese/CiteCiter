import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-session-query'
import type { UserMessage } from '@deepseek-ai/dsh-llm'
import { SessionId, type Session } from '@deepseek-ai/dsh-session'
import type { ObserverSourceSnapshot } from './observer.ts'

/** Read one consistent source cut. Release the observation even when copying fails. */
export async function readSourceSession(ctx: Context, id: string): Promise<ObserverSourceSnapshot> {
  const observation = await ctx.sessionQuery.observeSession(SessionId(id), { projectionMode: 'none' })
  try {
    return { session: structuredClone(observation.header), events: structuredClone(observation.events) }
  } finally {
    observation[Symbol.dispose]()
  }
}

/** Only an explicitly sent attachment enables later tool reads; unsent metadata grants nothing. */
export function hasSentSource(session: Session | undefined, address: string): boolean {
  return session?.snapshotEvents().some(event => event.type === 'user/message' && mentionsSource(event.data, address)) ?? false
}

/** Whether one user-sent message carries the source address. */
export function mentionsSource(message: Pick<UserMessage, 'source' | 'content'>, address: string): boolean {
  return message.source.kind === 'user' && message.content.some(block => block.type === 'text' && block.text.includes(address))
}

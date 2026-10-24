import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-session-query'
import type { UserMessage } from '@deepseek-ai/dsh-llm'
import { SessionId, type Session, type SessionEvent } from '@deepseek-ai/dsh-session'
import type { ObserverSourceSnapshot } from './observer.ts'

/** The pending model selector stored by rc.3, independently of the last executed request. */
export function selectedSourceModel(events: readonly SessionEvent[]): { provider: string, model: string, reasoningEffort?: string } | undefined {
  let pending: { provider: string, model: string, reasoningEffort?: string } | undefined
  for (const event of events) {
    // Desktop rc.2 has no model/selection in its event union. Read its rc.3 payload field by field.
    if ((event.type as string) === 'model/selection') {
      const data: unknown = event.data
      if (data === null || typeof data !== 'object' || Array.isArray(data)) continue
      const fields = data as Record<string, unknown>
      if (typeof fields['provider'] !== 'string' || fields['provider'] === '' || typeof fields['model'] !== 'string' || fields['model'] === '') continue
      if (fields['reasoningEffort'] !== undefined && (typeof fields['reasoningEffort'] !== 'string' || fields['reasoningEffort'] === '')) continue
      pending = { provider: fields['provider'], model: fields['model'], ...(fields['reasoningEffort'] === undefined ? {} : { reasoningEffort: fields['reasoningEffort'] as string }) }
    } else if (event.type === 'request/header' && pending !== undefined) {
      const used = event.data.header.config
      if (used.provider === pending.provider && used.model === pending.model && (event.data.header.adapterDefaults?.reasoningEffort === true ? undefined : used.reasoningEffort) === pending.reasoningEffort) pending = undefined
    }
  }
  return pending
}

/** Read one consistent source cut. Release the observation even when copying fails. */
export async function readSourceSession(ctx: Context, id: string): Promise<ObserverSourceSnapshot> {
  const observation = await ctx.sessionQuery.observeSession(SessionId(id), { projectionMode: 'none' })
  try {
    return { session: structuredClone(observation.header), events: structuredClone(observation.events) }
  } finally {
    observation[Symbol.dispose]()
  }
}

/** Whether a source or document address was actually sent, for attachment-scoped resources. */
export function hasSentSource(session: Session | undefined, address: string): boolean {
  return session?.snapshotEvents().some(event => event.type === 'user/message' && mentionsSource(event.data, address)) ?? false
}

/** Whether one user-sent message carries the source address. */
export function mentionsSource(message: Pick<UserMessage, 'source' | 'content'>, address: string): boolean {
  return message.source.kind === 'user' && message.content.some(block => block.type === 'text' && block.text.includes(address))
}

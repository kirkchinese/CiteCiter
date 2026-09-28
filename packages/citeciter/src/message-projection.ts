import type { ContentBlock } from '@deepseek-ai/dsh-llm'
import type { SessionEvent } from '@deepseek-ai/dsh-session'

interface ContextMessage { id: string; content: readonly ContentBlock[]; source: { kind: string; plugin?: string } }
/** Project the installed SDK's validated log. 0.1.7 split plugin context into developer/message. */
export function contextMessage(event: SessionEvent): (ContextMessage & { label: string }) | undefined {
  let message: ContextMessage
  const type: string = event.type
  if (type === 'developer/message') message = (event.data as unknown as { message: ContextMessage }).message
  else if (event.type === 'user/message' && event.data.source.kind !== 'user') message = event.data
  else return undefined
  const system = message.source.kind === 'system-prompt' || message.source.plugin === '@deepseek-ai/dsh-system-prompt'
  return { ...message, label: system ? '提示词注入' : '上下文注入' }
}

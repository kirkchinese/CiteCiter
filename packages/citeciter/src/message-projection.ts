import type { ContentBlock } from '@deepseek-ai/dsh-llm'
import type { SessionEvent } from '@deepseek-ai/dsh-session'

/** Producer kind of messages Citer appends itself; mirrors `CITER_CONTEXT_KIND` without importing Host-only modules. */
const CITER_KIND = 'plugin:@kirkchinese/dsh-citeciter'
const CITER_LABELS: Readonly<Record<string, string>> = {
  'source-window': '来源摘录',
  'workspace-changes': '代码库变化',
}

interface ContextMessage { id: string; content: readonly ContentBlock[]; source: { kind: string; plugin?: string; form?: unknown } }
/** Project the installed SDK's validated log. 0.1.7 split plugin context into developer/message. */
export function contextMessage(event: SessionEvent): (ContextMessage & { label: string }) | undefined {
  let message: ContextMessage
  const type: string = event.type
  if (type === 'developer/message') message = (event.data as unknown as { message: ContextMessage }).message
  else if (event.type === 'user/message' && event.data.source.kind !== 'user') message = event.data as unknown as ContextMessage
  else return undefined
  const citer = message.source.kind === CITER_KIND && typeof message.source.form === 'string' ? CITER_LABELS[message.source.form] : undefined
  const system = message.source.kind === 'system-prompt' || message.source.plugin === '@deepseek-ai/dsh-system-prompt'
  return { ...message, label: citer ?? (system ? '提示词注入' : '上下文注入') }
}

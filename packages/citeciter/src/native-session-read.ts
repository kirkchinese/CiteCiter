import type { Agent } from '@deepseek-ai/dsh-agent'
import type { ContentBlock } from '@deepseek-ai/dsh-llm'
import type { NativeAttachment, NativeState } from './native-session-contract.ts'

function attachments(content: readonly ContentBlock[]): NativeAttachment[] {
  return content.flatMap(block => block.type === 'image' || block.type === 'file' ? [block] : [])
}

/** Read native inbox occurrences and requested admission receipts without registering a Host list row. */
export function readNativeState(agent: Agent, requestIds: readonly string[]): NativeState {
  const queue = [
    ...agent.inbox.nextTurn.map(message => ({ message, placement: 'queued' as const })),
    ...agent.inbox.nextStep.map(message => ({ message, placement: message.source.kind === 'user' ? 'steering' as const : 'context' as const })),
  ].map(({ message, placement }) => ({
    id: String(message.id), placement,
    ...(message.source.kind === 'user' && 'rpcId' in message.source ? { rpcId: String(message.source.rpcId) } : {}),
    text: message.content.filter(block => block.type === 'text').map(block => block.text).join('\n'),
    attachments: attachments(message.content),
  }))
  const wanted = new Set(requestIds)
  const receipts = new Map<string, NativeAttachment[]>()
  for (const row of queue) if (row.rpcId !== undefined && wanted.has(row.rpcId)) receipts.set(row.rpcId, row.attachments)
  let blank = true
  let error: string | null = null
  for (const event of agent.session.snapshotEvents()) {
    // Admission may be claimed and fail before user/message is emitted. The
    // durable inbox insertion is still an exact receipt, including attachments.
    if (event.type === 'agent/inbox/spliced') for (const message of event.data.inserted) {
      if (message.source.kind !== 'user' || !('rpcId' in message.source)) continue
      const id = String(message.source.rpcId)
      if (wanted.has(id)) receipts.set(id, attachments(message.content))
    }
    if (event.type === 'turn/start') { blank = false; error = null }
    if (event.type === 'turn/end') error = event.data.reason.kind === 'error' ? event.data.reason.error.message : null
    if (event.type !== 'user/message' || event.data.source.kind !== 'user' || !('rpcId' in event.data.source)) continue
    const id = String(event.data.source.rpcId)
    if (wanted.has(id)) receipts.set(id, attachments(event.data.content))
  }
  return { running: agent.status === 'running', blank, error, queue, receipts: [...receipts].map(([requestId, attachments]) => ({ requestId, attachments })) }
}

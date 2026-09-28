import type { ContentBlock } from '@deepseek-ai/dsh-llm'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-tools/types'

/** One committed tool dispatch, independent of native or run_code transport. */
export interface ToolCallRecord {
  readonly callId: string
  readonly name: string
  readonly arguments: string
}

export interface ToolResultRecord {
  readonly callId: string
  readonly content: readonly ContentBlock[]
  readonly isError: boolean
  readonly meta?: SessionEvent<'tool/result'>['data']['meta']
}

/** Normalize native and PTC starts using the actual child call identity. No synthetic model messages. */
export function toolCallRecord(event: SessionEvent): ToolCallRecord | undefined {
  if (event.type === 'tool/call') return { callId: event.data.callId, name: event.data.name, arguments: event.data.arguments }
  if (event.type === 'tool/ptc-dispatch-start') return { callId: event.data.subCallId, name: event.data.name, arguments: JSON.stringify(event.data.arguments) }
  return undefined
}

/** Normalize settled results for transcript, board, source and attachment readers. */
export function toolResultRecord(event: SessionEvent): ToolResultRecord | undefined {
  if (event.type === 'tool/result') {
    const message = event.data.message as { content: readonly ContentBlock[]; toolCallId?: string; isError?: boolean }
    // 0.1.5 wraps content in one tool-result block; 0.1.7 puts identity on the message.
    const result = message.toolCallId === undefined
      ? message.content[0] as unknown as { toolCallId: string; content: readonly ContentBlock[]; isError?: boolean }
      : message
    if (result.toolCallId === undefined) throw new Error('DSH 工具结果缺少调用身份')
    return { callId: result.toolCallId, content: result.content, isError: result.isError === true || event.data.error !== undefined, ...(event.data.meta === undefined ? {} : { meta: event.data.meta }) }
  }
  if (event.type === 'tool/ptc-dispatch') return { callId: event.data.subCallId, content: event.data.content, isError: event.data.isError || ('error' in event.data && event.data.error !== undefined) }
  return undefined
}

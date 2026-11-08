import type { ContentBlock } from '@deepseek-ai/dsh-llm'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type { QuestionToolOutcomeCode } from './tool-outcome-contract.ts'

/** Read only the public structured error taxonomy, never infer a verdict from model-visible text. */
function questionToolOutcomeCode(error: unknown): QuestionToolOutcomeCode | undefined {
  if (typeof error !== 'object' || error === null || Array.isArray(error)) return undefined
  if (!('name' in error) || error.name !== 'UserQuestionError' || !('code' in error)) return undefined
  return error.code === 'ASK_CANCELLED' || error.code === 'ASK_ABORTED' ? error.code : undefined
}

/** A structured tool failure as logged on `tool/result` and `tool/ptc-dispatch`. */
export interface ToolErrorRecord {
  readonly name?: string
  readonly code?: string
}

/** One committed tool dispatch, independent of native or run_code transport. */
export interface ToolCallRecord {
  readonly callId: string
  readonly name: string
  readonly arguments: string
  /** The run_code call that dispatched a programmatic child call. */
  readonly parentCallId?: string
}

export interface ToolResultRecord {
  readonly callId: string
  readonly content: readonly ContentBlock[]
  readonly isError: boolean
  readonly errorCode?: QuestionToolOutcomeCode
  readonly meta?: SessionEvent<'tool/result'>['data']['meta']
}

/** A `run_code` child dispatch start: its own id, its direct parent and the outermost run_code call. */
export interface PtcStartRecord {
  readonly subCallId: string
  readonly parentCallId: string
  readonly rootCallId: string
  readonly name: string
  readonly arguments: unknown
}

/** A settled `run_code` child dispatch; only its identity and outcome are required. */
export interface PtcDispatchRecord {
  readonly subCallId: string
  readonly content: readonly ContentBlock[]
  readonly isError: boolean
  readonly meta?: unknown
  readonly error?: ToolErrorRecord
}

/*
 * The PTC events moved between DSH packages (dsh-tools in 0.2.1, dsh-tool-executor-ptc in 0.2.2) while
 * their logged shape stayed the same. Reading them field by field keeps Citer independent of which
 * package declares them, and treats a malformed record as absent instead of trusting a type map.
 */
function eventData(event: SessionEvent, type: string): Record<string, unknown> | undefined {
  const { type: actual, data } = event as unknown as { readonly type: string, readonly data: unknown }
  return actual === type && typeof data === 'object' && data !== null ? data as Record<string, unknown> : undefined
}

function stringField(data: Record<string, unknown>, field: string): string | undefined {
  const value = data[field]
  return typeof value === 'string' ? value : undefined
}

function errorRecord(value: unknown): ToolErrorRecord | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const { name, code } = value as { name?: unknown, code?: unknown }
  return { ...(typeof name === 'string' ? { name } : {}), ...(typeof code === 'string' ? { code } : {}) }
}

/** @returns the PTC child start an event records, or undefined for any other or malformed event. */
export function ptcStartRecord(event: SessionEvent): PtcStartRecord | undefined {
  const data = eventData(event, 'tool/ptc-dispatch-start')
  if (data === undefined) return undefined
  const subCallId = stringField(data, 'subCallId')
  const parentCallId = stringField(data, 'parentCallId')
  const rootCallId = stringField(data, 'rootCallId')
  const name = stringField(data, 'name')
  if (subCallId === undefined || parentCallId === undefined || rootCallId === undefined || name === undefined) return undefined
  return { subCallId, parentCallId, rootCallId, name, arguments: data.arguments }
}

/** @returns the settled PTC child an event records, or undefined for any other or malformed event. */
export function ptcDispatchRecord(event: SessionEvent): PtcDispatchRecord | undefined {
  const data = eventData(event, 'tool/ptc-dispatch')
  const subCallId = data === undefined ? undefined : stringField(data, 'subCallId')
  if (data === undefined || subCallId === undefined || !Array.isArray(data.content)) return undefined
  const error = errorRecord(data.error)
  return {
    subCallId, content: data.content as ContentBlock[], isError: data.isError === true,
    ...('meta' in data && data.meta !== undefined ? { meta: data.meta } : {}),
    ...(error === undefined ? {} : { error }),
  }
}

/** @returns the structured error of a settled native or PTC tool call, if it recorded one. */
export function toolErrorOf(event: SessionEvent): ToolErrorRecord | undefined {
  if (event.type === 'tool/result') return errorRecord(event.data.error)
  return ptcDispatchRecord(event)?.error
}

/** Normalize native and PTC starts using the actual child call identity. No synthetic model messages. */
export function toolCallRecord(event: SessionEvent): ToolCallRecord | undefined {
  if (event.type === 'tool/call') return { callId: event.data.callId, name: event.data.name, arguments: event.data.arguments }
  const start = ptcStartRecord(event)
  return start === undefined ? undefined : { callId: start.subCallId, name: start.name, arguments: JSON.stringify(start.arguments), parentCallId: start.parentCallId }
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
    const errorCode = questionToolOutcomeCode(event.data.error)
    return {
      callId: result.toolCallId, content: result.content,
      isError: result.isError === true || event.data.error !== undefined,
      ...(errorCode === undefined ? {} : { errorCode }),
      ...(event.data.meta === undefined ? {} : { meta: event.data.meta }),
    }
  }
  const dispatch = ptcDispatchRecord(event)
  if (dispatch === undefined) return undefined
  const errorCode = questionToolOutcomeCode(dispatch.error)
  return {
    callId: dispatch.subCallId, content: dispatch.content,
    isError: dispatch.isError || dispatch.error !== undefined,
    ...(errorCode === undefined ? {} : { errorCode }),
    ...(dispatch.meta === undefined ? {} : { meta: dispatch.meta as ToolResultRecord['meta'] }),
  }
}

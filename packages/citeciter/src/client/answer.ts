import { projectCitableAssistantContent } from '../assistant-content.ts'

/** Citable assistant reasoning and answer text with its stream lifecycle. */
export type AssistantAnswer = {
  readonly status: 'running' | 'settled' | 'interrupted'
  readonly text: string
}

/**
 * Read visible text from one assistant-step payload without retaining its live node.
 * @param data - assistant-step payload from the conversation snapshot.
 * @returns visible text and status, or null when no displayable answer exists.
 */
export function readAssistantAnswer(data: unknown): AssistantAnswer | null {
  if (data === null || typeof data !== 'object') return null
  const record = data as { status?: unknown; blocks?: readonly unknown[] }
  if (record.status !== 'running' && record.status !== 'settled' && record.status !== 'interrupted') return null
  const text = projectCitableAssistantContent(record.blocks ?? [])
  return text === '' ? null : { status: record.status, text }
}

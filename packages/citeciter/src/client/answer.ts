/** Visible assistant text and its stream lifecycle. */
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
  let text = ''
  for (const block of record.blocks ?? []) {
    if (typeof block !== 'object' || block === null) continue
    const candidate = block as { kind?: unknown; text?: unknown }
    if (candidate.kind === 'text' && typeof candidate.text === 'string') text += candidate.text
  }
  return text === '' ? null : { status: record.status, text }
}

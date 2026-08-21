/** Pure Observer citation validation and source-session evidence formatting. */
import { createHash } from 'node:crypto'
import {
  snapshotJsonValue,
  type JsonValue,
  type SessionEvent,
  type SessionHeader,
} from '@deepseek-ai/dsh-session'
import {
  canonicalCitationIdentity,
  citationDraftSchema,
  type CitationDraft,
} from './topic.ts'

/** One atomic live-preferred SessionQuery observation. */
export interface ObserverSourceSnapshot {
  readonly session: Pick<SessionHeader, 'id' | 'cwd'>
  readonly events: readonly SessionEvent[]
}

/** Authoritative facts resolved for a browser-submitted Citation. */
export interface ValidatedObserverCitation {
  readonly citation: CitationDraft
  readonly assistantMessageSeq: number
  readonly assistantVisibleText: string
  readonly contentFingerprint: string
}

/** Options for one bounded `read_source_session` result. */
export interface SourceReadOptions {
  readonly fromSeq?: number
  readonly throughSeq?: number
  readonly includeReasoning: boolean
  /** Maximum UTF-8 bytes occupied by the serialized `events` array. */
  readonly maxBytes: number
}

/** One lossless-JSON evidence record emitted by `read_source_session`. */
export type SourceEvidenceEvent = JsonValue

/** Complete bounded source-read payload recorded as the Topic tool result. */
export interface SourceReadResult {
  readonly sourceSessionId: string
  readonly requestedFromSeq: number
  readonly requestedThroughSeq: number | null
  readonly capturedThroughSeq: number | null
  readonly availableThroughSeq: number | null
  readonly truncated: boolean
  readonly bytesUsed: number
  readonly events: readonly SourceEvidenceEvent[]
}

type MessageContent = SessionEvent<'assistant/message'>['data']['message']['content']

function messageText(content: MessageContent): string {
  return content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
}

function assistantReasoning(content: MessageContent): string {
  return content
    .filter((block) => block.type === 'reasoning')
    .map((block) => block.text)
    .join('')
}

function evidence(value: unknown): SourceEvidenceEvent {
  const snapshot = snapshotJsonValue(value)
  if (snapshot === undefined) throw new Error('source Session evidence is not lossless JSON')
  return snapshot as JsonValue
}

/** Compute the SHA-256 identity carried by the current CitationDraft schema. */
export function fingerprintCitationDraft(
  draft: Omit<CitationDraft, 'selectionFingerprint'>,
): string {
  return createHash('sha256').update(canonicalCitationIdentity(draft)).digest('hex')
}

/**
 * Validate one Citation against a committed assistant message in the observed source snapshot.
 * A matching `assistant/message` is sufficient; its step and turn may remain open.
 */
export function validateObserverCitation(
  source: ObserverSourceSnapshot,
  rawDraft: CitationDraft,
): ValidatedObserverCitation {
  const citation = citationDraftSchema.parse(rawDraft) as CitationDraft
  if (citation.sourceSessionId !== source.session.id) {
    throw new Error('Citation sourceSessionId does not match the observed source Session')
  }

  const anchor = source.events.find((event) => event.seq === citation.anchorSeq)
  if (anchor?.type !== 'assistant/message') {
    throw new Error('Citation anchorSeq does not identify a committed assistant/message')
  }
  const visibleText = messageText(anchor.data.message.content)
  if (visibleText === '') {
    throw new Error('Citation assistant/message has no visible text')
  }
  if (
    citation.endOffset <= citation.startOffset
    || citation.endOffset > visibleText.length
    || citation.endOffset - citation.startOffset !== citation.sourceText.length
    || visibleText.slice(citation.startOffset, citation.endOffset) !== citation.sourceText
  ) {
    throw new Error('Citation UTF-16 offsets and sourceText do not match the assistant/message')
  }
  if (
    visibleText.slice(Math.max(0, citation.startOffset - citation.prefixText.length), citation.startOffset) !== citation.prefixText
    || visibleText.slice(citation.endOffset, citation.endOffset + citation.suffixText.length) !== citation.suffixText
  ) {
    throw new Error('Citation surrounding context does not match the assistant/message')
  }

  const expectedFingerprint = fingerprintCitationDraft(citation)
  if (citation.selectionFingerprint !== expectedFingerprint) {
    throw new Error('Citation content fingerprint does not match its evidence')
  }
  return {
    citation,
    assistantMessageSeq: anchor.seq,
    assistantVisibleText: visibleText,
    contentFingerprint: expectedFingerprint,
  }
}

function formatEvidenceEvent(
  event: SessionEvent,
  includeReasoning: boolean,
): SourceEvidenceEvent | null {
  switch (event.type) {
    case 'turn/start':
      return evidence({ type: event.type, seq: event.seq, turn: event.data.turn })
    case 'turn/end':
      return evidence({ type: event.type, seq: event.seq, turn: event.data.turn, reason: event.data.reason })
    case 'step/start':
    case 'step/end':
      return evidence({
        type: event.type,
        seq: event.seq,
        turn: event.data.turn,
        step: event.data.step,
      })
    case 'user/message':
      return event.data.source.kind === 'user'
        ? evidence({ type: event.type, seq: event.seq, text: messageText(event.data.content) })
        : null
    case 'assistant/message': {
      const text = messageText(event.data.message.content)
      const reasoning = includeReasoning ? assistantReasoning(event.data.message.content) : ''
      return evidence({
        type: event.type,
        seq: event.seq,
        turn: event.data.turn,
        step: event.data.step,
        text,
        ...(reasoning === '' ? {} : { reasoning }),
      })
    }
    case 'tool/call':
      return evidence({
        type: event.type,
        seq: event.seq,
        turn: event.data.turn,
        step: event.data.step,
        callId: event.data.callId,
        name: event.data.name,
        arguments: event.data.arguments,
      })
    case 'tool/result': {
      const result = event.data.message.content[0]
      return evidence({
        type: event.type,
        seq: event.seq,
        turn: event.data.turn,
        step: event.data.step,
        callId: result.toolCallId,
        content: result.content,
        isError: result.isError ?? false,
        ...(event.data.error === undefined ? {} : { error: event.data.error }),
        ...(event.data.meta === undefined ? {} : { meta: event.data.meta }),
      })
    }
    // Chunks and unrelated log state are intentionally absent from model evidence.
    default:
      return null
  }
}

/** Format one seq range without exposing chunks or exceeding the event-array byte budget. */
export function formatSourceSessionRead(
  source: ObserverSourceSnapshot,
  options: SourceReadOptions,
): SourceReadResult {
  const fromSeq = options.fromSeq ?? 0
  if (!Number.isSafeInteger(fromSeq) || fromSeq < 0) throw new Error('fromSeq must be a non-negative safe integer')
  if (
    options.throughSeq !== undefined
    && (!Number.isSafeInteger(options.throughSeq) || options.throughSeq < fromSeq)
  ) throw new Error('throughSeq must be a safe integer greater than or equal to fromSeq')
  if (!Number.isSafeInteger(options.maxBytes) || options.maxBytes < 2) {
    throw new Error('maxBytes must be a safe integer of at least 2')
  }

  const availableThroughSeq = source.events.length === 0
    ? null
    : source.events[source.events.length - 1]?.seq ?? null
  const events: SourceEvidenceEvent[] = []
  let bytesUsed = 2 // JSON array brackets.
  let capturedThroughSeq: number | null = null
  let truncated = false

  for (const event of source.events) {
    if (event.seq < fromSeq) continue
    if (options.throughSeq !== undefined && event.seq > options.throughSeq) break
    const formatted = formatEvidenceEvent(event, options.includeReasoning)
    if (formatted === null) {
      capturedThroughSeq = event.seq
      continue
    }
    const eventBytes = Buffer.byteLength(JSON.stringify(formatted), 'utf8')
      + (events.length === 0 ? 0 : 1)
    if (bytesUsed + eventBytes > options.maxBytes) {
      truncated = true
      break
    }
    events.push(formatted)
    bytesUsed += eventBytes
    capturedThroughSeq = event.seq
  }

  return {
    sourceSessionId: source.session.id,
    requestedFromSeq: fromSeq,
    requestedThroughSeq: options.throughSeq ?? null,
    capturedThroughSeq,
    availableThroughSeq,
    truncated,
    bytesUsed,
    events,
  }
}

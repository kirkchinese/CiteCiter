/** Pure Observer citation validation against a source-session snapshot. */
/** Shared tool-evidence projections also consumed by the browser entry layer. */
import { createHash } from 'node:crypto'
import { toolCallRecord, toolResultRecord } from './tool-events.ts'
import { projectToolEvidence, toolExcerptMatches } from './evidence-text.ts'
export {
  projectDiffMeta,
  projectToolEvidence,
  projectToolResultText,
  type ToolEvidenceProjection,
} from './evidence-text.ts'
import type { SessionEvent, SessionHeader } from '@deepseek-ai/dsh-session'
import {
  canonicalCitationIdentity,
  citationSelectionClaimSchema,
  documentEvidenceClaimSchema,
  toolEvidenceClaimSchema,
  type CitationEvidence,
  type CitationSelectionClaim,
  type CitationDraft,
  type DocumentEvidenceClaim,
  type ToolEvidenceClaim,
} from './topic.ts'
import { projectCitableAssistantContent } from './assistant-content.ts'
import {
  resolveCitationRange,
  resolveDocumentRange,
  type CitationTextSelection,
  type ResolvedCitationRange,
} from './citation-mapping.ts'

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

/** One Host-verified tool-result evidence resolved from a browser claim. */
export interface ValidatedToolEvidence {
  readonly evidence: CitationEvidence
}

/** One Host-verified document-range evidence resolved against the stored text. */
export interface ValidatedDocumentEvidence {
  readonly evidence: CitationEvidence
}

type MessageContent = SessionEvent<'assistant/message'>['data']['message']['content']

function messageText(content: MessageContent): string {
  return content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
}

/** Compute the SHA-256 identity carried by the current CitationDraft schema. */
export function fingerprintCitationDraft(
  draft: Omit<CitationDraft, 'selectionFingerprint'>,
): string {
  return createHash('sha256').update(canonicalCitationIdentity(draft)).digest('hex')
}

/** Compute the SHA-256 identity of a canonical v4 Citation evidence record. */
export function fingerprintCitationRecord(record: CitationEvidence): string {
  return createHash('sha256').update(canonicalCitationIdentity(record)).digest('hex')
}

function committedAssistantText(
  source: ObserverSourceSnapshot,
  sourceSessionId: string,
  anchorSeq: number,
): { readonly seq: number, readonly projections: readonly string[] } {
  if (sourceSessionId !== source.session.id) {
    throw new Error('Citation sourceSessionId does not match the observed source Session')
  }
  const anchor = source.events.find((event) => event.seq === anchorSeq)
  if (anchor?.type !== 'assistant/message') {
    throw new Error('Citation anchorSeq does not identify a committed assistant/message')
  }
  const citable = projectCitableAssistantContent(anchor.data.message.content)
  const answer = messageText(anchor.data.message.content)
  const projections = citable === answer ? [citable] : [citable, answer].filter((text) => text !== '')
  if (projections[0]?.trim() === '') throw new Error('Citation assistant/message has no citable text')
  return { seq: anchor.seq, projections }
}

function resolveProjectedRange(
  selection: CitationTextSelection,
  projections: readonly string[],
): { readonly range: ResolvedCitationRange, readonly text: string } {
  let failure: unknown
  for (const text of projections) {
    try {
      return { range: resolveCitationRange(selection, text), text }
    } catch (error) {
      failure ??= error
    }
  }
  throw failure
}

/** Resolve a browser selection claim against the authoritative committed assistant message. */
export function resolveObserverCitation(
  source: ObserverSourceSnapshot,
  rawClaim: CitationSelectionClaim,
): ValidatedObserverCitation {
  const claim = citationSelectionClaimSchema.parse(rawClaim) as CitationSelectionClaim
  const anchor = committedAssistantText(source, claim.sourceSessionId, claim.anchorSeq)
  const selection = {
    displayText: claim.displayText,
    ...(claim.sourceHintText === undefined ? {} : { sourceHintText: claim.sourceHintText }),
    prefixText: claim.prefixText,
    suffixText: claim.suffixText,
  }
  const { range, text } = resolveProjectedRange(selection, anchor.projections)
  const identity = {
    sourceSessionId: claim.sourceSessionId,
    anchorSeq: anchor.seq,
    ...range,
    displayText: claim.displayText,
  }
  const selectionFingerprint = fingerprintCitationDraft(identity)
  return {
    citation: { ...identity, selectionFingerprint },
    assistantMessageSeq: anchor.seq,
    assistantVisibleText: text,
    contentFingerprint: selectionFingerprint,
  }
}

/**
 * Resolve a whole-card tool-result claim against the committed `tool/result`.
 * @param source - one atomic live-preferred SessionQuery observation.
 * @param rawClaim - browser-submitted tool result identity, projection, and visible quote.
 * @returns verified evidence with the full committed projection text.
 */
export function resolveToolEvidence(
  source: ObserverSourceSnapshot,
  rawClaim: ToolEvidenceClaim,
): ValidatedToolEvidence {
  const claim = toolEvidenceClaimSchema.parse(rawClaim) as ToolEvidenceClaim
  if (source.session.id !== claim.sourceSessionId) {
    throw new Error('Citation toolClaim sourceSessionId does not match the observed source Session')
  }
  const resultEvent = source.events.find(event => toolResultRecord(event)?.callId === claim.callId)
  const result = resultEvent === undefined ? undefined : toolResultRecord(resultEvent)
  if (resultEvent === undefined || result === undefined) {
    throw new Error('Citation toolClaim does not identify a committed tool/result')
  }
  const callEvent = source.events.find(event => toolCallRecord(event)?.callId === claim.callId)
  const call = callEvent === undefined ? undefined : toolCallRecord(callEvent)
  if (call === undefined) {
    throw new Error('Citation toolClaim has no committed tool/call in the source Session')
  }
  const projection = claim.projection ?? 'result-text'
  const sourceText = projectToolEvidence(projection, result.content, result.meta)
  if (sourceText === null) {
    throw new Error(`Citation tool result has no citable ${projection} projection`)
  }
  if (sourceText.trim() === '') throw new Error('Citation tool result has no citable text')
  if (!toolExcerptMatches(sourceText, claim.displayText)) {
    throw new Error('Citation toolClaim displayText does not match the committed tool result text')
  }
  return {
    evidence: {
      sourceSessionId: claim.sourceSessionId,
      anchorSeq: resultEvent.seq,
      entry: {
        kind: 'tool-result',
        anchorSeq: resultEvent.seq,
        callId: claim.callId,
        toolName: call.name,
        projection,
      },
      startOffset: 0,
      endOffset: sourceText.length,
      sourceText,
      displayText: claim.displayText,
      prefixText: '',
      suffixText: '',
    },
  }
}

/**
 * Re-resolve a Reader selection against the authoritative stored document text.
 * @param content - complete normalized document text.
 * @param rawClaim - browser-submitted document identity and visible quote context.
 * @returns verified evidence with document offsets in its entry.
 */
export function resolveDocumentEvidence(
  content: string,
  rawClaim: DocumentEvidenceClaim,
): ValidatedDocumentEvidence {
  const claim = documentEvidenceClaimSchema.parse(rawClaim) as DocumentEvidenceClaim
  const range = resolveDocumentRange(claim, content)
  return {
    evidence: {
      sourceSessionId: claim.sourceSessionId,
      anchorSeq: 0,
      entry: {
        kind: 'document-range',
        documentId: claim.documentId,
        startOffset: range.startOffset,
        endOffset: range.endOffset,
      },
      startOffset: 0,
      endOffset: range.sourceText.length,
      sourceText: range.sourceText,
      displayText: claim.displayText,
      prefixText: range.prefixText,
      suffixText: range.suffixText,
    },
  }
}

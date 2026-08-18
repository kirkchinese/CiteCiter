import type {
  SessionId,
  SessionListState,
} from '@deepseek-ai/dsh-client-runtime/client'
import {
  CITATION_SCHEMA_VERSION,
  canonicalCitationIdentity,
  type CitationFingerprintInput,
  type CitationRecord,
  type CitationThread,
} from '../thread.ts'
import type { CiteSelection } from './types.ts'

/** Browser-facing summary of one durable projected Citation Thread. */
export interface ThreadSummary {
  readonly sessionId: SessionId
  readonly parentSessionId: SessionId
  readonly parentTitle: string
  readonly title?: string
  readonly updatedAt: number
  readonly running: boolean
  readonly citation: CitationRecord
  readonly historyStartSeq: number
  readonly contextSeq: number
}

/** Convert a digest into stable lowercase hex without Node globals. */
function toHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

/** Build the immutable Citation record and its SHA-256 selection identity. */
export async function createCitation(
  selection: CiteSelection,
  sourceSessionId: SessionId,
  anchorSeq: number,
): Promise<CitationRecord> {
  if (selection.text.length > 32_000) {
    throw new Error('selected text exceeds the 32,000-character Citation limit')
  }
  if (
    selection.endOffset <= selection.startOffset
    || selection.endOffset - selection.startOffset !== selection.text.length
  ) {
    throw new Error('selected text no longer matches its UTF-16 source range')
  }
  const identity: CitationFingerprintInput = {
    sourceSessionId,
    anchorKey: selection.anchorKey,
    anchorSeq,
    startOffset: selection.startOffset,
    endOffset: selection.endOffset,
    selectedText: selection.text,
    prefixText: selection.prefixText,
    suffixText: selection.suffixText,
  }
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(canonicalCitationIdentity(identity)),
  )
  return {
    schemaVersion: CITATION_SCHEMA_VERSION,
    ...identity,
    selectionFingerprint: toHex(digest),
    createdAt: Date.now(),
  }
}

export function summarizeCitationThread(
  list: SessionListState,
  sessionId: SessionId,
  thread: CitationThread,
): ThreadSummary | null {
  const row = list.byId[sessionId]
  if (row === undefined || row.parentId !== thread.citation.sourceSessionId) return null
  const parent = list.byId[thread.citation.sourceSessionId]
  return {
    sessionId,
    parentSessionId: thread.citation.sourceSessionId,
    parentTitle: parent?.displayTitle ?? thread.citation.sourceSessionId,
    ...(row.title === undefined ? {} : { title: row.title }),
    updatedAt: row.updatedAt,
    running: row.running,
    citation: thread.citation,
    historyStartSeq: thread.historyStartSeq,
    contextSeq: thread.contextSeq,
  }
}

/** Discover every unarchived Thread from Host-computed list-row projections. */
export function listCitationThreads(
  list: SessionListState,
  archivedSessionIds: readonly SessionId[] = [],
): readonly ThreadSummary[] {
  const threads: ThreadSummary[] = []
  const archived = new Set<SessionId>(archivedSessionIds)
  for (const sessionId of list.ids) {
    if (archived.has(sessionId)) continue
    const thread = list.byId[sessionId]?.projectionValues?.citeciter?.thread
    if (thread === null || thread === undefined) continue
    const summary = summarizeCitationThread(list, sessionId, thread)
    if (summary !== null) threads.push(summary)
  }
  return threads.sort((left, right) => right.updatedAt - left.updatedAt)
}

/** Find the one durable Thread whose full Citation identity matches. */
export function findCitationThread(
  threads: readonly ThreadSummary[],
  citation: CitationRecord,
): ThreadSummary | undefined {
  return threads.find((thread) => (
    thread.parentSessionId === citation.sourceSessionId
    && thread.citation.anchorSeq === citation.anchorSeq
    && thread.citation.selectionFingerprint === citation.selectionFingerprint
  ))
}

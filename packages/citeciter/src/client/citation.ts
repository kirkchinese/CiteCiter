import type { CitationDraft } from '../topic.ts'
import { canonicalCitationIdentity } from '../topic.ts'
import { resolveCitationRange } from '../citation-mapping.ts'
import type { CiteSelection } from './types.ts'

interface SourceSelection extends CiteSelection {
  readonly sourceText: string
}

function toHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

/** Map rendered Markdown selection context back to one exact raw answer range. */
export function normalizeSelectionAgainstAnswer(selection: CiteSelection, answer: string): SourceSelection {
  const resolved = resolveCitationRange(selection, answer)
  return {
    ...selection,
    ...resolved,
  }
}

/** Build the browser claim that the Host later checks against one committed model call. */
export async function createCitationDraft(
  selection: SourceSelection,
  assistantMessageSeq: number,
): Promise<CitationDraft> {
  if (
    selection.endOffset <= selection.startOffset
    || selection.endOffset - selection.startOffset !== selection.sourceText.length
  ) throw new Error('选中文字与其 UTF-16 来源范围不一致')
  const identity = {
    sourceSessionId: selection.sourceSessionId,
    anchorSeq: assistantMessageSeq,
    startOffset: selection.startOffset,
    endOffset: selection.endOffset,
    sourceText: selection.sourceText,
    displayText: selection.displayText,
    prefixText: selection.prefixText,
    suffixText: selection.suffixText,
  }
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(canonicalCitationIdentity(identity)),
  )
  return { ...identity, selectionFingerprint: toHex(digest) }
}

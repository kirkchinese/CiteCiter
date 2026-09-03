/**
 * Client entry-point registry: every "start a Citer from here" surface
 * contributes one entry that probes the pointer event and claims a selection.
 * Entries run in registration order; the first claim wins and is allowed to
 * prevent the native context menu.
 */
import type { ISessions, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import { dshAssistantAnchorForTarget } from './conversation-dom.ts'
import { ASSISTANT_ENTRY_ID, TOOL_ENTRY_ID } from './entry-ids.ts'
import { projectToolEvidence, type ToolEvidenceProjection } from '../evidence-text.ts'
import { readAssistantAnswer } from './answer.ts'
import { claimSelectionContextMenu } from './selection.ts'
import type { CiteSelection, ToolCiteSelection } from './types.ts'

/** Live browser facts an entry needs to resolve one selection. */
export interface CiteCiterEntryContext {
  readonly sessions: ISessions
  readonly sourceSessionId: SessionId
}

/** One Citer entry point: probe, capture, and claim a selection from the DOM. */
export interface CiteCiterEntry {
  /** Stable entry identity recorded on the claimed selection. */
  readonly id: string
  /**
   * Claim the current pointer event for this entry.
   * @param event - context-menu event whose position anchors the claim.
   * @param context - current source session and its bindings.
   * @returns a validated selection, or null when this entry does not own the event.
   */
  claim(event: MouseEvent, context: CiteCiterEntryContext): CiteSelection | null
}

/** Mutable ordered entry registry with effect-style registration. */
export interface CiteCiterEntryRegistry {
  /**
   * Append one entry.
   * @param entry - immutable entry contribution.
   * @returns disposer removing the exact entry.
   */
  register(entry: CiteCiterEntry): () => void
  /** Registered entries in claim order. */
  list(): readonly CiteCiterEntry[]
  /**
   * Ask entries in order for a claimed selection.
   * @returns the first entry claim, or null when no entry owns the event.
   */
  claim(event: MouseEvent, context: CiteCiterEntryContext): { readonly entry: CiteCiterEntry, readonly selection: CiteSelection } | null
}

/** Create an ordered client entry registry. */
export function createCiteCiterEntryRegistry(): CiteCiterEntryRegistry {
  const entries: CiteCiterEntry[] = []
  return {
    register(entry: CiteCiterEntry): () => void {
      entries.push(entry)
      return () => {
        const index = entries.indexOf(entry)
        if (index !== -1) entries.splice(index, 1)
      }
    },
    list: () => [...entries],
    claim(event, context) {
      for (const entry of entries) {
        const selection = entry.claim(event, context)
        if (selection !== null) return { entry, selection }
      }
      return null
    },
  }
}

/**
 * Built-in assistant answer entry: resolves a selection inside a committed
 * `assistant-step` flow, including collapsed reasoning disclosure rows.
 * @returns the entry contribution; register it on the shared registry.
 */
export function createAssistantEntry(): CiteCiterEntry {
  return {
    id: ASSISTANT_ENTRY_ID,
    claim(event, { sessions, sourceSessionId }) {
      const anchor = dshAssistantAnchorForTarget(event.target)
      if (anchor === null) return null
      const node = sessions.binding(sourceSessionId)?.session.getSnapshot().chat.nodes.get(anchor.anchorKey)
      const answer = node?.kind === 'assistant-step' ? readAssistantAnswer(node.data) : null
      return claimSelectionContextMenu(event, sourceSessionId, answer?.text)
    },
  }
}

/** Tool-result node fields the tool entry reads from a `tool-call` chat node. */
interface SettledToolChatRoot {
  readonly kind: 'tool-result'
  readonly callId: string
  readonly content: readonly unknown[]
  readonly meta?: unknown
}

/** Classify the projection a tool-card pointer event asks for. */
function toolProjectionForTarget(target: { closest(selector: string): HTMLElement | null }): ToolEvidenceProjection {
  if (target.closest('[data-terminal]') !== null) return 'terminal'
  if (target.closest('[data-diff]') !== null) return 'diff'
  return 'result-text'
}

/**
 * Built-in tool evidence entry: claims a whole-card tool result from its
 * `call:<callId>` row and the enclosing `tool-call` chat flow. Terminal and
 * diff cards select their dedicated projections; everything else is
 * `result-text`.
 * @returns the entry contribution; register it after the assistant entry.
 */
export function createToolEvidenceEntry(): CiteCiterEntry {
  return {
    id: TOOL_ENTRY_ID,
    claim(event, { sessions, sourceSessionId }) {
      const target = event.target as unknown
      if (target === null || typeof target !== 'object' || typeof (target as { closest?: unknown }).closest !== 'function') {
        return null
      }
      const closest = (target as { closest(selector: string): HTMLElement | null }).closest.bind(target)
      const callRow = closest('[data-chat-call-id]')
      if (callRow === null) return null
      const flowElement = closest('[data-chat-flow-kind]')
      if (flowElement === null || flowElement.dataset.chatFlowKind !== 'tool-call') return null
      const anchorKey = flowElement.dataset.chatAnchorKey
      if (anchorKey === undefined || anchorKey === '') return null
      const node = sessions.binding(sourceSessionId)?.session.getSnapshot().chat.nodes.get(anchorKey)
      if (node === undefined || node.kind !== 'tool-call') return null
      const root = (node.data as { readonly root?: unknown }).root
      if (root === null || typeof root !== 'object') return null
      const settled = root as SettledToolChatRoot
      const callId = callRow.dataset.chatCallId
      if (settled.kind !== 'tool-result' || callId === undefined || callId === '' || settled.callId !== callId) return null
      const projection = toolProjectionForTarget(target as { closest(selector: string): HTMLElement | null })
      const text = projectToolEvidence(projection, settled.content ?? [], settled.meta)
      if (text === null || text.trim() === '') return null
      event.preventDefault()
      const selection: ToolCiteSelection = {
        entryId: TOOL_ENTRY_ID,
        kind: 'tool-result',
        sourceSessionId,
        callId,
        projection,
        displayText: text.trim(),
        anchorKey,
        x: event.clientX,
        y: event.clientY,
      }
      return selection
    },
  }
}

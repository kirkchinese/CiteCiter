import type { CiteSelection } from './types.ts'

/**
 * Resolve the current DOM selection into a CiteSelection.
 * Returns null for collapsed/empty selections, selections outside a
 * conversation flow node, and selections that do not belong to a settled
 * assistant step (the only kind CiteCiter explains in v1).
 */
export function readSelection(event: MouseEvent): CiteSelection | null {
  const selection = window.getSelection()
  if (selection === null || selection.isCollapsed || selection.rangeCount === 0) return null
  const text = selection.toString().trim()
  if (text === '') return null
  const range = selection.getRangeAt(0)
  const start = range.commonAncestorContainer
  const element = start.nodeType === Node.ELEMENT_NODE ? start as Element : start.parentElement
  const flow = element?.closest<HTMLElement>('[data-chat-flow-kind]')
  if (flow === null || flow === undefined) return null
  const kind = flow.dataset.chatFlowKind
  const anchorKey = flow.dataset.chatAnchorKey
  if (kind !== 'assistant-step' || anchorKey === undefined || anchorKey === '') return null
  return {
    text,
    kind,
    anchorKey,
    x: event.clientX,
    y: event.clientY,
  }
}

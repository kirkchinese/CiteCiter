import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type { CiteSelection } from './types.ts'
import {
  dshAssistantAnchorForTarget,
  dshConversationFlow,
  dshIntersectedAssistantAnchors,
  dshRangeTouchesExcludedContent,
  isNonAnswerContent,
  readFrogSelection,
} from './conversation-dom.ts'

const RANGE_CONTEXT_CHARS = 240

function committedText(
  root: Node,
  target?: Node,
): { text: string, targetStart: number | undefined, targetEnd: number | undefined } {
  let text = ''
  let targetStart: number | undefined
  let targetEnd: number | undefined
  const visit = (node: Node): void => {
    if (isNonAnswerContent(node)) return
    if (node === target) targetStart = text.length
    if (node.nodeType === Node.TEXT_NODE) text += node.textContent ?? ''
    else for (const child of node.childNodes) visit(child)
    if (node === target) targetEnd = text.length
  }
  visit(root)
  return { text, targetStart, targetEnd }
}

function committedTextBefore(root: Node, boundary: Node, offset: number): string | null {
  let text = ''
  let found = false
  const visit = (node: Node): void => {
    if (found || isNonAnswerContent(node)) return
    if (node === boundary) {
      if (node.nodeType === Node.TEXT_NODE) text += (node.textContent ?? '').slice(0, offset)
      else for (let index = 0; index < offset; index++) {
        const child = node.childNodes[index]
        if (child !== undefined) visit(child)
      }
      found = true
      return
    }
    if (node.nodeType === Node.TEXT_NODE) text += node.textContent ?? ''
    else for (const child of node.childNodes) visit(child)
  }
  visit(root)
  return found ? text : null
}

/**
 * Resolve the current DOM selection into a CiteSelection.
 *
 * A Range inside one assistant flow keeps exact visible offsets. A cross-flow
 * Range binds to its final intersected assistant model call while preserving
 * the complete visible quote for the learning UI.
 *
 * @param event - context-menu event whose pointer position anchors the menu.
 * @param sourceSessionId - current session identity captured with the DOM range.
 * @returns validated selection metadata, or null when CiteCiter should ignore it.
 */
export function readSelection(event: MouseEvent, sourceSessionId: SessionId): CiteSelection | null {
  const eventAnchor = dshAssistantAnchorForTarget(event.target)
  if (eventAnchor === null) return null
  const selection = window.getSelection()
  if (selection === null || selection.isCollapsed || selection.rangeCount === 0) return null

  const range = selection.getRangeAt(0)
  const startFlow = dshConversationFlow(range.startContainer)
  const endFlow = dshConversationFlow(range.endContainer)
  if (startFlow === null || endFlow === null) return null
  if (endFlow.element !== startFlow.element) {
    const anchor = dshIntersectedAssistantAnchors(range).at(-1)
    const displayText = range.toString().trim()
    if (anchor === undefined || anchor.element !== eventAnchor.element || displayText === '') return null
    const projected = committedText(anchor.element).text
    const sourceHintText = projected.trim()
    if (sourceHintText === '') return null
    const startOffset = projected.length - projected.trimStart().length
    const endOffset = projected.length - (projected.length - projected.trimEnd().length)
    return {
      sourceSessionId,
      displayText,
      sourceHintText,
      kind: 'assistant-step',
      anchorKey: anchor.anchorKey,
      startOffset,
      endOffset,
      prefixText: '',
      suffixText: '',
      x: event.clientX,
      y: event.clientY,
    }
  }
  if (startFlow.element !== eventAnchor.element || dshRangeTouchesExcludedContent(range, startFlow.element)) return null

  const translated = readFrogSelection(range, startFlow.element)
  if (translated.kind === 'invalid') return null
  let text: string
  let flowText: string
  let startOffset: number
  let endOffset: number
  let sourceHintText: string | undefined
  if (translated.kind === 'translation') {
    const projected = committedText(startFlow.element, translated.sourceParagraph)
    if (projected.targetStart === undefined || projected.targetEnd === undefined) return null
    const rawSourceHint = projected.text.slice(projected.targetStart, projected.targetEnd)
    const sourceLeading = rawSourceHint.length - rawSourceHint.trimStart().length
    const sourceTrailing = rawSourceHint.length - rawSourceHint.trimEnd().length
    text = range.toString().trim()
    flowText = projected.text
    startOffset = projected.targetStart + sourceLeading
    endOffset = projected.targetEnd - sourceTrailing
    sourceHintText = rawSourceHint.trim()
  } else {
    const beforeStart = committedTextBefore(startFlow.element, range.startContainer, range.startOffset)
    const beforeEnd = committedTextBefore(startFlow.element, range.endContainer, range.endOffset)
    if (beforeStart === null || beforeEnd === null || beforeEnd.length < beforeStart.length) return null
    const rawText = beforeEnd.slice(beforeStart.length)
    const leadingWhitespace = rawText.length - rawText.trimStart().length
    const trailingWhitespace = rawText.length - rawText.trimEnd().length
    text = rawText.trim()
    flowText = committedText(startFlow.element).text
    startOffset = beforeStart.length + leadingWhitespace
    endOffset = beforeEnd.length - trailingWhitespace
  }
  if (text === '') return null
  if (startOffset < 0 || endOffset < startOffset || endOffset > flowText.length) return null

  return {
    sourceSessionId,
    displayText: text,
    ...(sourceHintText === undefined ? {} : { sourceHintText }),
    kind: 'assistant-step',
    anchorKey: eventAnchor.anchorKey,
    startOffset,
    endOffset,
    prefixText: flowText.slice(Math.max(0, startOffset - RANGE_CONTEXT_CHARS), startOffset),
    suffixText: flowText.slice(endOffset, endOffset + RANGE_CONTEXT_CHARS),
    x: event.clientX,
    y: event.clientY,
  }
}

/**
 * Claim a context menu only after resolving a valid DSH assistant selection.
 *
 * @param event - context-menu event to validate and optionally cancel.
 * @param sourceSessionId - current source session captured with the selection.
 * @returns validated selection metadata, or null while leaving the native menu untouched.
 */
export function claimSelectionContextMenu(event: MouseEvent, sourceSessionId: SessionId): CiteSelection | null {
  const selection = readSelection(event, sourceSessionId)
  if (selection === null) return null
  event.preventDefault()
  return selection
}

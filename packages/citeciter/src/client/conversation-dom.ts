/** Centralized best-effort adapters for DSH conversation and Read Frog DOM markers. */

const DSH_FLOW_SELECTOR = '[data-chat-flow-kind]'
const DSH_ASSISTANT_ANCHOR_SELECTOR = '[data-chat-flow-kind="assistant-step"][data-chat-anchor-key]'
const DSH_REASONING_SELECTOR = '[data-variant="think"]'
const DSH_REASONING_HEADER_SELECTOR = '[data-disclosure-row]'
const DSH_GENERATED_CONTENT_SELECTOR = 'button, .katex, [data-footnotes], sup'
const DSH_CODE_BLOCK_SELECTOR = '.md-code-block'
const READ_FROG_TRANSLATION_SELECTOR = '[data-read-frog-translation-mode]'
const READ_FROG_PARAGRAPH_SELECTOR = '[data-read-frog-paragraph]'

/** One parsed DSH conversation flow element. */
export interface DshConversationFlow {
  readonly element: HTMLElement
  readonly kind: string
  readonly anchorKey: string | null
}

/** One validated assistant flow carrying a stable DSH anchor. */
export interface DshAssistantAnchor {
  readonly element: HTMLElement
  readonly anchorKey: string
}

/** Best-effort Read Frog selection classification. */
export type ReadFrogSelection =
  | { readonly kind: 'none' }
  | { readonly kind: 'invalid' }
  | { readonly kind: 'translation'; readonly sourceParagraph: HTMLElement }

function elementForNode(node: Node): Element | null {
  return node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement
}

function parseFlow(element: HTMLElement | null): DshConversationFlow | null {
  if (element === null) return null
  return {
    element,
    kind: element.dataset.chatFlowKind ?? '',
    anchorKey: element.dataset.chatAnchorKey ?? null,
  }
}

function parseAssistantAnchor(element: HTMLElement | null): DshAssistantAnchor | null {
  const flow = parseFlow(element)
  if (flow === null || flow.kind !== 'assistant-step' || flow.anchorKey === null || flow.anchorKey === '') return null
  return { element: flow.element, anchorKey: flow.anchorKey }
}

/**
 * Parse the nearest DSH conversation flow containing a DOM node.
 *
 * @param node - rendered conversation node to inspect.
 * @returns parsed flow metadata, or null outside a known DSH flow.
 */
export function dshConversationFlow(node: Node): DshConversationFlow | null {
  return parseFlow(elementForNode(node)?.closest<HTMLElement>(DSH_FLOW_SELECTOR) ?? null)
}

/**
 * Parse the assistant anchor that owns a context-menu event target.
 *
 * @param target - browser event target to inspect.
 * @returns validated assistant metadata, or null outside an anchored assistant flow.
 */
export function dshAssistantAnchorForTarget(target: EventTarget | null): DshAssistantAnchor | null {
  if (!(target instanceof Element)) return null
  return parseAssistantAnchor(target.closest<HTMLElement>(DSH_ASSISTANT_ANCHOR_SELECTOR))
}

/**
 * Return assistant anchors intersected by a DOM range in document order.
 *
 * @param range - current rendered selection range.
 * @returns validated assistant anchors touched by the range.
 */
export function dshIntersectedAssistantAnchors(range: Range): DshAssistantAnchor[] {
  const anchors: DshAssistantAnchor[] = []
  for (const element of document.querySelectorAll<HTMLElement>(DSH_ASSISTANT_ANCHOR_SELECTOR)) {
    if (!range.intersectsNode(element)) continue
    const anchor = parseAssistantAnchor(element)
    if (anchor !== null) anchors.push(anchor)
  }
  return anchors
}

/**
 * Detect generated controls, reasoning summaries, and collapsed code chrome.
 *
 * @param range - current rendered selection range.
 * @param flow - assistant flow containing the range.
 * @returns whether the range touches content that CiteCiter must ignore.
 */
export function dshRangeTouchesExcludedContent(range: Range, flow: HTMLElement): boolean {
  for (const reasoning of flow.querySelectorAll(DSH_REASONING_SELECTOR)) {
    for (const header of reasoning.querySelectorAll(DSH_REASONING_HEADER_SELECTOR)) {
      if (range.intersectsNode(header)) return true
    }
  }
  for (const generated of flow.querySelectorAll(DSH_GENERATED_CONTENT_SELECTOR)) {
    if (range.intersectsNode(generated)) return true
  }
  for (const endpoint of [range.startContainer, range.endContainer]) {
    const element = elementForNode(endpoint)
    if (element?.closest(DSH_CODE_BLOCK_SELECTOR) !== null && element?.closest('pre') === null) return true
  }
  return false
}

/**
 * Find the current DSH assistant element for a persisted anchor key.
 *
 * @param anchorKey - stable anchor emitted by the DSH conversation renderer.
 * @returns matching rendered assistant element, or null when it is not mounted.
 */
export function findDshAssistantAnchor(anchorKey: string): HTMLElement | null {
  for (const element of document.querySelectorAll<HTMLElement>(DSH_ASSISTANT_ANCHOR_SELECTOR)) {
    if (element.dataset.chatAnchorKey === anchorKey) return element
  }
  return null
}

/**
 * Determine whether a node is generated UI rather than committed citable text.
 *
 * @param node - rendered node to classify.
 * @returns whether the node must stay out of the citable projection.
 */
export function isNonCitableProjection(node: Node): boolean {
  if (node.nodeType !== Node.ELEMENT_NODE) return false
  const element = node as Element
  return element.matches(READ_FROG_TRANSLATION_SELECTOR)
    || element.matches(DSH_REASONING_HEADER_SELECTOR) && element.closest(DSH_REASONING_SELECTOR) !== null
}

/**
 * Determine whether a node owns one DSH reasoning block.
 *
 * @param node - rendered node to classify.
 * @returns whether the node is a reasoning root.
 */
export function isDshReasoningContent(node: Node): boolean {
  return node.nodeType === Node.ELEMENT_NODE && (node as Element).matches(DSH_REASONING_SELECTOR)
}

/**
 * Resolve a selection wholly inside one Read Frog translation to its source paragraph.
 *
 * @param range - current rendered selection range.
 * @param assistant - assistant flow containing the translated projection.
 * @returns translation mapping state and source paragraph when available.
 */
export function readFrogSelection(range: Range, assistant: HTMLElement): ReadFrogSelection {
  const translatedStart = elementForNode(range.startContainer)?.closest<HTMLElement>(READ_FROG_TRANSLATION_SELECTOR)
  const translatedEnd = elementForNode(range.endContainer)?.closest<HTMLElement>(READ_FROG_TRANSLATION_SELECTOR)
  if (translatedStart === null || translatedStart === undefined) {
    return translatedEnd === null || translatedEnd === undefined ? { kind: 'none' } : { kind: 'invalid' }
  }
  if (translatedEnd === null || translatedEnd === undefined || translatedStart !== translatedEnd) return { kind: 'invalid' }
  const sourceParagraph = translatedStart.parentElement?.closest<HTMLElement>(READ_FROG_PARAGRAPH_SELECTOR)
  if (sourceParagraph === null || sourceParagraph === undefined || !assistant.contains(sourceParagraph)) {
    return { kind: 'invalid' }
  }
  return { kind: 'translation', sourceParagraph }
}

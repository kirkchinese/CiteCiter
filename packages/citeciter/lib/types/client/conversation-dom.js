/** Centralized best-effort adapters for DSH conversation and Read Frog DOM markers. */
const DSH_FLOW_SELECTOR = '[data-chat-flow-kind]';
const DSH_ASSISTANT_ANCHOR_SELECTOR = '[data-chat-flow-kind="assistant-step"][data-chat-anchor-key]';
const DSH_REASONING_SELECTOR = '[data-variant="think"]';
const DSH_GENERATED_CONTENT_SELECTOR = 'button, .katex, [data-footnotes], sup';
const DSH_CODE_BLOCK_SELECTOR = '.md-code-block';
const READ_FROG_TRANSLATION_SELECTOR = '[data-read-frog-translation-mode]';
const READ_FROG_PARAGRAPH_SELECTOR = '[data-read-frog-paragraph]';
function elementForNode(node) {
    return node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
}
function parseFlow(element) {
    if (element === null)
        return null;
    return {
        element,
        kind: element.dataset.chatFlowKind ?? '',
        anchorKey: element.dataset.chatAnchorKey ?? null,
    };
}
function parseAssistantAnchor(element) {
    const flow = parseFlow(element);
    if (flow === null || flow.kind !== 'assistant-step' || flow.anchorKey === null || flow.anchorKey === '')
        return null;
    return { element: flow.element, anchorKey: flow.anchorKey };
}
/**
 * Parse the nearest DSH conversation flow containing a DOM node.
 *
 * @param node - rendered conversation node to inspect.
 * @returns parsed flow metadata, or null outside a known DSH flow.
 */
export function dshConversationFlow(node) {
    return parseFlow(elementForNode(node)?.closest(DSH_FLOW_SELECTOR) ?? null);
}
/**
 * Parse the assistant anchor that owns a context-menu event target.
 *
 * @param target - browser event target to inspect.
 * @returns validated assistant metadata, or null outside an anchored assistant flow.
 */
export function dshAssistantAnchorForTarget(target) {
    if (!(target instanceof Element))
        return null;
    return parseAssistantAnchor(target.closest(DSH_ASSISTANT_ANCHOR_SELECTOR));
}
/**
 * Return assistant anchors intersected by a DOM range in document order.
 *
 * @param range - current rendered selection range.
 * @returns validated assistant anchors touched by the range.
 */
export function dshIntersectedAssistantAnchors(range) {
    const anchors = [];
    for (const element of document.querySelectorAll(DSH_ASSISTANT_ANCHOR_SELECTOR)) {
        if (!range.intersectsNode(element))
            continue;
        const anchor = parseAssistantAnchor(element);
        if (anchor !== null)
            anchors.push(anchor);
    }
    return anchors;
}
/**
 * Detect DSH-rendered reasoning, generated controls, and collapsed code chrome.
 *
 * @param range - current rendered selection range.
 * @param flow - assistant flow containing the range.
 * @returns whether the range touches content that CiteCiter must ignore.
 */
export function dshRangeTouchesExcludedContent(range, flow) {
    for (const reasoning of flow.querySelectorAll(DSH_REASONING_SELECTOR)) {
        if (range.intersectsNode(reasoning))
            return true;
    }
    for (const generated of flow.querySelectorAll(DSH_GENERATED_CONTENT_SELECTOR)) {
        if (range.intersectsNode(generated))
            return true;
    }
    for (const endpoint of [range.startContainer, range.endContainer]) {
        const element = elementForNode(endpoint);
        if (element?.closest(DSH_CODE_BLOCK_SELECTOR) !== null && element?.closest('pre') === null)
            return true;
    }
    return false;
}
/**
 * Find the current DSH assistant element for a persisted anchor key.
 *
 * @param anchorKey - stable anchor emitted by the DSH conversation renderer.
 * @returns matching rendered assistant element, or null when it is not mounted.
 */
export function findDshAssistantAnchor(anchorKey) {
    for (const element of document.querySelectorAll(DSH_ASSISTANT_ANCHOR_SELECTOR)) {
        if (element.dataset.chatAnchorKey === anchorKey)
            return element;
    }
    return null;
}
/**
 * Determine whether a node is a Read Frog translated projection rather than source text.
 *
 * @param node - rendered node to classify.
 * @returns whether Read Frog marks the node as translated content.
 */
export function isReadFrogTranslatedContent(node) {
    return node.nodeType === Node.ELEMENT_NODE && node.matches(READ_FROG_TRANSLATION_SELECTOR);
}
/**
 * Resolve a selection wholly inside one Read Frog translation to its source paragraph.
 *
 * @param range - current rendered selection range.
 * @param assistant - assistant flow containing the translated projection.
 * @returns translation mapping state and source paragraph when available.
 */
export function readFrogSelection(range, assistant) {
    const translatedStart = elementForNode(range.startContainer)?.closest(READ_FROG_TRANSLATION_SELECTOR);
    const translatedEnd = elementForNode(range.endContainer)?.closest(READ_FROG_TRANSLATION_SELECTOR);
    if (translatedStart === null || translatedStart === undefined) {
        return translatedEnd === null || translatedEnd === undefined ? { kind: 'none' } : { kind: 'invalid' };
    }
    if (translatedEnd === null || translatedEnd === undefined || translatedStart !== translatedEnd)
        return { kind: 'invalid' };
    const sourceParagraph = translatedStart.parentElement?.closest(READ_FROG_PARAGRAPH_SELECTOR);
    if (sourceParagraph === null || sourceParagraph === undefined || !assistant.contains(sourceParagraph)) {
        return { kind: 'invalid' };
    }
    return { kind: 'translation', sourceParagraph };
}

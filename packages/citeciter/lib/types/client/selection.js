const RANGE_CONTEXT_CHARS = 240;
/** Resolve a DOM Node to its nearest Element parent. */
function parentElement(node) {
    return node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
}
/**
 * Resolve the current DOM selection into a CiteSelection.
 *
 * The complete Range must belong to one finalized assistant flow. The returned
 * offsets are measured against that flow's plain text and adjusted after
 * trimming, so identical quotations at different locations remain distinct.
 *
 * @param event - context-menu event whose pointer position anchors the menu.
 * @param sourceSessionId - current session identity captured with the DOM range.
 * @returns validated selection metadata, or null when CiteCiter should ignore it.
 */
export function readSelection(event, sourceSessionId) {
    const selection = window.getSelection();
    if (selection === null || selection.isCollapsed || selection.rangeCount === 0)
        return null;
    const range = selection.getRangeAt(0);
    const startFlow = parentElement(range.startContainer)?.closest('[data-chat-flow-kind]');
    const endFlow = parentElement(range.endContainer)?.closest('[data-chat-flow-kind]');
    if (startFlow === null || startFlow === undefined || endFlow !== startFlow)
        return null;
    for (const reasoning of startFlow.querySelectorAll('[data-variant="think"]')) {
        if (range.intersectsNode(reasoning))
            return null;
    }
    for (const generated of startFlow.querySelectorAll('button, .katex, [data-footnotes], sup')) {
        if (range.intersectsNode(generated))
            return null;
    }
    for (const endpoint of [range.startContainer, range.endContainer]) {
        const element = parentElement(endpoint);
        if (element?.closest('.md-code-block') !== null && element?.closest('pre') === null)
            return null;
    }
    const kind = startFlow.dataset.chatFlowKind;
    const anchorKey = startFlow.dataset.chatAnchorKey;
    if (kind !== 'assistant-step' || anchorKey === undefined || anchorKey === '')
        return null;
    const rawText = range.toString();
    const text = rawText.trim();
    if (text === '')
        return null;
    const before = range.cloneRange();
    before.selectNodeContents(startFlow);
    before.setEnd(range.startContainer, range.startOffset);
    const leadingWhitespace = rawText.length - rawText.trimStart().length;
    const trailingWhitespace = rawText.length - rawText.trimEnd().length;
    const startOffset = before.toString().length + leadingWhitespace;
    const endOffset = before.toString().length + rawText.length - trailingWhitespace;
    const flowText = startFlow.textContent ?? '';
    if (startOffset < 0 || endOffset < startOffset || endOffset > flowText.length)
        return null;
    return {
        sourceSessionId,
        displayText: text,
        kind,
        anchorKey,
        startOffset,
        endOffset,
        prefixText: flowText.slice(Math.max(0, startOffset - RANGE_CONTEXT_CHARS), startOffset),
        suffixText: flowText.slice(endOffset, endOffset + RANGE_CONTEXT_CHARS),
        x: event.clientX,
        y: event.clientY,
    };
}

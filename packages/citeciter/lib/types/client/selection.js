const RANGE_CONTEXT_CHARS = 240;
const TRANSLATED_CONTENT_SELECTOR = '[data-read-frog-translation-mode]';
/** Resolve a DOM Node to its nearest Element parent. */
function parentElement(node) {
    return node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
}
function isTranslatedContent(node) {
    return node.nodeType === Node.ELEMENT_NODE && node.matches(TRANSLATED_CONTENT_SELECTOR);
}
function committedText(root, target) {
    let text = '';
    let targetStart;
    let targetEnd;
    const visit = (node) => {
        if (isTranslatedContent(node))
            return;
        if (node === target)
            targetStart = text.length;
        if (node.nodeType === Node.TEXT_NODE)
            text += node.textContent ?? '';
        else
            for (const child of node.childNodes)
                visit(child);
        if (node === target)
            targetEnd = text.length;
    };
    visit(root);
    return { text, targetStart, targetEnd };
}
function committedTextBefore(root, boundary, offset) {
    let text = '';
    let found = false;
    const visit = (node) => {
        if (found || isTranslatedContent(node))
            return;
        if (node === boundary) {
            if (node.nodeType === Node.TEXT_NODE)
                text += (node.textContent ?? '').slice(0, offset);
            else
                for (let index = 0; index < offset; index++) {
                    const child = node.childNodes[index];
                    if (child !== undefined)
                        visit(child);
                }
            found = true;
            return;
        }
        if (node.nodeType === Node.TEXT_NODE)
            text += node.textContent ?? '';
        else
            for (const child of node.childNodes)
                visit(child);
    };
    visit(root);
    return found ? text : null;
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
export function readSelection(event, sourceSessionId) {
    const selection = window.getSelection();
    if (selection === null || selection.isCollapsed || selection.rangeCount === 0)
        return null;
    const range = selection.getRangeAt(0);
    const startFlow = parentElement(range.startContainer)?.closest('[data-chat-flow-kind]');
    const endFlow = parentElement(range.endContainer)?.closest('[data-chat-flow-kind]');
    if (startFlow === null || startFlow === undefined || endFlow === null || endFlow === undefined)
        return null;
    if (endFlow !== startFlow) {
        const flow = [...document.querySelectorAll('[data-chat-flow-kind="assistant-step"][data-chat-anchor-key]')]
            .filter((candidate) => range.intersectsNode(candidate))
            .at(-1);
        const anchorKey = flow?.dataset.chatAnchorKey;
        const displayText = range.toString().trim();
        if (flow === undefined || anchorKey === undefined || anchorKey === '' || displayText === '')
            return null;
        const projected = committedText(flow).text;
        const sourceHintText = projected.trim();
        if (sourceHintText === '')
            return null;
        const startOffset = projected.length - projected.trimStart().length;
        const endOffset = projected.length - (projected.length - projected.trimEnd().length);
        return {
            sourceSessionId,
            displayText,
            sourceHintText,
            kind: 'assistant-step',
            anchorKey,
            startOffset,
            endOffset,
            prefixText: '',
            suffixText: '',
            x: event.clientX,
            y: event.clientY,
        };
    }
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
    const translatedStart = parentElement(range.startContainer)?.closest(TRANSLATED_CONTENT_SELECTOR);
    const translatedEnd = parentElement(range.endContainer)?.closest(TRANSLATED_CONTENT_SELECTOR);
    let text;
    let flowText;
    let startOffset;
    let endOffset;
    let sourceHintText;
    if (translatedStart !== null || translatedEnd !== null) {
        if (translatedStart === null || translatedStart === undefined || translatedStart !== translatedEnd)
            return null;
        const sourceElement = translatedStart.parentElement?.closest('[data-read-frog-paragraph]');
        if (sourceElement === null || sourceElement === undefined || !startFlow.contains(sourceElement))
            return null;
        const projected = committedText(startFlow, sourceElement);
        if (projected.targetStart === undefined || projected.targetEnd === undefined)
            return null;
        const rawSourceHint = projected.text.slice(projected.targetStart, projected.targetEnd);
        const sourceLeading = rawSourceHint.length - rawSourceHint.trimStart().length;
        const sourceTrailing = rawSourceHint.length - rawSourceHint.trimEnd().length;
        text = range.toString().trim();
        flowText = projected.text;
        startOffset = projected.targetStart + sourceLeading;
        endOffset = projected.targetEnd - sourceTrailing;
        sourceHintText = rawSourceHint.trim();
    }
    else {
        const beforeStart = committedTextBefore(startFlow, range.startContainer, range.startOffset);
        const beforeEnd = committedTextBefore(startFlow, range.endContainer, range.endOffset);
        if (beforeStart === null || beforeEnd === null || beforeEnd.length < beforeStart.length)
            return null;
        const rawText = beforeEnd.slice(beforeStart.length);
        const leadingWhitespace = rawText.length - rawText.trimStart().length;
        const trailingWhitespace = rawText.length - rawText.trimEnd().length;
        text = rawText.trim();
        flowText = committedText(startFlow).text;
        startOffset = beforeStart.length + leadingWhitespace;
        endOffset = beforeEnd.length - trailingWhitespace;
    }
    if (text === '')
        return null;
    if (startOffset < 0 || endOffset < startOffset || endOffset > flowText.length)
        return null;
    return {
        sourceSessionId,
        displayText: text,
        ...(sourceHintText === undefined ? {} : { sourceHintText }),
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

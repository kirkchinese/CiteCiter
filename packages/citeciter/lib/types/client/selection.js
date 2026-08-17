/**
 * Resolve the current DOM selection into a CiteSelection.
 * Returns null for collapsed or empty selections, selections outside a
 * conversation flow node, and selections outside an assistant step.
 * @param event - context-menu event whose pointer position anchors the menu.
 * @returns validated selection metadata, or null when CiteCiter should ignore it.
 */
export function readSelection(event) {
    const selection = window.getSelection();
    if (selection === null || selection.isCollapsed || selection.rangeCount === 0)
        return null;
    const text = selection.toString().trim();
    if (text === '')
        return null;
    const range = selection.getRangeAt(0);
    const start = range.commonAncestorContainer;
    const element = start.nodeType === Node.ELEMENT_NODE ? start : start.parentElement;
    const flow = element?.closest('[data-chat-flow-kind]');
    if (flow === null || flow === undefined)
        return null;
    const kind = flow.dataset.chatFlowKind;
    const anchorKey = flow.dataset.chatAnchorKey;
    if (kind !== 'assistant-step' || anchorKey === undefined || anchorKey === '')
        return null;
    return {
        text,
        kind,
        anchorKey,
        x: event.clientX,
        y: event.clientY,
    };
}

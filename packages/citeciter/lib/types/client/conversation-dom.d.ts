/** Centralized best-effort adapters for DSH conversation and Read Frog DOM markers. */
/** One parsed DSH conversation flow element. */
export interface DshConversationFlow {
    readonly element: HTMLElement;
    readonly kind: string;
    readonly anchorKey: string | null;
}
/** One validated assistant flow carrying a stable DSH anchor. */
export interface DshAssistantAnchor {
    readonly element: HTMLElement;
    readonly anchorKey: string;
}
/** Best-effort Read Frog selection classification. */
export type ReadFrogSelection = {
    readonly kind: 'none';
} | {
    readonly kind: 'invalid';
} | {
    readonly kind: 'translation';
    readonly sourceParagraph: HTMLElement;
};
/**
 * Parse the nearest DSH conversation flow containing a DOM node.
 *
 * @param node - rendered conversation node to inspect.
 * @returns parsed flow metadata, or null outside a known DSH flow.
 */
export declare function dshConversationFlow(node: Node): DshConversationFlow | null;
/**
 * Parse the assistant anchor that owns a context-menu event target.
 *
 * @param target - browser event target to inspect.
 * @returns validated assistant metadata, or null outside an anchored assistant flow.
 */
export declare function dshAssistantAnchorForTarget(target: EventTarget | null): DshAssistantAnchor | null;
/**
 * Return assistant anchors intersected by a DOM range in document order.
 *
 * @param range - current rendered selection range.
 * @returns validated assistant anchors touched by the range.
 */
export declare function dshIntersectedAssistantAnchors(range: Range): DshAssistantAnchor[];
/**
 * Detect DSH-rendered reasoning, generated controls, and collapsed code chrome.
 *
 * @param range - current rendered selection range.
 * @param flow - assistant flow containing the range.
 * @returns whether the range touches content that CiteCiter must ignore.
 */
export declare function dshRangeTouchesExcludedContent(range: Range, flow: HTMLElement): boolean;
/**
 * Find the current DSH assistant element for a persisted anchor key.
 *
 * @param anchorKey - stable anchor emitted by the DSH conversation renderer.
 * @returns matching rendered assistant element, or null when it is not mounted.
 */
export declare function findDshAssistantAnchor(anchorKey: string): HTMLElement | null;
/**
 * Determine whether a node is a Read Frog translated projection rather than source text.
 *
 * @param node - rendered node to classify.
 * @returns whether Read Frog marks the node as translated content.
 */
export declare function isReadFrogTranslatedContent(node: Node): boolean;
/**
 * Resolve a selection wholly inside one Read Frog translation to its source paragraph.
 *
 * @param range - current rendered selection range.
 * @param assistant - assistant flow containing the translated projection.
 * @returns translation mapping state and source paragraph when available.
 */
export declare function readFrogSelection(range: Range, assistant: HTMLElement): ReadFrogSelection;

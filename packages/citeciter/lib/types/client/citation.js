import { canonicalCitationIdentity } from "../topic.js";
import { resolveCitationRange } from "../citation-mapping.js";
function toHex(bytes) {
    return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
/** Map rendered Markdown selection context back to one exact raw answer range. */
export function normalizeSelectionAgainstAnswer(selection, answer) {
    const resolved = resolveCitationRange(selection, answer);
    return {
        ...selection,
        ...resolved,
    };
}
/** Build the browser claim that the Host later checks against one committed model call. */
export async function createCitationDraft(selection, assistantMessageSeq) {
    if (selection.endOffset <= selection.startOffset
        || selection.endOffset - selection.startOffset !== selection.sourceText.length)
        throw new Error('选中文字与其 UTF-16 来源范围不一致');
    const identity = {
        sourceSessionId: selection.sourceSessionId,
        anchorSeq: assistantMessageSeq,
        startOffset: selection.startOffset,
        endOffset: selection.endOffset,
        sourceText: selection.sourceText,
        displayText: selection.displayText,
        prefixText: selection.prefixText,
        suffixText: selection.suffixText,
    };
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalCitationIdentity(identity)));
    return { ...identity, selectionFingerprint: toHex(digest) };
}

import { canonicalCitationIdentity } from "../topic.js";
import { markdownSourceCandidates, } from "./markdown-source-map.js";
function toHex(bytes) {
    return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
function decodedContext(text) {
    return text
        .replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll('&quot;', '"')
        .replaceAll('&#39;', "'")
        .toLocaleLowerCase()
        .replaceAll(/[\s`*_~[\]()<>#+.!,:;"'\\/|=-]+/gu, '');
}
function commonEdge(left, right, fromEnd) {
    const limit = Math.min(left.length, right.length);
    let matched = 0;
    while (matched < limit) {
        const leftIndex = fromEnd ? left.length - matched - 1 : matched;
        const rightIndex = fromEnd ? right.length - matched - 1 : matched;
        if (left[leftIndex] !== right[rightIndex])
            break;
        matched++;
    }
    return matched;
}
/** Map rendered Markdown selection context back to one exact raw answer range. */
export function normalizeSelectionAgainstAnswer(selection, answer) {
    const candidates = [...markdownSourceCandidates(answer, selection.displayText)];
    if (candidates.length === 0)
        throw new Error('选区无法映射到已提交的模型回答，请重新选择正文后重试');
    const prefix = decodedContext(selection.prefixText);
    const suffix = decodedContext(selection.suffixText);
    const ranked = candidates.map((candidate) => ({
        candidate,
        score: commonEdge(prefix, decodedContext(candidate.displayPrefix), true)
            + commonEdge(suffix, decodedContext(candidate.displaySuffix), false),
    })).sort((left, right) => right.score - left.score);
    const first = ranked[0];
    if (first === undefined || ranked[1]?.score === first.score) {
        throw new Error('选区无法唯一映射到已提交的模型回答，请缩小或扩大选区后重试');
    }
    const { startOffset, endOffset, sourceText } = first.candidate;
    return {
        ...selection,
        startOffset,
        endOffset,
        sourceText,
        prefixText: answer.slice(Math.max(0, startOffset - 240), startOffset),
        suffixText: answer.slice(endOffset, endOffset + 240),
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

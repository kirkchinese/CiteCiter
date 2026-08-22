import { markdownSourceCandidates, } from "./client/markdown-source-map.js";
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
/** Resolve rendered selection context against authoritative Markdown source. */
export function resolveCitationRange(selection, answer) {
    const candidates = [
        ...markdownSourceCandidates(answer, selection.sourceHintText ?? selection.displayText),
    ];
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
        startOffset,
        endOffset,
        sourceText,
        prefixText: answer.slice(Math.max(0, startOffset - 240), startOffset),
        suffixText: answer.slice(endOffset, endOffset + 240),
    };
}

import { actionSourceQuote, actionSourceSession } from "./action-controller.js";
/** Capture an actual selected passage and its address; never reconstruct a citation from Topic metadata. */
export function selectionReferences(source, documentId) {
    const quote = actionSourceQuote(source);
    if (quote.trim() === '')
        throw new Error('请先选中要引用的内容');
    const sourceId = actionSourceSession(source);
    const address = `dsh://session/${encodeURIComponent(sourceId)}`;
    const references = [{ id: address, kind: 'source', label: '来源对话', content: sourceId, address }];
    let quoteAddress = address;
    if (source.kind === 'document') {
        if (documentId === undefined)
            throw new Error('文档快照尚未保存，请重新选择');
        quoteAddress = `dsh://document/${encodeURIComponent(documentId)}`;
        references.push({ id: quoteAddress, kind: 'source', label: '来源文档', content: source.title, address: quoteAddress });
    }
    const anchor = source.kind === 'conversation' ? source.selection.anchorKey : documentId;
    references.push({ id: JSON.stringify(['selection', quoteAddress, anchor, quote]), kind: 'excerpt', label: '引用文段', content: source.kind === 'document' ? `文档：${source.title}\n\n${quote}` : quote });
    return references;
}

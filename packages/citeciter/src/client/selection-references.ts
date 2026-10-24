import type { ActionSource } from './action-controller.ts'
import type { DraftReference } from './draft-references.ts'

// Local copies of the action-controller accessors keep this module free of browser store imports.
const actionSourceQuote = (source: ActionSource): string => source.kind === 'conversation' ? source.selection.displayText : source.displayText
const actionSourceSession = (source: ActionSource): string => source.kind === 'conversation' ? source.selection.sourceSessionId : source.sourceSessionId

/** Capture an actual selected passage and its address; never reconstruct a citation from Topic metadata. */
export function selectionReferences(source: ActionSource, documentId?: string): readonly DraftReference[] {
  const quote = actionSourceQuote(source)
  if (quote.trim() === '') throw new Error('请先选中要引用的内容')
  // A passage of the Topic's own transcript needs no source address: the Topic already has its source.
  if (source.kind === 'topic') return [{ id: JSON.stringify(['selection', `topic:${source.topicSessionId}`, quote]), kind: 'excerpt', label: '引用文段', content: quote }]
  const sourceId = actionSourceSession(source)
  const address = `dsh://session/${encodeURIComponent(sourceId)}`
  const references: DraftReference[] = [{ id: address, kind: 'source', label: '来源对话', content: sourceId, address }]
  let quoteAddress = address
  if (source.kind === 'document') {
    if (documentId === undefined) throw new Error('文档快照尚未保存，请重新选择')
    quoteAddress = `dsh://document/${encodeURIComponent(documentId)}`
    references.push({ id: quoteAddress, kind: 'source', label: '来源文档', content: source.title, address: quoteAddress })
  }
  const anchor = source.kind === 'conversation' ? source.selection.anchorKey : source.kind === 'quote' ? source.anchorKey : documentId
  references.push({ id: JSON.stringify(['selection', quoteAddress, anchor, quote]), kind: 'excerpt', label: '引用文段', content: source.kind === 'document' ? `文档：${source.title}\n\n${quote}` : quote })
  return references
}

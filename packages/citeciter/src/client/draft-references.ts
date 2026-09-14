import type { TopicSummary } from '../topic.ts'

/** One unsent model-visible reference. Removing this value removes its serialized content. */
export interface DraftReference {
  readonly id: string
  readonly kind: 'source' | 'excerpt' | 'board'
  readonly label: string
  readonly content: string
  readonly address?: string
}

/** Build initial references without submitting them. Stable Topic-scoped IDs preserve menu focus during live snapshot refreshes. */
export function topicDraftReferences(topic: TopicSummary, documentTitle?: string): readonly DraftReference[] {
  const address = `dsh://session/${encodeURIComponent(topic.sourceSessionId)}`
  const references: DraftReference[] = [{ id: `source:${topic.sessionId}`, kind: 'source', label: '来源对话', content: topic.sourceSessionId, address }]
  if (topic.documentId !== null) references.push({ id: `document:${topic.sessionId}:${topic.documentId}`, kind: 'source', label: '来源文档', content: documentTitle ?? topic.documentId, address: `dsh://document/${encodeURIComponent(topic.documentId)}` })
  if (topic.citation !== null) references.push({ id: `excerpt:${topic.sessionId}`, kind: 'excerpt', label: '引用文段', content: topic.citation.displayText })
  return references
}

/** Display a document filename while retaining the full title/path in its serialized content. Legacy ID-only references keep their generic label. */
export function draftReferenceName(reference: DraftReference): string {
  if (reference.label !== '来源文档' || reference.address?.endsWith(`/${encodeURIComponent(reference.content)}`)) return reference.label
  return reference.content.split(/[\\/]/u).at(-1) || reference.label
}

/** Serialize the exact visible attachment collection only at manual submission. */
export function serializeDraftReferences(question: string, references: readonly DraftReference[]): string {
  if (references.length === 0) return question.trim()
  const attachments = references.map(reference => `【附件：${reference.label}】\n${reference.address === undefined ? '' : `来源：${reference.address}\n`}${reference.content}`).join('\n\n')
  return `${question.trim()}\n\n${attachments}`.trim()
}

/** Present sent reference blocks as expandable attachments while retaining the exact serialized model input in the Session log. Unrecognized text is preserved. */
export function parseSentReferences(text: string): { readonly question: string, readonly references: readonly DraftReference[] } {
  const marker = /(?:^|\n\n)【附件：(来源对话|来源文档|引用文段|板书引用)】\n/gu
  const matches = [...text.matchAll(marker)]
  if (matches.length === 0) return { question: text, references: [] }
  const references = matches.map((match, index): DraftReference => {
    const label = match[1]!
    const block = text.slice(match.index! + match[0].length, matches[index + 1]?.index ?? text.length).trimEnd()
    const address = /^来源：(dsh:\/\/(?:session|document)\/[^\n]+)\n/u.exec(block)
    return { id: `sent-${index}`, kind: label === '板书引用' ? 'board' : label === '引用文段' ? 'excerpt' : 'source', label, content: address === null ? block : block.slice(address[0].length), ...(address === null ? {} : { address: address[1]! }) }
  })
  return { question: text.slice(0, matches[0]!.index).trimEnd(), references }
}

import type { Session } from '@deepseek-ai/dsh-session'
import { hasSentSource } from './source-session.ts'

/**
 * Resolve one document from durable user submissions. Draft metadata grants no access.
 * @param session - the Topic Session whose committed user messages carry document addresses.
 * @param requested - explicit documentId; optional when exactly one document was sent.
 * @returns the readable documentId.
 */
export function resolveReadableDocument(session: Session | undefined, requested?: string): string {
  const submitted = new Set<string>()
  for (const event of session?.snapshotEvents() ?? []) {
    if (event.type !== 'user/message' || event.data.source.kind !== 'user') continue
    for (const block of event.data.content) if (block.type === 'text') {
      for (const match of block.text.matchAll(/^来源：dsh:\/\/document\/([^\s]+)$/gmu)) {
        try { submitted.add(decodeURIComponent(match[1]!)) }
        catch { /* Malformed pasted addresses do not identify a saved document. */ }
      }
    }
  }
  const id = requested ?? (submitted.size === 1 ? [...submitted][0] : undefined)
  if (id === undefined) throw new Error(submitted.size === 0 ? '来源文档未作为附件发送，请用户选文并发送后再读取' : '已引用多份文档，请使用附件地址中的 documentId 指定要读取的文档')
  if (!submitted.has(id) || !hasSentSource(session, `dsh://document/${encodeURIComponent(id)}`)) throw new Error('该文档未作为附件发送，请用户附加后再读取')
  return id
}

import type { Session } from '@deepseek-ai/dsh-session'
import { defineTool } from '@deepseek-ai/dsh-tools'

const DOCUMENT_TOOL_MAX_BYTES = 50 * 1024
const DOCUMENT_SEARCH_MAX_MATCHES = 20

/** Read an immutable document only after checking the requesting Session's submitted attachments. The caller owns authorization and storage; tools own ranges, output budgets and model-visible guidance. */
export type AuthorizedDocumentReader = (requested: string | undefined, session: Session | undefined) => Promise<{ readonly documentId: string, readonly content: string }>

/** Build a bounded document reader. Offsets and documentLength count UTF-16 code units, while bytesUsed measures the UTF-8 response text. Invalid ranges remain errors; they are never silently clamped. */
export function createDocumentReadTool(read: AuthorizedDocumentReader) {
  return defineTool({
    name: 'read_document',
    description: 'Read up to 50 KiB of text from a document manually attached to this Topic. Offsets are UTF-16 code units, not bytes or lines. Omit throughOffset when the end is unknown; search_document returns documentLength. To continue, use nextFromOffset and omit throughOffset. truncated only describes this requested range; hasMore indicates later document content. Unsent draft addresses grant no access.',
    parameters: {
      documentId: { type: 'string', description: 'Document identity from a submitted dsh://document/<id> attachment. May be omitted only when exactly one document has been submitted.' },
      fromOffset: { type: 'integer', description: 'Inclusive UTF-16 offset from 0 through documentLength, default 0. Use nextFromOffset to continue.' },
      throughOffset: { type: 'integer', description: 'Optional exclusive UTF-16 offset, at most documentLength. Omit to read toward the end; do not guess an endpoint beyond a search match.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          documentId: { type: 'string', required: true },
          documentLength: { type: 'integer', required: true, description: 'Full document length in UTF-16 code units, independent of the requested range and byte budget.' },
          fromOffset: { type: 'integer', required: true },
          requestedThroughOffset: { type: 'integer', required: true, description: 'Exclusive requested bound after applying the default document end.' },
          throughOffset: { type: 'integer', required: true, description: 'Exclusive end actually returned; use nextFromOffset for continuation.' },
          truncated: { type: 'boolean', required: true, description: 'The byte budget stopped within the requested range. false does not mean the document ended.' },
          hasMore: { type: 'boolean', required: true, description: 'There is document content after throughOffset, including beyond an explicit requested bound.' },
          nextFromOffset: { oneOf: [{ type: 'integer' }, { type: 'null' }], required: true, description: 'Next unread UTF-16 offset, or null at the document end. Continue without throughOffset to advance beyond a prior range cap.' },
          bytesUsed: { type: 'integer', required: true },
          text: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }],
      presentationMeta: (_args, value) => ({ fromOffset: value.fromOffset, throughOffset: value.throughOffset }),
    },
    execute: async (args, exec) => {
      const { documentId, content } = await read(args.documentId, exec.agent?.session)
      exec.signal.throwIfAborted()
      const documentLength = content.length
      const fromOffset = args.fromOffset ?? 0
      if (!Number.isSafeInteger(fromOffset) || fromOffset < 0 || fromOffset > documentLength) {
        throw new Error(`fromOffset must be a safe UTF-16 integer in [0, ${documentLength}]; documentLength=${documentLength}. Use an offset from search_document or the previous nextFromOffset.`)
      }
      const requestedThroughOffset = args.throughOffset ?? documentLength
      if (!Number.isSafeInteger(requestedThroughOffset) || requestedThroughOffset < fromOffset || requestedThroughOffset > documentLength) {
        throw new Error(`throughOffset must be a safe UTF-16 integer in [${fromOffset}, ${documentLength}]; documentLength=${documentLength}. Omit throughOffset to read toward the document end.`)
      }
      const requested = content.slice(fromOffset, requestedThroughOffset)
      let text = ''
      let bytesUsed = 0
      for (const character of requested) {
        const characterBytes = Buffer.byteLength(character, 'utf8')
        if (bytesUsed + characterBytes > DOCUMENT_TOOL_MAX_BYTES) break
        text += character
        bytesUsed += characterBytes
      }
      const throughOffset = fromOffset + text.length
      const hasMore = throughOffset < documentLength
      return {
        documentId,
        documentLength,
        fromOffset,
        requestedThroughOffset,
        throughOffset,
        truncated: text.length < requested.length,
        hasMore,
        nextFromOffset: hasMore ? throughOffset : null,
        bytesUsed,
        text,
      }
    },
    presentCall: (args) => ({ card: 'generic', title: `阅读文档 · ${args.fromOffset ?? 0}` }),
    presentResult: (_args, result) => ({ card: 'generic', title: result.isError ? '文档读取失败' : '已读取文档' }),
  })
}

/** Build document search independently of Topic lifecycle. Returns the document horizon so the model can expand a match without inventing an out-of-range endpoint. */
export function createDocumentSearchTool(read: AuthorizedDocumentReader) {
  return defineTool({
    name: 'search_document',
    description: 'Find up to 20 case-insensitive occurrences in one document manually attached to this Topic. Returns UTF-16 match offsets and documentLength, not byte positions. Expand a match with read_document fromOffset and omit throughOffset, or cap it at documentLength.',
    parameters: {
      documentId: { type: 'string', description: 'Document identity from a submitted attachment. Required when more than one document has been submitted.' },
      query: { type: 'string', required: true, description: 'Case-insensitive substring to locate, at most 200 characters.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          documentId: { type: 'string', required: true },
          documentLength: { type: 'integer', required: true, description: 'Full document length in UTF-16 code units; the maximum exclusive read_document endpoint.' },
          query: { type: 'string', required: true },
          truncated: { type: 'boolean', required: true },
          matches: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                startOffset: { type: 'integer', required: true },
                endOffset: { type: 'integer', required: true },
              },
            },
          },
        },
      },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }],
      presentationMeta: (_args, value) => ({ matches: value.matches.length }),
    },
    execute: async (args, exec) => {
      const query = args.query.trim()
      if (query === '' || query.length > 200) throw new Error('query must be 1-200 characters')
      const { documentId, content } = await read(args.documentId, exec.agent?.session)
      exec.signal.throwIfAborted()
      // Search the original text: lowercasing the whole document can expand Unicode
      // characters and shift every following offset away from the stored content.
      const pattern = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'), 'giu')
      const matches: { startOffset: number, endOffset: number }[] = []
      let truncated = false
      for (const match of content.matchAll(pattern)) {
        if (matches.length === DOCUMENT_SEARCH_MAX_MATCHES) { truncated = true; break }
        matches.push({ startOffset: match.index, endOffset: match.index + match[0].length })
      }
      return {
        documentId,
        documentLength: content.length,
        query,
        truncated,
        matches,
      }
    },
    presentCall: (args) => ({ card: 'generic', title: `检索文档 · ${args.query}` }),
    presentResult: (_args, result) => ({ card: 'generic', title: result.isError ? '检索失败' : `检索到 ${(result.meta as { readonly matches?: number })?.matches ?? 0} 处` }),
  })
}

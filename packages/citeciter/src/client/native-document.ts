import { parseFileAddress } from '@deepseek-ai/dsh-util-workspace-path'
import { SessionId } from '@deepseek-ai/dsh-session/types'
import type { ActionSource } from './action-controller.ts'
import type { ReaderSelection } from './reader-selection.ts'
import type { DocumentPreviewProps } from '@deepseek-ai/dsh-client-ui-sidebar-documentpreview/client'

/** Decode a complete Host-owned preview buffer. Reject binary, partial and oversized imports. */
export function decodeNativeText(content: DocumentPreviewProps['content']): string {
  if (content.kind !== 'text' && content.kind !== 'bytes') throw new Error('此预览没有文本数据，请切换到文本文件的学习查看方式')
  if (content.kind === 'text' && !content.eof) throw new Error('请等待原生预览读取完整文件后再学习')
  if (content.kind === 'bytes' && content.data.byteLength > 8 * 1024 * 1024) throw new Error('学习文本超过 8 MiB 上限')
  const text = content.kind === 'text' ? content.text : new TextDecoder('utf-8', { fatal: true }).decode(content.data)
  if (text.includes('\0')) throw new Error('学习查看方式只支持 UTF-8 文本')
  if (text.length > 2_000_000) throw new Error('学习文本不能超过 2,000,000 个字符')
  return text
}

/** Capture the file address's own Session and immutable text, never the later active tab. */
export function nativeDocumentSource(address: string, content: string, selection: ReaderSelection): ActionSource {
  const file = parseFileAddress(address)
  if (file?.scope !== 'session') throw new Error('文件地址没有来源会话')
  return { kind: 'document', sourceSessionId: SessionId(file.sessionId), title: file.path, content, ...selection }
}

import { t } from './i18n.ts'
import { parseFileAddress } from '@deepseek-ai/dsh-util-workspace-path'
import { SessionId } from '@deepseek-ai/dsh-session/types'
import type { ActionSource } from './action-controller.ts'
import type { ReaderSelection } from './reader-selection.ts'
import type { DocumentPreviewProps } from '@deepseek-ai/dsh-client-ui-sidebar-documentpreview/client'

/** Decode a complete Host-owned preview buffer. Reject binary, partial and oversized imports. */
export function decodeNativeText(content: DocumentPreviewProps['content']): string {
  if (content.kind !== 'text' && content.kind !== 'bytes') throw new Error(t('settings.error.nativeNoText'))
  if (content.kind === 'text' && !content.eof) throw new Error(t('settings.error.nativeIncomplete'))
  if (content.kind === 'bytes' && content.data.byteLength > 8 * 1024 * 1024) throw new Error(t('settings.error.nativeTooManyBytes'))
  const text = content.kind === 'text' ? content.text : new TextDecoder('utf-8', { fatal: true }).decode(content.data)
  if (text.includes('\0')) throw new Error(t('settings.error.nativeUtf8'))
  if (text.length > 2_000_000) throw new Error(t('settings.error.nativeTooLong'))
  return text
}

/** Capture the file address's own Session and immutable text, never the later active tab. */
export function nativeDocumentSource(address: string, content: string, selection: ReaderSelection): ActionSource {
  const file = parseFileAddress(address)
  if (file?.scope !== 'session') throw new Error(t('settings.error.nativeNoSource'))
  return { kind: 'document', sourceSessionId: SessionId(file.sessionId), title: file.path, content, ...selection }
}

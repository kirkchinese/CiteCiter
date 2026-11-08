import { t } from './i18n.ts'
import { parseFileAddress } from '@deepseek-ai/dsh-util-workspace-path'
import { SessionId } from '@deepseek-ai/dsh-session/types'
import type { ActionSource } from './action-controller.ts'
import type { DocumentSelection } from './components/DocumentView.tsx'
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

/**
 * Capture the file's Session and immutable text. A file read through a Session belongs to that Session;
 * a file opened by its absolute path belongs to no Session, so it is asked about in the conversation on screen.
 * @param onScreen - the main conversation on screen, or null when none is.
 */
export function nativeDocumentSource(address: string, content: string, selection: DocumentSelection, onScreen: SessionId | null): ActionSource {
  const file = parseFileAddress(address)
  const session = file?.scope === 'session' ? SessionId(file.sessionId) : file?.scope === 'absolute' ? onScreen : null
  if (file === undefined || session === null) throw new Error(t('settings.error.nativeNoSource'))
  return { kind: 'document', sourceSessionId: session, title: file.path, content, ...selection }
}

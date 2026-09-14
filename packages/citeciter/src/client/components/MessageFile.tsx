import { IconDownloadOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { NativeComposer } from '../native-composer.ts'
import { useFileDownload } from '../file-download.ts'
import type { MessageAttachment } from './MessageAttachments.tsx'
import css from './MessageAttachments.module.css'

/** Accessible file chip. The download hook owns requests and object URLs. */
export function MessageFile({ sessionId, attachment, load }: { readonly sessionId: string, readonly attachment: MessageAttachment, readonly load: NativeComposer['attachment'] }) {
  const { download, busy, error } = useFileDownload(sessionId, attachment.id, attachment.name, load)
  return <div className={css.file}>
    <button type="button" className={css.download} onClick={() => { void download() }} disabled={busy} aria-busy={busy} aria-label={`${busy ? '正在读取' : error === undefined ? '下载' : '重试下载'}附件 ${attachment.name}`} title={attachment.name}>
      <IconDownloadOutline16 size={16} /><span>{attachment.name}</span>
    </button>
    {error !== undefined && <span className={css.error} role="alert">下载失败，点击重试：{error}</span>}
  </div>
}

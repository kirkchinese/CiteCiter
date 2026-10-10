import type { ComposerAttachment, DraftAttachmentId } from '@deepseek-ai/dsh-client-ui-conversation/client'
import css from './ReferenceAttachments.module.css'
import { useState, useSyncExternalStore } from 'react'
import type { NativeComposer } from '../native-composer.ts'

/** Report a failed local preview without dropping the original file or changing its upload state. */
function DraftImagePreview({ url }: { readonly url: string }) {
  const [failedUrl, setFailedUrl] = useState<string>()
  return failedUrl === url
    ? <small className={css.unavailable} role="alert" title="图片无法预览，可移除后重新添加；原文件仍保留。">无法预览</small>
    : <img key={url} src={url} width="28" height="28" alt="" onError={() => setFailedUrl(url)} style={{ objectFit: 'cover', borderRadius: 5 }} />
}

/** Native Conversation-owned file drafts. The owning controller handles upload and lifetime. */
export function FileAttachments({ files, remove, native, sessionId }: { readonly files: readonly ComposerAttachment[], readonly remove: (id: DraftAttachmentId) => void, readonly native: NativeComposer, readonly sessionId: string }) {
  const uploads = useSyncExternalStore(native.uploads.subscribe, native.uploads.getSnapshot)
  return <div className={css.rail}>{files.map(item => <span key={item.id} className={css.chip} title={item.file.name}>
    {item.kind === 'image' && <DraftImagePreview url={item.previewUrl} />}
    <span>{item.file.name}</span>
    {uploads[item.id]?.status === 'uploading' && <small role="status">上传中</small>}
    {uploads[item.id]?.status === 'error' && <button type="button" title="上传失败，点击重试" onClick={() => native.retry(sessionId, item.id)}>重试</button>}
    <button type="button" aria-label={`移除附件 ${item.file.name}`} onClick={() => remove(item.id)}>×</button>
  </span>)}</div>
}

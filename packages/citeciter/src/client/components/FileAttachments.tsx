import { t, useLocale } from '../i18n.ts'
import { IconCloseOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ComposerAttachment, DraftAttachmentId } from '@deepseek-ai/dsh-client-ui-conversation/client'
import css from './ReferenceAttachments.module.css'
import { useState, useSyncExternalStore } from 'react'
import type { NativeComposer } from '../native-composer.ts'

/** Report a failed local preview without dropping the original file or changing its upload state. */
function DraftImagePreview({ url }: { readonly url: string }) {
  useLocale()
  const [failedUrl, setFailedUrl] = useState<string>()
  return failedUrl === url
    ? <small className={css.unavailable} role="alert" title={t('panel.file.previewHint')}>{t('panel.file.previewUnavailable')}</small>
    : <img key={url} src={url} width="28" height="28" alt="" onError={() => setFailedUrl(url)} style={{ objectFit: 'cover', borderRadius: 5 }} />
}

/** Native Conversation-owned file drafts. The owning controller handles upload and lifetime. */
export function FileAttachments({ files, remove, native, sessionId }: { readonly files: readonly ComposerAttachment[], readonly remove: (id: DraftAttachmentId) => void, readonly native: NativeComposer, readonly sessionId: string }) {
  useLocale()
  const uploads = useSyncExternalStore(native.uploads.subscribe, native.uploads.getSnapshot)
  return <div className={css.rail}>{files.map(item => <span key={item.id} className={css.chip} title={item.file.name}>
    {item.kind === 'image' && <DraftImagePreview url={item.previewUrl} />}
    <span>{item.file.name}</span>
    {uploads[item.id]?.status === 'uploading' && <small role="status">{t('panel.file.uploading')}</small>}
    {uploads[item.id]?.status === 'error' && <button type="button" title={t('panel.file.uploadFailed')} onClick={() => native.retry(sessionId, item.id)}>{t('panel.file.retry')}</button>}
    <button type="button" aria-label={t('panel.file.remove', { name: item.file.name })} onClick={() => remove(item.id)}><IconCloseOutlineRegular /></button>
  </span>)}</div>
}

import { useCallback, useEffect, useState } from 'react'
import type { NativeComposer } from '../native-composer.ts'
import { HostImagePreview } from '../host-image-preview.tsx'
import type { MessageAttachment } from './MessageAttachments.tsx'
import css from './MessageAttachments.module.css'

/** Own an authorized image URL and its preview for exactly one mounted attachment. */
export function MessageImage({ sessionId, attachment, load }: { readonly sessionId: string, readonly attachment: MessageAttachment, readonly load: NativeComposer['attachment'] }) {
  const [url, setUrl] = useState<string>()
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  useEffect(() => {
    let disposed = false
    let owned: string | undefined
    setUrl(undefined); setError(false); setOpen(false)
    void load(sessionId, attachment.id).then(blob => {
      if (disposed) return
      owned = URL.createObjectURL(blob); setUrl(owned)
    }).catch(() => { if (!disposed) setError(true) })
    return () => { disposed = true; if (owned !== undefined) URL.revokeObjectURL(owned) }
  }, [sessionId, attachment.id, load])
  if (error) return <span role="status">图片暂不可用：{attachment.name}</span>
  if (url === undefined) return <span>加载图片…</span>
  return <>
    <button type="button" className={css.imageButton} aria-label={`预览图片 ${attachment.name}`} aria-haspopup="dialog" onClick={() => setOpen(true)}>
      <img src={url} alt={attachment.name} onError={() => { setError(true); setOpen(false) }} />
    </button>
    {open && <HostImagePreview src={url} alt={attachment.name} onClose={close} />}
  </>
}

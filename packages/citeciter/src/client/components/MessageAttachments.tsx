import { useEffect, useState } from 'react'
import type { NativeComposer } from '../native-composer.ts'
import { MessageFile } from './MessageFile.tsx'
import css from './MessageAttachments.module.css'

export interface MessageAttachment { readonly kind: 'image' | 'file', readonly id: string, readonly name: string }

function MessageImage({ sessionId, attachment, load }: { readonly sessionId: string, readonly attachment: MessageAttachment, readonly load: NativeComposer['attachment'] }) {
  const [url, setUrl] = useState<string>()
  const [error, setError] = useState(false)
  useEffect(() => {
    let disposed = false
    let owned: string | undefined
    setUrl(undefined); setError(false)
    void load(sessionId, attachment.id).then(blob => {
      if (disposed) return
      owned = URL.createObjectURL(blob); setUrl(owned)
    }).catch(() => { if (!disposed) setError(true) })
    return () => { disposed = true; if (owned !== undefined) URL.revokeObjectURL(owned) }
  }, [sessionId, attachment.id, load])
  return error ? <span>图片暂不可用：{attachment.name}</span> : url === undefined ? <span>加载图片…</span> : <a href={url} target="_blank" rel="noreferrer" title="打开图片"><img src={url} alt={attachment.name} style={{ display: 'block', maxWidth: '100%', maxHeight: 320, objectFit: 'contain', borderRadius: 12 }} /></a>
}

/** Render durable native attachments with a session-authorized loader and owned object URLs. */
export function MessageAttachments({ sessionId, attachments, load }: { readonly sessionId: string, readonly attachments: readonly MessageAttachment[], readonly load: NativeComposer['attachment'] }) {
  return <div className={css.attachments}>{attachments.map(item => item.kind === 'image' ? <MessageImage key={item.id} sessionId={sessionId} attachment={item} load={load} /> : <MessageFile key={item.id} sessionId={sessionId} attachment={item} load={load} />)}</div>
}

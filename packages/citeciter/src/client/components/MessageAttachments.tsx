import type { NativeComposer } from '../native-composer.ts'
import { MessageFile } from './MessageFile.tsx'
import { MessageImage } from './MessageImage.tsx'
import css from './MessageAttachments.module.css'

export interface MessageAttachment { readonly kind: 'image' | 'file', readonly id: string, readonly name: string }

/** Render durable native attachments with a session-authorized loader and owned object URLs. */
export function MessageAttachments({ sessionId, attachments, load }: { readonly sessionId: string, readonly attachments: readonly MessageAttachment[], readonly load: NativeComposer['attachment'] }) {
  return <div className={css.attachments}>{attachments.map(item => item.kind === 'image' ? <MessageImage key={item.id} sessionId={sessionId} attachment={item} load={load} /> : <MessageFile key={item.id} sessionId={sessionId} attachment={item} load={load} />)}</div>
}

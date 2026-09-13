import { useState } from 'react'
import { draftReferenceName, type DraftReference } from '../draft-references.ts'
import { RichAnswer } from './RichAnswer.tsx'
import css from './ReferenceAttachments.module.css'

/** Removable draft chips and rendered previews. No model calls or source reads. */
export function ReferenceAttachments({ references, onRemove }: {
  readonly references: readonly DraftReference[]
  readonly onRemove?: (id: string) => void
}) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const current = references.find(reference => reference.id === expanded)
  return <div className={css.attachments}>
    <div className={css.rail} aria-label={onRemove === undefined ? '已发送引用附件' : '待发送引用附件'}>{references.map(reference => <div className={css.chip} key={reference.id}>
      {onRemove !== undefined && <button type="button" title="移除附件" aria-label={`移除${reference.label}`} onClick={() => onRemove(reference.id)}>×</button>}
      <button type="button" title={reference.kind === 'source' ? reference.content : reference.label} aria-label={draftReferenceName(reference) === reference.label ? reference.label : `${reference.label}：${draftReferenceName(reference)}`} aria-expanded={expanded === reference.id} onClick={() => setExpanded(expanded === reference.id ? null : reference.id)}><span aria-hidden="true">{reference.kind === 'source' ? '↳' : reference.kind === 'board' ? '▧' : '❝'}</span> {draftReferenceName(reference)}</button>
    </div>)}</div>
    {current !== undefined && <div className={css.preview}>
      {current.address !== undefined && <code>{current.address}</code>}
      {current.kind === 'source' ? <p>{current.content}</p> : <RichAnswer text={current.content} streaming={false} />}
    </div>}
  </div>
}

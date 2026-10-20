import { IconCloseOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import { useState } from 'react'
import { draftReferenceTitle, type DraftReference } from '../draft-references.ts'
import { RichAnswer } from './RichAnswer.tsx'
import css from './ReferenceAttachments.module.css'

/**
 * Removable draft chips and rendered previews. No model calls or source reads.
 * @param sourceTitle - resolves a source session's display title for its chip.
 */
export function ReferenceAttachments({ references, onRemove, sourceTitle }: {
  readonly references: readonly DraftReference[]
  readonly onRemove?: (id: string) => void
  readonly sourceTitle?: ((sessionId: string) => string | undefined) | undefined
}) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const current = references.find(reference => reference.id === expanded)
  return <div className={css.attachments}>
    <div className={css.rail} aria-label={onRemove === undefined ? '已发送的引用' : '待发送的引用'}>{references.map(reference => {
      const title = draftReferenceTitle(reference, sourceTitle)
      return <div className={css.chip} key={reference.id} data-kind={reference.kind}>
        <button type="button" title={reference.kind === 'source' ? title : reference.label} aria-label={`${reference.label}：${title}`} aria-expanded={expanded === reference.id} onClick={() => setExpanded(expanded === reference.id ? null : reference.id)}>
          <span aria-hidden="true">{reference.kind === 'source' ? '↳' : reference.kind === 'board' ? '▧' : '❝'}</span>{title}
        </button>
        {onRemove !== undefined && <button type="button" className={css.remove} title="移除" aria-label={`移除${reference.label}`} onClick={() => onRemove(reference.id)}><IconCloseOutlineRegular /></button>}
      </div>
    })}</div>
    {current !== undefined && <div className={css.preview}>
      {current.kind === 'source' ? <p>{draftReferenceTitle(current, sourceTitle)}</p> : <RichAnswer text={current.content} streaming={false} />}
    </div>}
  </div>
}

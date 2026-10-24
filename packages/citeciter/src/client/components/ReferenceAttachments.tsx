import { IconCloseOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import { useState } from 'react'
import { draftReferenceLabel, draftReferenceTitle, type DraftReference } from '../draft-references.ts'
import { t, useLocale } from '../i18n.ts'
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
  useLocale()
  const [expanded, setExpanded] = useState<string | null>(null)
  const current = references.find(reference => reference.id === expanded)
  return <div className={css.attachments}>
    <div className={css.rail} aria-label={t(onRemove === undefined ? 'transcript.reference.sent' : 'transcript.reference.pending')}>{references.map(reference => {
      const title = draftReferenceTitle(reference, sourceTitle)
      const kind = draftReferenceLabel(reference)
      return <div className={css.chip} key={reference.id} data-kind={reference.kind}>
        <button type="button" title={reference.kind === 'source' ? title : kind} aria-label={`${kind}：${title}`} aria-expanded={expanded === reference.id} onClick={() => setExpanded(expanded === reference.id ? null : reference.id)}>
          <span aria-hidden="true">{reference.kind === 'source' ? '↳' : reference.kind === 'board' ? '▧' : '❝'}</span>{title}
        </button>
        {onRemove !== undefined && <button type="button" className={css.remove} title={t('transcript.reference.remove')} aria-label={t('transcript.reference.removeKind', { kind })} onClick={() => onRemove(reference.id)}><IconCloseOutlineRegular /></button>}
      </div>
    })}</div>
    {current !== undefined && <div className={css.preview}>
      {current.kind === 'source' ? <p>{draftReferenceTitle(current, sourceTitle)}</p> : <RichAnswer text={current.content} streaming={false} />}
    </div>}
  </div>
}

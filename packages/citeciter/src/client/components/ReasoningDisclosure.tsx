import { useMemo, useState } from 'react'
import { DisclosureRow, IconThinkOutline14, MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import { markdownLabels } from '../copy.ts'
import css from './ReasoningDisclosure.module.css'

/** Display only reasoning actually returned by the model. Expansion is local UI state; no model call or Session mutation occurs. */
export function ReasoningDisclosure({ text, active }: { readonly text: string, readonly active: boolean }) {
  const [open, setOpen] = useState(false)
  const preview = useMemo(() => text.replaceAll(/\s+/gu, ' ').trim().slice(0, 180), [text])
  return (
    <DisclosureRow
      className={css.disclosure}
      rowClassName={active ? css.activeRow : css.row}
      icon={<IconThinkOutline14 />}
      title={active ? '思考中' : '思考'}
      open={open}
      expandable
      expandOnRowClick
      onToggle={() => setOpen(value => !value)}
      collapsedContent={<span className={css.preview}>· {preview}</span>}
    >
      <div className={css.body}>
        <MarkdownText text={text} streaming={active} labels={markdownLabels} />
      </div>
    </DisclosureRow>
  )
}

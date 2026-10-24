import { useState } from 'react'
import { DisclosureRow, IconContextInjectionOutlineRegular, ReferenceIconRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import type { TopicMessage } from '../../topic.ts'
import css from './ContextRow.module.css'

/** Model-facing text stays bounded at the disclosure, as in DSH's own context rows. */
const MAX_CHARS = 20_000

/**
 * One logged context message, drawn like DSH's context injection row: the role it plays, the
 * producer its source names and a notice's one-line summary, expanding to the exact text the
 * model received.
 */
export function ContextRow({ message }: { readonly message: Extract<TopicMessage, { role: 'context' }> }) {
  const [open, setOpen] = useState(false)
  const recall = message.contextRole === 'recall'
  const text = message.text.length > MAX_CHARS ? `${message.text.slice(0, MAX_CHARS)}\n…（共 ${message.text.length} 字，已截断显示）` : message.text
  return (
    <div className={css.root} data-citeciter-message={message.id} data-open={open ? '' : undefined}>
      <DisclosureRow
        icon={recall ? <ReferenceIconRegular kind="session" /> : <IconContextInjectionOutlineRegular size={14} />}
        title={message.label}
        open={open}
        expandable
        expandOnRowClick
        onToggle={() => setOpen(!open)}
        collapsedContent={<>
          {message.producer != null && message.producer !== '' && <><span className={css.sep} aria-hidden="true" /><span className={css.source}>{message.producer}</span></>}
          {message.summary !== undefined && <><span className={css.sep} aria-hidden="true" /><span className={css.summary}>{message.summary}</span></>}
        </>}
        keepContentWhenOpen
      >
        <pre className={css.body}>{text}</pre>
      </DisclosureRow>
    </div>
  )
}

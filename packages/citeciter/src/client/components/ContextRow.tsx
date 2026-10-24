import { useState } from 'react'
import { DisclosureRow, IconContextInjectionOutlineRegular, ReferenceIconRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import type { TopicMessage } from '../../topic.ts'
import { t, useLocale, type CiterKey } from '../i18n.ts'
import css from './ContextRow.module.css'

/** Model-facing text stays bounded at the disclosure, as in DSH's own context rows. */
const MAX_CHARS = 20_000

const PRODUCERS: Readonly<Record<string, CiterKey>> = {
  '来源摘录': 'transcript.context.sourceWindow',
  '代码库变化': 'transcript.context.workspaceChanges',
  '运行环境': 'transcript.context.runtime',
  '时间': 'transcript.context.time',
  '系统提示词': 'transcript.context.systemPrompt',
  '项目说明': 'transcript.context.instructions',
  '技能目录': 'transcript.context.skills',
}

/** One logged context row; only known Host presentation copy is localized, never its model-visible body. */
export function ContextRow({ message }: { readonly message: Extract<TopicMessage, { role: 'context' }> }) {
  useLocale()
  const [open, setOpen] = useState(false)
  const recall = message.contextRole === 'recall'
  const title = message.label === '提示词注入' ? t('transcript.context.system') : t(recall ? 'transcript.context.recall' : 'transcript.context.inject')
  const producerKey = message.producer == null ? undefined : PRODUCERS[message.producer]
  const producer = producerKey === undefined ? message.producer : t(producerKey)
  const changedFiles = message.summary === undefined ? null : /^(\d+) 个文件有改动$/u.exec(message.summary)
  const summary = changedFiles !== null ? t('transcript.context.changedFiles', { count: changedFiles[1] })
    : message.summary === '代码库有改动' ? t('transcript.context.changed') : message.summary
  const text = message.text.length > MAX_CHARS ? `${message.text.slice(0, MAX_CHARS)}\n${t('transcript.context.truncated', { count: message.text.length })}` : message.text
  return (
    <div className={css.root} data-citeciter-message={message.id} data-open={open ? '' : undefined}>
      <DisclosureRow
        icon={recall ? <ReferenceIconRegular kind="session" /> : <IconContextInjectionOutlineRegular size={14} />}
        title={title}
        open={open}
        expandable
        expandOnRowClick
        onToggle={() => setOpen(!open)}
        collapsedContent={<>
          {producer != null && producer !== '' && <><span className={css.sep} aria-hidden="true" /><span className={css.source}>{producer}</span></>}
          {summary !== undefined && <><span className={css.sep} aria-hidden="true" /><span className={css.summary}>{summary}</span></>}
        </>}
        keepContentWhenOpen
      >
        <pre className={css.body}>{text}</pre>
      </DisclosureRow>
    </div>
  )
}

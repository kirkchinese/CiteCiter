import { useState, type ReactNode } from 'react'
import { DisclosureRow, JsonTree } from '@deepseek-ai/dsh-client-ui-primitives'
import { IconQuestionOutlineMedium, IconSparkleMedium } from '../host-icons.ts'
import { jsonTreeLabels } from '../copy.ts'
import type { TopicMessage } from '../../topic.ts'
import type { NativeComposer } from '../native-composer.ts'
import { MessageAttachments } from './MessageAttachments.tsx'
import { questionReplySummary } from '../../question-reply.ts'
import css from './CiteCiter.module.css'

function compactPreview(text: string, limit = 120): string {
  const compact = text.replaceAll(/\s+/g, ' ').trim()
  return compact.length > limit ? compact.slice(0, limit) + '…' : compact
}

function jsonObject(text: string): object | unknown[] | null {
  try {
    const value: unknown = JSON.parse(text)
    return typeof value === 'object' && value !== null ? value as object | unknown[] : null
  } catch {
    // Plain text tool output is expected and is rendered without JSON parsing.
    return null
  }
}

function FlowDisclosure({
  icon,
  title,
  summary,
  running = false,
  children,
}: {
  readonly icon: ReactNode
  readonly title: string
  readonly summary: string
  readonly running?: boolean
  readonly children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <DisclosureRow
      className={css.flowDisclosure}
      rowClassName={running ? css.flowRowRunning : css.flowRow}
      icon={icon}
      title={title}
      open={open}
      expandable
      expandOnRowClick
      onToggle={() => setOpen(!open)}
      collapsedContent={<><span className={css.flowDot}>·</span><span className={css.flowSummary}>{summary}</span></>}
    >
      {children}
    </DisclosureRow>
  )
}

/** Show returned files immediately while keeping diagnostic arguments and results collapsible. */
export function ToolRow({ message, sessionId, load }: { readonly message: Extract<TopicMessage, { role: 'tool' }>, readonly sessionId: string, readonly load: NativeComposer['attachment'] }) {
  const args = jsonObject(message.arguments)
  const result = message.result === null ? null : jsonObject(message.result)
  const questionVerdict = message.name !== 'ask_user_question' ? null
    : message.interruptionOutcome === 'interrupted' ? '已中断'
      : !message.isError ? null
        : message.errorCode === 'ASK_CANCELLED' ? '已取消'
          : message.errorCode === 'ASK_ABORTED' ? '已中断' : null
  const verdict = message.isError && message.approvalOutcome === 'rejected' ? '已拒绝' : questionVerdict
  const running = message.running && message.questionReply === undefined && message.interruptionOutcome === undefined
  const summary = message.questionReply !== undefined ? compactPreview(questionReplySummary(message.questionReply))
    : running ? compactPreview(message.arguments)
    : verdict ?? (message.isError
      ? '调用失败'
      : compactPreview(message.result || ((message.attachments?.length ?? 0) > 0 ? '附件已返回' : '完成')))
  return (
    <div data-citeciter-message={message.id}>
      <FlowDisclosure
        icon={message.name === 'ask_user_question' ? <IconQuestionOutlineMedium /> : <IconSparkleMedium />}
        title={message.name}
        summary={summary}
        running={running}
      >
        <div className={css.toolPreview}>
          <strong>参数</strong>
          {args === null ? <pre>{message.arguments}</pre> : <JsonTree data={args} label="工具参数" copyable={false} labels={jsonTreeLabels} />}
          {message.result !== null && (
            <>
              <strong>{verdict !== null ? '状态' : message.isError ? '错误' : '结果'}</strong>
              {result === null
                ? <pre>{message.result}</pre>
                : <JsonTree data={result} label="工具结果" copyable={false} labels={jsonTreeLabels} />}
            </>
          )}
        </div>
      </FlowDisclosure>
      <MessageAttachments sessionId={sessionId} attachments={message.attachments ?? []} load={load} />
    </div>
  )
}

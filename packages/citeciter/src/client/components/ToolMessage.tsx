import { useState, type ReactNode } from 'react'
import {
  DiffBlock, DisclosureRow, IconBrowseOutlineRegular, IconCodeOutlineRegular,
  IconEditOutlineRegular, IconGlobeOutlineRegular, IconPlanOutlineRegular,
  IconQuestionOutlineRegular, IconSearchOutlineRegular, IconSparkleMedium,
  JsonTree, ReadBlock, SearchBlock, TerminalBlock,
} from '@deepseek-ai/dsh-client-ui-primitives'
import { diffBlockLabels, jsonTreeLabels, readBlockLabels, searchBlockLabels, terminalBlockLabels } from '../copy.ts'
import type { TopicMessage } from '../../topic.ts'
import type { NativeComposer } from '../native-composer.ts'
import { deriveQuestionReply, deriveToolCard, isShellTool, type ToolCard } from '../tool-cards.ts'
import { toolPresentation } from '../tool-presentation.ts'
import { MessageAttachments } from './MessageAttachments.tsx'
import { QuestionReplyBody } from './QuestionReplyBody.tsx'
import { RichAnswer } from './RichAnswer.tsx'
import css from './ToolMessage.module.css'

type ToolMessage = Extract<TopicMessage, { role: 'tool' }>

function jsonObject(text: string): object | unknown[] | null {
  try {
    const value: unknown = JSON.parse(text)
    return typeof value === 'object' && value !== null ? value as object | unknown[] : null
  } catch {
    // Plain text tool output is expected and is rendered without JSON parsing.
    return null
  }
}

function ToolIcon({ name }: { readonly name: string }) {
  if (name === 'ask_user_question') return <IconQuestionOutlineRegular />
  if (name === 'read' || name === 'read_document' || name === 'read_source_session' || name === 'read_image') return <IconBrowseOutlineRegular />
  if (name === 'edit' || name === 'write' || name === 'str_replace_editor' || name === 'blackboard_apply') return <IconEditOutlineRegular />
  if (name === 'grep' || name === 'glob' || name === 'search_document') return <IconSearchOutlineRegular />
  if (name === 'web_search' || name === 'web_fetch') return <IconGlobeOutlineRegular />
  if (name === 'todo_write' || name === 'learning_cards' || name === 'create_goal') return <IconPlanOutlineRegular />
  if (isShellTool(name) || name === 'run_code') return <IconCodeOutlineRegular />
  return <IconSparkleMedium />
}

function FlowDisclosure({ icon, title, summary, running, children }: {
  readonly icon: ReactNode
  readonly title: string
  readonly summary: string
  readonly running: boolean
  readonly children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  return <DisclosureRow
    className={css.flowDisclosure}
    rowClassName={css.flowRow}
    icon={icon}
    title={title}
    open={open}
    expandable
    expandOnRowClick
    running={running}
    onToggle={() => setOpen(!open)}
    collapsedContent={<><span className={css.flowDot}>·</span><span className={css.flowSummary}>{summary}</span></>}
  >{children}</DisclosureRow>
}

function GenericBody({ message }: { readonly message: ToolMessage }) {
  const args = jsonObject(message.arguments)
  const result = message.result === null ? null : jsonObject(message.result)
  return <div className={css.genericBody}>
    <strong>{message.name} · 参数</strong>
    {args === null ? <pre>{message.arguments}</pre> : <JsonTree data={args} label="工具参数" copyable={false} labels={jsonTreeLabels} />}
    {message.result !== null && <>
      <strong>{message.isError ? '错误' : '结果'}</strong>
      {result === null ? <pre>{message.result}</pre> : <JsonTree data={result} label="工具结果" copyable={false} labels={jsonTreeLabels} />}
    </>}
  </div>
}

function CardBody({ card }: { readonly card: ToolCard }) {
  switch (card.kind) {
    case 'read': return <ReadBlock label={card.label} lines={card.lines} totalLines={card.totalLines} lang={card.lang} labels={readBlockLabels} />
    case 'diff': return <DiffBlock diffs={card.diffs} labels={diffBlockLabels} />
    case 'terminal': return <TerminalBlock command={card.command} cwd={card.cwd} output={card.output}
      exitCode={card.exitCode} signal={card.signal} running={card.running} labels={terminalBlockLabels} />
    case 'search': return <>
      {card.shape === 'matches'
        ? <SearchBlock kind="matches" files={card.files} total={card.total} truncated={card.truncated} labels={searchBlockLabels} />
        : <SearchBlock kind="paths" paths={card.paths} total={card.total} truncated={card.truncated} labels={searchBlockLabels} />}
      {card.recovery !== undefined && <details className={css.recovery}><summary>查看完整工具输出</summary><pre>{card.recovery}</pre></details>}
    </>
  }
}

/** Keep a tool tree inside the parent's disclosure; absent metadata uses the original lossless inspector. */
export function ToolRow({ message, childCalls, sessionId, load }: {
  readonly message: ToolMessage
  readonly childCalls: readonly ToolMessage[]
  readonly sessionId: string
  readonly load: NativeComposer['attachment']
}) {
  const view = toolPresentation(message)
  const card = deriveToolCard(message)
  const reply = deriveQuestionReply(message)
  return <div data-citeciter-message={message.id}>
    <FlowDisclosure icon={<ToolIcon name={message.name} />} title={view.title} summary={view.summary} running={view.running}>
      <div className={css.toolBody}>
        {reply !== null ? <QuestionReplyBody reply={reply} />
          : message.name === 'workspace_changes' && message.result !== null && !message.isError
            ? <RichAnswer text={message.result} streaming={false} />
            : card !== null ? <CardBody card={card} /> : <GenericBody message={message} />}
        {childCalls.length > 0 && <div className={css.childCalls} aria-label="子工具调用">
          {childCalls.map(child => <ToolRow key={child.id} message={child} childCalls={[]} sessionId={sessionId} load={load} />)}
        </div>}
      </div>
    </FlowDisclosure>
    <MessageAttachments sessionId={sessionId} attachments={message.attachments ?? []} load={load} />
  </div>
}

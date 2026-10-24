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
import { deriveQuestionReply, deriveToolCard, isShellTool, parseWorkspaceDiff, type ToolCard } from '../tool-cards.ts'
import { toolPresentation } from '../tool-presentation.ts'
import { t, useLocale } from '../i18n.ts'
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
  useLocale()
  const args = jsonObject(message.arguments)
  const result = message.result === null ? null : jsonObject(message.result)
  return <div className={css.genericBody}>
    <strong>{message.name} · {t('transcript.tool.arguments')}</strong>
    {args === null ? <pre>{message.arguments}</pre> : <JsonTree data={args} label={t('transcript.tool.toolArguments')} copyable={false} labels={jsonTreeLabels()} />}
    {message.result !== null && <>
      <strong>{t(message.isError ? 'transcript.tool.error' : 'transcript.tool.result')}</strong>
      {result === null ? <pre>{message.result}</pre> : <JsonTree data={result} label={t('transcript.tool.toolResult')} copyable={false} labels={jsonTreeLabels()} />}
    </>}
  </div>
}

function CardBody({ card }: { readonly card: ToolCard }) {
  useLocale()
  switch (card.kind) {
    case 'read': return <ReadBlock label={card.label} lines={card.lines} totalLines={card.totalLines} lang={card.lang} labels={readBlockLabels()} />
    case 'diff': return <DiffBlock diffs={card.diffs} labels={diffBlockLabels()} />
    case 'terminal': return <TerminalBlock command={card.command} cwd={card.cwd} output={card.output}
      exitCode={card.exitCode} signal={card.signal} running={card.running} labels={terminalBlockLabels()} />
    case 'search': return <>
      {card.shape === 'matches'
        ? <SearchBlock kind="matches" files={card.files} total={card.total} truncated={card.truncated} labels={searchBlockLabels()} />
        : <SearchBlock kind="paths" paths={card.paths} total={card.total} truncated={card.truncated} labels={searchBlockLabels()} />}
      {card.recovery !== undefined && <details className={css.recovery}><summary>{t('transcript.tool.fullOutput')}</summary><pre>{card.recovery}</pre></details>}
    </>
  }
}

/** A codebase change result: its file list, then the changes as DSH's coloured diff. */
function WorkspaceChanges({ markdown }: { readonly markdown: string }) {
  useLocale()
  const parsed = parseWorkspaceDiff(markdown)
  if (parsed === null) return <RichAnswer text={markdown} streaming={false} />
  return <>
    {parsed.lead !== '' && <RichAnswer text={parsed.lead} streaming={false} />}
    <DiffBlock diffs={parsed.diffs} labels={diffBlockLabels()} />
    {parsed.tail !== '' && <RichAnswer text={parsed.tail} streaming={false} />}
  </>
}

/** The file a read or edit card is about, and the first line it showed. */
function cardFile(message: ToolMessage, card: ToolCard | null): { readonly path: string, readonly line?: number } | null {
  if (card?.kind === 'diff') return { path: card.path }
  if (card?.kind !== 'read') return null
  const args = jsonObject(message.arguments) as { readonly path?: unknown, readonly file_path?: unknown } | null
  const path = typeof args?.path === 'string' ? args.path : typeof args?.file_path === 'string' ? args.file_path : null
  const line = card.lines[0]?.number
  return path === null ? null : { path, ...(line === undefined ? {} : { line }) }
}

/** Keep a tool tree inside the parent's disclosure; absent metadata uses the original lossless inspector. */
export function ToolRow({ message, childCalls, sessionId, load, openFile }: {
  readonly message: ToolMessage
  readonly childCalls: readonly ToolMessage[]
  readonly sessionId: string
  readonly load: NativeComposer['attachment']
  /** Open a source-workspace file in DSH's right sidebar; absent when the host has none. */
  readonly openFile?: ((path: string, line?: number) => boolean) | undefined
}) {
  useLocale()
  const view = toolPresentation(message)
  const card = deriveToolCard(message)
  const reply = deriveQuestionReply(message)
  const file = openFile === undefined ? null : cardFile(message, card)
  return <div data-citeciter-message={message.id}>
    <FlowDisclosure icon={<ToolIcon name={message.name} />} title={view.title} summary={view.summary} running={view.running}>
      <div className={css.toolBody}>
        {file !== null && <button type="button" className={css.fileLink} title={t('transcript.tool.openSidebar')} onClick={() => openFile?.(file.path, file.line)}>{file.path}</button>}
        {reply !== null ? <QuestionReplyBody reply={reply} />
          : message.name === 'workspace_changes' && message.result !== null && !message.isError
            ? <WorkspaceChanges markdown={message.result} />
            : card !== null ? <CardBody card={card} /> : <GenericBody message={message} />}
        {childCalls.length > 0 && <div className={css.childCalls} aria-label={t('transcript.tool.childCalls')}>
          {childCalls.map(child => <ToolRow key={child.id} message={child} childCalls={[]} sessionId={sessionId} load={load} openFile={openFile} />)}
        </div>}
      </div>
    </FlowDisclosure>
    <MessageAttachments sessionId={sessionId} attachments={message.attachments ?? []} load={load} />
  </div>
}

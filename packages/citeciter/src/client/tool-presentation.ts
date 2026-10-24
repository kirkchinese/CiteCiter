import type { TopicMessage } from '../topic.ts'
import { questionReplySummary } from '../question-reply.ts'
import { t, type CiterKey } from './i18n.ts'
import { deriveQuestionReply, deriveToolCard, isShellTool } from './tool-cards.ts'

type ToolMessage = Extract<TopicMessage, { role: 'tool' }>

/** Titles for common tools; unknown tools keep their own names. */
const TITLES: Readonly<Record<string, CiterKey>> = {
  read_source_session: 'transcript.tool.readSource',
  read_document: 'transcript.tool.readDocument',
  search_document: 'transcript.tool.searchDocument',
  blackboard_apply: 'transcript.tool.updateBoard',
  blackboard_view: 'transcript.tool.viewBoard',
  blackboard_animate: 'transcript.tool.animateBoard',
  workspace_changes: 'transcript.tool.workspaceChanges',
  learning_cards: 'transcript.tool.learningCards',
  todo_write: 'transcript.tool.todo',
  ask_user_question: 'transcript.tool.ask',
  read: 'transcript.tool.read',
  write: 'transcript.tool.write',
  edit: 'transcript.tool.edit',
  str_replace_editor: 'transcript.tool.edit',
  grep: 'transcript.tool.search',
  glob: 'transcript.tool.search',
  web_search: 'transcript.tool.webSearch',
  web_fetch: 'transcript.tool.webFetch',
  run_code: 'transcript.tool.runCode',
  read_image: 'transcript.tool.readImage',
  view_image: 'transcript.tool.viewImage',
  codex_connect_image_generate: 'transcript.tool.generateImage',
}

/** Argument fields that best identify what a call worked on, in priority order. */
const SUBJECT_KEYS = ['path', 'file_path', 'filePath', 'pattern', 'query', 'url', 'prompt', 'title', 'description', 'command', 'cmd', 'code'] as const

function parse(text: string | null): unknown {
  if (text === null || text.trim() === '') return null
  try {
    return JSON.parse(text)
  } catch {
    // Plain-text arguments and results are expected; they are summarized as text.
    return text
  }
}

function fields(value: unknown): Readonly<Record<string, unknown>> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null
}

function compact(text: string, limit = 80): string {
  const single = text.replaceAll(/\s+/gu, ' ').trim()
  return single.length > limit ? `${single.slice(0, limit)}…` : single
}

function subject(args: Readonly<Record<string, unknown>> | null): string | null {
  for (const key of SUBJECT_KEYS) {
    const value = args?.[key]
    if (typeof value === 'string' && value.trim() !== '') return compact(value)
  }
  return null
}

function verdict(message: ToolMessage): string | null {
  if (message.interruptionOutcome === 'interrupted') return t('transcript.tool.interrupted')
  if (message.approvalOutcome === 'rejected') return t('transcript.tool.rejected')
  if (!message.isError) return null
  if (message.errorCode === 'ASK_CANCELLED') return t('transcript.tool.cancelled')
  if (message.errorCode === 'ASK_ABORTED') return t('transcript.tool.interrupted')
  return null
}

/** Result-based summaries for Citer's own tools; null falls back to the call's subject. */
function resultSummary(message: ToolMessage, args: Readonly<Record<string, unknown>> | null, result: unknown): string | null {
  const data = fields(result)
  switch (message.name) {
    case 'read_source_session': {
      // Older Topics recorded JSON event pages; current pages are Markdown with a cursor header.
      if (Array.isArray(data?.events)) return t('transcript.tool.records', { count: data.events.length }) + (data.hasMore === true ? t('transcript.tool.moreRecords') : '')
      const records = typeof result === 'string' ? /· (\d+) records ·/u.exec(result)?.[1] : undefined
      return records === undefined ? null : t('transcript.tool.records', { count: records }) + ((result as string).includes('\nMore source after seq ') ? t('transcript.tool.moreRecords') : '')
    }
    case 'read_document':
      return typeof data?.throughOffset === 'number' && typeof data.documentLength === 'number' && data.documentLength > 0
        ? t('transcript.tool.readPercent', { percent: Math.min(100, Math.round(data.throughOffset / data.documentLength * 100)) })
        : null
    case 'learning_cards':
      return Array.isArray(args?.cards) ? t('transcript.tool.cards', { count: args.cards.length }) : null
    case 'todo_write':
      return Array.isArray(args?.todos) ? t('transcript.tool.steps', { count: args.todos.length }) : null
    default:
      return null
  }
}

/** Title and one-line summary for a tool row; full arguments and result remain in its details. */
export function toolPresentation(message: ToolMessage): { readonly title: string, readonly summary: string, readonly running: boolean } {
  const key = TITLES[message.name]
  const title = isShellTool(message.name) ? t('transcript.tool.runCommand') : key === undefined ? message.name : t(key)
  const running = message.running && message.questionReply === undefined
    && message.interruptionOutcome === undefined && message.approvalOutcome === undefined
  const args = fields(parse(message.arguments))
  const about = isShellTool(message.name)
    ? subject(args === null ? null : { description: args.description, command: args.command ?? args.cmd })
    : subject(args)
  const reply = deriveQuestionReply(message)
  if (reply !== null) return { title, summary: message.questionReply === undefined
    ? t('transcript.tool.answered', { answered: reply.items.filter(item => item.values.length > 0).length, total: reply.items.length })
    : compact(questionReplySummary(reply)), running: false }
  const card = deriveToolCard(message)
  const cardSummary = card?.kind === 'diff' ? `${compact(card.path)}  +${card.added} −${card.removed}`
    : card?.kind === 'read' ? compact(card.label)
    : card?.kind === 'search' ? compact(String(args?.pattern ?? '')) : null
  if (running) return { title, summary: cardSummary ?? about ?? t('transcript.tool.running'), running }
  const withSubject = (outcome: string) => about === null ? outcome : `${about} · ${outcome}`
  const outcome = verdict(message)
  if (outcome !== null) return { title, summary: withSubject(outcome), running }
  const result = parse(message.result)
  if (message.isError || card?.kind === 'terminal' && (card.signal !== undefined || card.exitCode !== undefined && card.exitCode !== 0)) {
    const reason = typeof result === 'string' ? result : fields(result)?.message
    return { title, summary: withSubject(typeof reason === 'string' && reason.trim() !== ''
      ? t('transcript.tool.failedReason', { reason: compact(reason, 60) }) : card?.kind === 'terminal' && card.exitCode !== undefined
        ? t('transcript.tool.exitCode', { code: card.exitCode }) : t('transcript.tool.failed')), running }
  }
  const summary = resultSummary(message, args, result)
    ?? cardSummary
    ?? about
    ?? ((message.attachments?.length ?? 0) > 0 ? t('transcript.tool.attachments') : typeof result === 'string' ? compact(result) : t('transcript.tool.done'))
  return { title, summary, running }
}

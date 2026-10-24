import type { TopicMessage } from '../topic.ts'
import { questionReplySummary } from '../question-reply.ts'
import { deriveQuestionReply, deriveToolCard, isShellTool } from './tool-cards.ts'

type ToolMessage = Extract<TopicMessage, { role: 'tool' }>

/** Titles for tools Topics commonly use, worded like the host's tool rows; other tools keep their own name. */
const TITLES: Readonly<Record<string, string>> = {
  read_source_session: '读取来源对话',
  read_document: '读取文档',
  search_document: '搜索文档',
  blackboard_apply: '更新板书',
  blackboard_view: '查看板书',
  blackboard_animate: '编排板书动画',
  workspace_changes: '查看代码库变化',
  learning_cards: '整理学习卡',
  todo_write: '更新学习路线',
  ask_user_question: '提问',
  read: '读取',
  write: '写入',
  edit: '编辑',
  str_replace_editor: '编辑',
  grep: '搜索',
  glob: '搜索',
  web_search: '网页搜索',
  web_fetch: '网页获取',
  run_code: '运行代码',
  read_image: '读取图片',
  view_image: '查看图片',
  codex_connect_image_generate: '生成图片',
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
  if (message.interruptionOutcome === 'interrupted') return '已中断'
  if (message.approvalOutcome === 'rejected') return '已拒绝'
  if (!message.isError) return null
  if (message.errorCode === 'ASK_CANCELLED') return '已取消'
  if (message.errorCode === 'ASK_ABORTED') return '已中断'
  return null
}

/** Result-based summaries for Citer's own tools; null falls back to the call's subject. */
function resultSummary(message: ToolMessage, args: Readonly<Record<string, unknown>> | null, result: unknown): string | null {
  const data = fields(result)
  switch (message.name) {
    case 'read_source_session': {
      // Older Topics recorded JSON event pages; current pages are Markdown with a cursor header.
      if (Array.isArray(data?.events)) return `${data.events.length} 条记录${data.hasMore === true ? '，还有更多' : ''}`
      const records = typeof result === 'string' ? /· (\d+) records ·/u.exec(result)?.[1] : undefined
      return records === undefined ? null : `${records} 条记录${(result as string).includes('\nMore source after seq ') ? '，还有更多' : ''}`
    }
    case 'read_document':
      return typeof data?.throughOffset === 'number' && typeof data.documentLength === 'number' && data.documentLength > 0
        ? `读到 ${Math.min(100, Math.round(data.throughOffset / data.documentLength * 100))}%`
        : null
    case 'learning_cards':
      return Array.isArray(args?.cards) ? `${args.cards.length} 张` : null
    case 'todo_write':
      return Array.isArray(args?.todos) ? `${args.todos.length} 步` : null
    default:
      return null
  }
}

/**
 * Title and one-line summary for a tool row. The full arguments and result stay in its details.
 * @returns a readable title, the summary shown after it, and whether the call is still running.
 */
export function toolPresentation(message: ToolMessage): { readonly title: string, readonly summary: string, readonly running: boolean } {
  const title = isShellTool(message.name) ? '运行命令' : TITLES[message.name] ?? message.name
  const running = message.running && message.questionReply === undefined
    && message.interruptionOutcome === undefined && message.approvalOutcome === undefined
  const args = fields(parse(message.arguments))
  const about = isShellTool(message.name)
    ? subject(args === null ? null : { description: args.description, command: args.command ?? args.cmd })
    : subject(args)
  const reply = deriveQuestionReply(message)
  if (reply !== null) return { title, summary: message.questionReply === undefined
    ? `${reply.items.filter(item => item.values.length > 0).length}/${reply.items.length} 已回答`
    : compact(questionReplySummary(reply)), running: false }
  const card = deriveToolCard(message)
  const cardSummary = card?.kind === 'diff' ? `${compact(card.path)}  +${card.added} −${card.removed}`
    : card?.kind === 'read' ? compact(card.label)
    : card?.kind === 'search' ? compact(String(args?.pattern ?? '')) : null
  if (running) return { title, summary: cardSummary ?? about ?? '进行中…', running }
  // Like DSH's rows, a failed or interrupted call keeps its own title and states the outcome after its subject.
  const withSubject = (outcome: string) => about === null ? outcome : `${about} · ${outcome}`
  const outcome = verdict(message)
  if (outcome !== null) return { title, summary: withSubject(outcome), running }
  const result = parse(message.result)
  if (message.isError || card?.kind === 'terminal' && (card.signal !== undefined || card.exitCode !== undefined && card.exitCode !== 0)) {
    const reason = typeof result === 'string' ? result : fields(result)?.message
    return { title, summary: withSubject(typeof reason === 'string' && reason.trim() !== ''
      ? `失败：${compact(reason, 60)}` : card?.kind === 'terminal' && card.exitCode !== undefined
        ? `退出码 ${card.exitCode}` : '失败'), running }
  }
  const summary = resultSummary(message, args, result)
    ?? cardSummary
    ?? about
    ?? ((message.attachments?.length ?? 0) > 0 ? '已返回附件' : typeof result === 'string' ? compact(result) : '完成')
  return { title, summary, running }
}

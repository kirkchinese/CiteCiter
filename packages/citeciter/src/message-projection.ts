import type { ContentBlock } from '@deepseek-ai/dsh-llm'
import type { SessionEvent } from '@deepseek-ai/dsh-session'

/** Producer kind of messages Citer appends itself; mirrors `CITER_CONTEXT_KIND` without importing Host-only modules. */
const CITER_KIND = 'plugin:@kirkchinese/dsh-citeciter'
const CITER_LABELS: Readonly<Record<string, string>> = {
  'source-window': '来源摘录',
  'workspace-changes': '代码库变化',
}
/** Readable names of DSH's own context producers; anything else shows its plugin package or source kind. */
const PRODUCER_LABELS: Readonly<Record<string, string>> = {
  'system-prompt': '系统提示词',
  'runtime-context': '运行环境',
  'time-context': '时间',
  'instructions': '项目说明',
  'skills': '技能目录',
}

interface ContextSource { kind: string; plugin?: string; form?: unknown; citer?: unknown; summary?: unknown; [field: string]: unknown }
interface ContextMessage { id: string; content: readonly ContentBlock[]; source: ContextSource }

/** Projected presentation of one logged non-user message, following DSH's context producer model. */
export interface ContextPresentation extends ContextMessage {
  /** Row title. */
  label: string
  /** `recall` for material lifted out of another session, `inject` for every other producer. */
  contextRole: 'inject' | 'recall'
  /** Producer named by the durable source, or null when it carries no readable kind. */
  producer: string | null
  /** One-line account a `notice` records for its collapsed row. */
  summary?: string
}

/** Citer's own form of a message it appended: the `citer` field, or the legacy `form` of earlier versions. */
export function citerMessageForm(source: { readonly kind: string } & Record<string, unknown>): string | undefined {
  if (source.kind !== CITER_KIND) return undefined
  if (typeof source['citer'] === 'string') return source['citer']
  return typeof source['form'] === 'string' && source['form'] in CITER_LABELS ? source['form'] : undefined
}

function producerName(source: ContextSource): string | null {
  if (typeof source.plugin === 'string' && source.plugin !== '') return PRODUCER_LABELS[source.plugin.replace(/^@deepseek-ai\/dsh-/u, '')] ?? source.plugin
  if (typeof source.kind !== 'string' || source.kind === '') return null
  if (source.kind.startsWith('plugin:')) return source.kind.slice('plugin:'.length)
  return PRODUCER_LABELS[source.kind] ?? source.kind
}

/** Project the installed SDK's validated log. 0.1.7 split plugin context into developer/message. */
export function contextMessage(event: SessionEvent): ContextPresentation | undefined {
  let message: ContextMessage
  const type: string = event.type
  if (type === 'developer/message') message = (event.data as unknown as { message: ContextMessage }).message
  else if (event.type === 'user/message' && event.data.source.kind !== 'user') message = event.data as unknown as ContextMessage
  else return undefined
  const form = citerMessageForm(message.source)
  const citer = form === undefined ? undefined : CITER_LABELS[form]
  const system = message.source.kind === 'system-prompt' || message.source.plugin === '@deepseek-ai/dsh-system-prompt'
  const recall = message.source.form === 'recall' || form === 'source-window'
  // Notices from earlier Citer versions recorded no summary.
  const summary = typeof message.source.summary === 'string' && message.source.summary !== '' ? message.source.summary
    : form === 'workspace-changes' ? '代码库有改动' : undefined
  return {
    ...message,
    label: system ? '提示词注入' : recall ? '上下文召回' : '上下文注入',
    contextRole: recall ? 'recall' : 'inject',
    producer: citer ?? producerName(message.source),
    ...(summary === undefined ? {} : { summary }),
  }
}

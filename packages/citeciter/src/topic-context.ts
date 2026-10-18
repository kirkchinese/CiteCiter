/**
 * Per-turn context Citer appends to a Topic before its first step: an optional source excerpt
 * and a workspace change notice. Both are logged as sourced user messages, so model input
 * stays reconstructable from the Topic log.
 */
import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-agent-loop'
import { createUserMessage, type UserMessage } from '@deepseek-ai/dsh-llm'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type { ObserverSourceSnapshot } from './observer.ts'
import { formatSourceTranscript, sourceWindowStart } from './source-transcript.ts'
import { renderFileList, renderWorkspaceNotice, WORKSPACE_CHANGES_TOOL, type WorkspaceChangeMode, type WorkspaceSnapshots } from './workspace-changes.ts'

/** Producer kind of every message Citer itself appends to a Topic (DSH format v4 `plugin:<package>`). */
export const CITER_CONTEXT_KIND = 'plugin:@kirkchinese/dsh-citeciter'
/** System prompt section describing workspace notices and their tool. */
export const WORKSPACE_SECTION_NAME = '@kirkchinese/dsh-citeciter:workspace'

/** Byte budget of one automatic source excerpt. */
export const SOURCE_WINDOW_BYTES = 24 * 1024
/** Byte budget for patches inside one workspace notice in diff mode. */
export const WORKSPACE_NOTICE_PATCH_BYTES = 16 * 1024
const WORKSPACE_TOOL_BYTES = 64 * 1024
const NOTICE_PATCH_FILES = 30

/** Static guidance; the changes themselves arrive as per-turn context messages. */
export const WORKSPACE_PROMPT = `Before your first step in a turn, Citer may add a "Workspace changes" context message listing files that changed in this Topic's git working tree since your previous turn began, with line counts and sometimes diffs. It is background awareness, not a request: mention or act on it only when it bears on the user's current request, and never assume a file's current content from a summary. Call ${WORKSPACE_CHANGES_TOOL} to read line-level diffs since your previous turn began, optionally limited to paths; read files directly when you need their full current content.`

/** Text of one Citer-produced context message, or undefined for other messages. */
export function citerContextForm(source: { readonly kind: string } & Record<string, unknown>): string | undefined {
  return source.kind === CITER_CONTEXT_KIND && typeof source['form'] === 'string' ? source['form'] : undefined
}

/** The last source seq an automatic excerpt in this Topic log covered. */
export function lastSourceWindowSeq(events: readonly SessionEvent[]): number | null {
  let last: number | null = null
  for (const event of events) {
    if (event.type !== 'user/message') continue
    const source = event.data.source as { readonly kind: string } & Record<string, unknown>
    if (citerContextForm(source) !== 'source-window') continue
    const through = source['throughSeq']
    if (typeof through === 'number' && Number.isSafeInteger(through)) last = through
  }
  return last
}

function contextMessage(form: string, text: string, extra: Record<string, number> = {}): UserMessage {
  return createUserMessage({
    content: [{ type: 'text', text }],
    // Extra source fields are preserved by the session format and carry the excerpt cursor.
    source: { kind: CITER_CONTEXT_KIND, form, ...extra } as unknown as UserMessage['source'],
  })
}

/**
 * Compose an automatic source excerpt: the records leading to a cited anchor, the newest records,
 * or the records added since the previous excerpt.
 * @returns the message, or null when there is nothing new.
 */
export function composeSourceWindow(source: ObserverSourceSnapshot, options: { readonly includeReasoning: boolean, readonly anchorSeq: number | null, readonly afterSeq: number | null }): UserMessage | null {
  const sourceMaxSeq = source.events.at(-1)?.seq ?? null
  if (sourceMaxSeq === null || (options.afterSeq !== null && sourceMaxSeq <= options.afterSeq)) return null
  const fromSeq = sourceWindowStart(source, {
    includeReasoning: options.includeReasoning,
    maxBytes: SOURCE_WINDOW_BYTES,
    ...(options.afterSeq !== null ? { afterSeq: options.afterSeq } : options.anchorSeq !== null ? { endSeq: options.anchorSeq } : {}),
  })
  const page = formatSourceTranscript(source, { fromSeq, includeReasoning: options.includeReasoning, maxBytes: Math.floor(SOURCE_WINDOW_BYTES * 1.25), detail: 'compact' })
  if (page.records === 0 || page.capturedThroughSeq === null) return null
  const scope = options.afterSeq !== null
    ? `Source records added since the previous automatic excerpt (which ended at seq ${options.afterSeq})`
    : options.anchorSeq !== null ? `Source records leading to the cited location (seq ${options.anchorSeq})` : 'The most recent source records'
  const gap = options.afterSeq !== null && fromSeq > options.afterSeq + 1 ? ` Records seq ${options.afterSeq + 1}–${fromSeq - 1} did not fit; read them with read_source_session if needed.` : ''
  const text = `# Source excerpt (automatic)\n${scope}. Citer added this because automatic source reading is on; read_source_session reads any other range.${gap}\n\n${page.markdown}`
  return contextMessage('source-window', text, { throughSeq: page.capturedThroughSeq })
}

/** Dependencies the per-turn context needs from the Topic runtime. */
export interface TopicContextOptions {
  readonly agent: Agent
  readonly autoReadSource: () => boolean
  readonly workspaceMode: () => WorkspaceChangeMode
  readonly includeReasoning: () => boolean
  /** Whether the user has sent the source address, in the log or in this step's pending messages; reads are refused otherwise. */
  readonly sourceSent: (pending: readonly UserMessage[]) => boolean
  readonly readSource: (signal: AbortSignal) => Promise<ObserverSourceSnapshot>
  readonly anchorSeq: number | null
  /** Null when the Topic has no working directory. */
  readonly workspace: WorkspaceSnapshots | null
  readonly warn: (message: string, error: unknown) => void
}

async function workspaceNotice(options: TopicContextOptions, mode: WorkspaceChangeMode, signal: AbortSignal): Promise<UserMessage | null> {
  if (options.workspace === null || mode === 'off') return null
  const advance = await options.workspace.advance(Date.now(), signal)
  if (advance === null || advance.files === null || advance.files.length === 0 || advance.elapsedMs === null) return null
  const { previousTree, tree, root } = advance.state
  let patches: Map<string, string> | undefined
  if (mode === 'diff' && previousTree !== null) {
    patches = new Map()
    for (const file of advance.files.filter(file => file.added !== null).slice(0, NOTICE_PATCH_FILES)) {
      patches.set(file.path, await options.workspace.filePatch(previousTree, tree, file.path, signal))
    }
  }
  const text = renderWorkspaceNotice({ elapsedMs: advance.elapsedMs, root, files: advance.files, ...(patches === undefined ? {} : { patches, budgetBytes: WORKSPACE_NOTICE_PATCH_BYTES }) })
  return contextMessage('workspace-changes', text)
}

/**
 * Append Citer's per-turn context to one Topic Agent. The listener delegates first, adds messages
 * only when the step is entered, and never fails the turn because a context source is unavailable.
 */
export function attachTopicContext(agentCtx: Context, options: TopicContextOptions): void {
  agentCtx.on('agent/pre-step', async ({ agent, step, signal }, next) => {
    const decision = await next()
    if (decision.kind === 'reject' || signal.aborted || agent !== options.agent || step !== 1) return decision
    const added: UserMessage[] = []
    if (options.autoReadSource() && options.sourceSent(decision.messages)) {
      try {
        const source = await options.readSource(signal)
        const message = composeSourceWindow(source, {
          includeReasoning: options.includeReasoning(),
          anchorSeq: options.anchorSeq,
          afterSeq: lastSourceWindowSeq(agent.session.snapshotEvents()),
        })
        if (message !== null) added.push(message)
      } catch (error) {
        if (signal.aborted) return decision
        options.warn('Citer could not add the automatic source excerpt', error)
      }
    }
    try {
      const notice = await workspaceNotice(options, options.workspaceMode(), signal)
      if (notice !== null) added.push(notice)
    } catch (error) {
      if (signal.aborted) return decision
      options.warn('Citer could not compute workspace changes', error)
    }
    return added.length === 0 ? decision : { ...decision, messages: [...decision.messages, ...added] }
  }, { prepend: true })
}

/**
 * The `workspace_changes` tool: line-level diffs since the previous turn began, against the live tree.
 * @param workspace - this Topic's snapshot store.
 */
export function createWorkspaceChangesTool(workspace: WorkspaceSnapshots) {
  return defineTool({
    name: WORKSPACE_CHANGES_TOOL,
    description: 'Read line-level diffs of this Topic\'s git working tree since your previous turn began (or since this turn began, in a first turn), up to now, including uncommitted changes. Optionally limit to repository-relative paths. Returns a file list and unified diffs within a 64 KiB budget.',
    parameters: {
      paths: { type: 'array', items: { type: 'string' }, description: 'Optional repository-relative files or directories. Omit for all changes.' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: { markdown: { type: 'string', required: true }, files: { type: 'integer', required: true } } },
      render: (_args, value) => [{ type: 'text', text: value.markdown }],
      presentationMeta: (_args, value) => ({ files: value.files }),
    },
    execute: async (args, exec) => {
      const paths = (args.paths ?? []).filter(path => path.trim() !== '').slice(0, 50)
      let result = await workspace.live(paths, exec.signal)
      if (result === null) {
        const started = await workspace.advance(Date.now(), exec.signal)
        if (started === null) return { markdown: 'This Topic\'s working directory is not inside a git work tree, so Citer cannot track its changes.', files: 0 }
        result = await workspace.live(paths, exec.signal)
        if (result === null) return { markdown: 'Workspace tracking has just started; there are no recorded changes yet.', files: 0 }
      }
      if (result.files.length === 0) return { markdown: `No changes${paths.length === 0 ? '' : ` under ${paths.join(', ')}`} since ${new Date(result.baseTime).toISOString()}.`, files: 0 }
      let patch = result.patch
      let note = ''
      if (Buffer.byteLength(patch, 'utf8') > WORKSPACE_TOOL_BYTES) {
        patch = Buffer.from(patch, 'utf8').subarray(0, WORKSPACE_TOOL_BYTES).toString('utf8').replace(/\uFFFD$/u, '')
        note = '\n\nThe diff was cut at the 64 KiB budget; call again with fewer paths for the rest.'
      }
      let longest = 0
      for (const run of patch.matchAll(/`+/gu)) longest = Math.max(longest, run[0].length)
      const marks = '`'.repeat(Math.max(3, longest + 1))
      return {
        markdown: `Changes since ${new Date(result.baseTime).toISOString()}, up to now:\n\n${renderFileList(result.files)}\n\n${marks}diff\n${patch.replace(/\n$/u, '')}\n${marks}${note}`,
        files: result.files.length,
      }
    },
    presentCall: () => ({ card: 'generic', title: '查看代码库变化' }),
    presentResult: (_args, result) => ({ card: 'generic', title: result.isError ? '读取代码库变化失败' : '已读取代码库变化' }),
  })
}

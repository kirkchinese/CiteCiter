import type { DiffHunk, ReadBlockLine, SearchFileGroup } from '@deepseek-ai/dsh-client-ui-primitives'
import type { TopicMessage } from '../topic.ts'
import type { QuestionReply } from '../question-reply.ts'

type ToolMessage = Extract<TopicMessage, { role: 'tool' }>
type Fields = Readonly<Record<string, unknown>>

export type ToolCard =
  | { readonly kind: 'read', readonly label: string, readonly lines: readonly ReadBlockLine[], readonly totalLines: number, readonly lang?: string }
  | { readonly kind: 'diff', readonly diffs: DiffHunk[], readonly added: number, readonly removed: number, readonly path: string }
  | { readonly kind: 'terminal', readonly command: string, readonly cwd?: string, readonly output?: string, readonly exitCode?: number | null, readonly signal?: string, readonly running: boolean }
  | { readonly kind: 'search', readonly shape: 'matches', readonly files: SearchFileGroup[], readonly total: number, readonly truncated: boolean, readonly recovery?: string }
  | { readonly kind: 'search', readonly shape: 'paths', readonly paths: string[], readonly total: number, readonly truncated: boolean, readonly recovery?: string }

function fields(value: unknown): Fields | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Fields : null
}

function argumentsOf(message: ToolMessage): Fields | null {
  try { return fields(JSON.parse(message.arguments) as unknown) }
  catch { return null }
}

function positive(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
}

function nonnegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

function nonempty(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

function validPath(args: Fields): string | null {
  const path = args.file_path ?? args.path
  return nonempty(path) ? path : null
}

/** Render a recorded read window only when its lines and model-facing envelope agree. */
export function deriveReadCard(message: ToolMessage): Extract<ToolCard, { kind: 'read' }> | null {
  if (message.name !== 'read' || message.isError || message.running || message.result === null) return null
  const args = argumentsOf(message)
  const meta = fields(message.meta)
  if (args === null || meta === null || validPath(args) === null
    || args.offset !== undefined && !positive(args.offset)
    || args.limit !== undefined && !positive(args.limit)
    || !nonempty(meta.path) || !positive(meta.offset) || !nonnegative(meta.totalLines)
    || !Array.isArray(meta.lines) || meta.lang !== undefined && typeof meta.lang !== 'string') return null
  const envelope = /^<path>([^\n]*)<\/path>\n<type>file<\/type>\n<content>\n[\s\S]*\n<\/content>$/u.exec(message.result)
  if (envelope === null || envelope[1] !== meta.path) return null
  const lines: ReadBlockLine[] = []
  let previous = meta.offset - 1
  for (const raw of meta.lines) {
    const line = fields(raw)
    if (line === null || !positive(line.number) || line.number <= previous
      || line.number > meta.totalLines || typeof line.text !== 'string') return null
    lines.push({ number: line.number, text: line.text })
    previous = line.number
  }
  // The authored path is relative in most Topic calls; never fabricate a workspace root.
  return { kind: 'read', label: validPath(args)!, lines, totalLines: meta.totalLines,
    ...(typeof meta.lang === 'string' ? { lang: meta.lang } : {}) }
}

function intendedDiff(name: string, args: Fields): DiffHunk | null {
  const path = validPath(args)
  if (path === null) return null
  if (name === 'write') return typeof args.content === 'string'
    ? { path, oldText: null, newText: args.content } : null
  if (name === 'edit') {
    if (typeof args.old_string !== 'string' || typeof args.new_string !== 'string'
      || args.replace_all !== undefined && typeof args.replace_all !== 'boolean') return null
    return { path, oldText: args.old_string || null, newText: args.new_string }
  }
  if (name === 'str_replace_editor') {
    if (args.command === 'create' && typeof args.file_text === 'string')
      return { path, oldText: null, newText: args.file_text }
    if (args.command === 'str_replace' && typeof args.old_str === 'string' && typeof args.new_str === 'string')
      return { path, oldText: args.old_str, newText: args.new_str }
  }
  return null
}

function appliedDiffs(meta: Fields, intended: DiffHunk): DiffHunk[] | null {
  if (!Array.isArray(meta.diffs) || meta.diffs.length === 0) return null
  const diffs: DiffHunk[] = []
  for (const raw of meta.diffs) {
    const diff = fields(raw)
    if (diff === null || !nonempty(diff.path)
      || diff.oldText !== null && typeof diff.oldText !== 'string'
      || typeof diff.newText !== 'string') return null
    diffs.push({ path: diff.path === meta.path ? intended.path : diff.path,
      oldText: diff.oldText, newText: diff.newText })
  }
  return diffs
}

/** Prefer the applied metadata hunks; an unconfirmed settled edit stays generic. */
export function deriveDiffCard(message: ToolMessage): Extract<ToolCard, { kind: 'diff' }> | null {
  if (!['edit', 'write', 'str_replace_editor'].includes(message.name) || message.isError
    || message.approvalOutcome === 'rejected' || message.interruptionOutcome === 'interrupted') return null
  const args = argumentsOf(message)
  const intended = args === null ? null : intendedDiff(message.name, args)
  if (intended === null) return null
  let diffs: DiffHunk[] = [intended]
  if (!message.running) {
    if (message.result === null) return null
    if (message.name === 'str_replace_editor') return null
    const meta = fields(message.meta)
    if (message.meta !== undefined && meta === null
      || meta?.diffs !== undefined && !Array.isArray(meta.diffs)) return null
    const applied = meta === null ? null : appliedDiffs(meta, intended)
    if (Array.isArray(meta?.diffs) && meta.diffs.length > 0 && applied === null) return null
    if (applied !== null) diffs = applied
    else if (message.name !== 'write') return null
  }
  const { added, removed } = lineTotals(diffs)
  return { kind: 'diff', diffs, added, removed, path: intended.path }
}

/**
 * Added and removed line counts for the row summary: the lines left after the common leading and
 * trailing lines of each hunk. Exact for one contiguous edit, which is what edit tools record; the
 * expanded DiffBlock shows the precise diff.
 */
export function lineTotals(diffs: readonly DiffHunk[]): { added: number, removed: number } {
  let added = 0
  let removed = 0
  for (const diff of diffs) {
    // A final newline ends the last line rather than starting an empty one.
    const lines = (text: string) => text === '' ? [] : text.replace(/\n$/u, '').split('\n')
    const before = diff.oldText === null ? [] : lines(diff.oldText)
    const after = lines(diff.newText)
    let start = 0
    while (start < before.length && start < after.length && before[start] === after[start]) start++
    let end = 0
    while (end < before.length - start && end < after.length - start && before[before.length - 1 - end] === after[after.length - 1 - end]) end++
    removed += before.length - start - end
    added += after.length - start - end
  }
  return { added, removed }
}

/**
 * Turn the unified diff in a `workspace_changes` result into DiffBlock hunks: each `@@` hunk becomes
 * its old and new text, context lines on both sides. Returns null when the result carries no diff.
 * @param markdown - the tool's Markdown result: a file list, then one fenced `diff` block.
 * @returns the text before and after the fence and the hunks, or null.
 */
export function parseWorkspaceDiff(markdown: string): { readonly lead: string, readonly diffs: DiffHunk[], readonly tail: string } | null {
  const fence = /^(`{3,})diff\n([\s\S]*?)\n\1$/mu.exec(markdown)
  if (fence === null) return null
  const diffs: DiffHunk[] = []
  let path: string | null = null
  let hunk: { old: string[], next: string[] } | null = null
  const close = () => {
    if (hunk !== null && path !== null) diffs.push({ path, oldText: hunk.old.join('\n'), newText: hunk.next.join('\n') })
    hunk = null
  }
  for (const line of fence[2]!.split('\n')) {
    const file = /^diff --git a\/(.+) b\/(.+)$/u.exec(line)
    if (file !== null) { close(); path = file[2]!; continue }
    if (line.startsWith('@@')) { close(); hunk = { old: [], next: [] }; continue }
    if (hunk === null || line.startsWith('\\')) continue
    const current: { old: string[], next: string[] } = hunk
    if (line.startsWith('+')) current.next.push(line.slice(1))
    else if (line.startsWith('-')) current.old.push(line.slice(1))
    else { current.old.push(line.slice(1)); current.next.push(line.slice(1)) }
  }
  close()
  return diffs.length === 0 ? null : { lead: markdown.slice(0, fence.index).trim(), diffs, tail: markdown.slice(fence.index + fence[0].length).trim() }
}

/** Shell aliases share a terminal view, but run_code remains a parent tool tree. */
export function isShellTool(name: string): boolean {
  return /(?:^|[._/-])(?:bash|pwsh|powershell|shell|run_command|execute_command)$/iu.test(name)
}

/** Parse exit markers without ever treating the marker as command output. */
export function deriveTerminalCard(message: ToolMessage): Extract<ToolCard, { kind: 'terminal' }> | null {
  if (!isShellTool(message.name) || message.approvalOutcome === 'rejected') return null
  const args = argumentsOf(message)
  const command = args?.command ?? args?.cmd
  if (args === null || !nonempty(command)
    || args.description !== undefined && !nonempty(args.description)
    || args.workdir !== undefined && typeof args.workdir !== 'string'
    || args.run_in_background !== undefined && typeof args.run_in_background !== 'boolean') return null
  const meta = message.meta === undefined ? null : fields(message.meta)
  if (message.meta !== undefined && meta === null
    || meta?.cwd !== undefined && typeof meta.cwd !== 'string'
    || meta?.exitCode !== undefined && meta.exitCode !== null && !Number.isSafeInteger(meta.exitCode)
    || meta?.exit_code !== undefined && meta.exit_code !== null && !Number.isSafeInteger(meta.exit_code)
    || meta?.signal !== undefined && typeof meta.signal !== 'string') return null
  const cwd = typeof meta?.cwd === 'string' ? meta.cwd : typeof args.workdir === 'string' ? args.workdir : undefined
  if (message.running && message.interruptionOutcome === undefined) return { kind: 'terminal', command, ...(cwd === undefined ? {} : { cwd }), running: true }
  // An interrupted command still shows what was run; failures show their error text as output.
  if (message.result === null) return message.interruptionOutcome === 'interrupted' ? { kind: 'terminal', command, ...(cwd === undefined ? {} : { cwd }), running: false } : null
  let output = message.result
  let exitCode: number | null | undefined
  let signal: string | undefined
  const killed = /\n\[killed by signal: ([^\]\n]+)\]$/u.exec(output)
  const exited = /\n\[exit code: (-?\d+|null)\]$/u.exec(output)
  if (killed !== null) { output = output.slice(0, killed.index); signal = killed[1] }
  else if (exited !== null) {
    const code = exited[1] === 'null' ? null : Number(exited[1])
    if (code !== null && !Number.isSafeInteger(code)) return null
    output = output.slice(0, exited.index)
    exitCode = code
  }
  const recordedCode = meta?.exitCode !== undefined ? meta.exitCode : meta?.exit_code
  if (recordedCode === null || typeof recordedCode === 'number' && Number.isSafeInteger(recordedCode)) exitCode = recordedCode
  if (typeof meta?.signal === 'string') signal = meta.signal
  return { kind: 'terminal', command, ...(cwd === undefined ? {} : { cwd }), output,
    ...(exitCode === undefined ? {} : { exitCode }), ...(signal === undefined ? {} : { signal }), running: false }
}

/** Validate retained search hits and counts before passing them to SearchBlock. */
export function deriveSearchCard(message: ToolMessage): Extract<ToolCard, { kind: 'search' }> | null {
  if (message.isError || message.running || message.result === null || !['grep', 'glob'].includes(message.name)) return null
  const args = argumentsOf(message)
  const meta = fields(message.meta)
  if (args === null || meta === null || !nonempty(args.pattern)
    || args.path !== undefined && !nonempty(args.path)
    || message.name === 'grep' && args.include !== undefined && !nonempty(args.include)
    || typeof meta.truncated !== 'boolean' || !nonnegative(meta.total)) return null
  const common = { kind: 'search' as const, total: meta.total, truncated: meta.truncated,
    ...(meta.truncated ? { recovery: message.result } : {}) }
  if (message.name === 'glob') {
    if (meta.shape !== 'paths' || !Array.isArray(meta.paths) || !meta.paths.every(path => typeof path === 'string')) return null
    return { ...common, shape: 'paths', paths: [...meta.paths] }
  }
  if (meta.shape !== 'matches' || !Array.isArray(meta.files)) return null
  const files: SearchFileGroup[] = []
  for (const raw of meta.files) {
    const file = fields(raw)
    if (file === null || !nonempty(file.path) || !Array.isArray(file.matches)) return null
    const matches: SearchFileGroup['matches'][number][] = []
    for (const rawMatch of file.matches) {
      const match = fields(rawMatch)
      if (match === null || !positive(match.lineNumber) || typeof match.line !== 'string') return null
      matches.push({ lineNumber: match.lineNumber, line: match.line })
    }
    files.push({ path: file.path, matches })
  }
  return { ...common, shape: 'matches', files }
}

/** Reconstruct ordinary completed question choices when there is no late-reply projection. */
export function deriveQuestionReply(message: ToolMessage): QuestionReply | null {
  if (message.questionReply !== undefined) return message.questionReply
  if (message.name !== 'ask_user_question' || message.result === null || message.running || message.isError) return null
  const args = argumentsOf(message)
  let result: Fields | null
  try { result = fields(JSON.parse(message.result) as unknown) }
  catch { return null }
  if (!Array.isArray(args?.questions) || !Array.isArray(result?.answers)) return null
  const answers = new Map<string, string[]>()
  for (const raw of result.answers) {
    const answer = fields(raw)
    if (answer === null || !nonempty(answer.id) || !Array.isArray(answer.selected)
      || !answer.selected.every(value => typeof value === 'string')
      || answer.custom !== undefined && typeof answer.custom !== 'string'
      || answers.has(answer.id)) return null
    answers.set(answer.id, [...answer.selected, ...(nonempty(answer.custom) ? [answer.custom] : [])])
  }
  const items: QuestionReply['items'][number][] = []
  const seen = new Set<string>()
  for (const raw of args.questions) {
    const question = fields(raw)
    if (question === null || !nonempty(question.id) || !nonempty(question.question)
      || question.header !== undefined && typeof question.header !== 'string'
      || seen.has(question.id) || !answers.has(question.id)) return null
    seen.add(question.id)
    items.push({ id: question.id, question: question.question,
      ...(typeof question.header === 'string' ? { header: question.header } : {}), values: answers.get(question.id)! })
  }
  return items.length === 0 || answers.size !== items.length ? null : { callId: message.id, items }
}

/** Select one shared primitive, or null for the lossless generic tool inspector. */
export function deriveToolCard(message: ToolMessage): ToolCard | null {
  return deriveReadCard(message) ?? deriveDiffCard(message) ?? deriveTerminalCard(message) ?? deriveSearchCard(message)
}

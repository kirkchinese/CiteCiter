/**
 * Line-level workspace change tracking for a Topic, using a Citer-owned git object store.
 * Snapshots stage the working tree into a private index and object directory whose
 * alternates point at the repository's objects, so the repository itself is never written.
 */
import { execFile } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { delimiter, isAbsolute, join, resolve } from 'node:path'
import { atomicReplace } from './atomic-replace.ts'

/** How the per-turn workspace notice reports changes. */
export type WorkspaceChangeMode = 'off' | 'summary' | 'diff'

/** One changed path between two snapshots. */
export interface WorkspaceFileChange {
  readonly path: string
  readonly status: 'added' | 'modified' | 'deleted' | 'changed'
  /** Added and deleted line counts; null for binary files. */
  readonly added: number | null
  readonly deleted: number | null
}

/** Persisted snapshot cursor of one Topic. */
export interface WorkspaceSnapshotState {
  readonly version: 1
  readonly root: string
  /** Tree recorded when the latest turn began. */
  readonly tree: string
  readonly time: number
  /** Tree recorded when the turn before it began; null before the second turn. */
  readonly previousTree: string | null
  readonly previousTime: number | null
}

/** Result of advancing the snapshot at the start of a turn. */
export interface WorkspaceAdvance {
  readonly state: WorkspaceSnapshotState
  /** Changes since the previous snapshot; null on the first snapshot. */
  readonly files: readonly WorkspaceFileChange[] | null
  readonly elapsedMs: number | null
}

const STATE_FILE = 'state.json'
const GIT_TIMEOUT_MS = 60_000
const GIT_MAX_BUFFER = 64 * 1024 * 1024
const TREE_PATTERN = /^[0-9a-f]{40,64}$/u
const locks = new Map<string, Promise<unknown>>()

function serialize<T>(key: string, operation: () => Promise<T>): Promise<T> {
  const previous = locks.get(key) ?? Promise.resolve()
  const next = previous.catch(() => undefined).then(operation)
  locks.set(key, next)
  void next.finally(() => { if (locks.get(key) === next) locks.delete(key) }).catch(() => { /* The caller observes the same failure. */ })
  return next
}

function git(args: readonly string[], options: { readonly cwd: string, readonly env?: NodeJS.ProcessEnv, readonly signal?: AbortSignal }): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    execFile('git', ['-c', 'core.fsmonitor=false', '-c', 'core.quotepath=false', ...args], {
      cwd: options.cwd,
      env: options.env ?? process.env,
      encoding: 'utf8',
      maxBuffer: GIT_MAX_BUFFER,
      timeout: GIT_TIMEOUT_MS,
      windowsHide: true,
      ...(options.signal === undefined ? {} : { signal: options.signal }),
    }, (error, stdout, stderr) => {
      if (error !== null) reject(new Error(`git ${args[0]} failed: ${stderr.trim() || error.message}`, { cause: error }))
      else resolvePromise(stdout)
    })
  })
}

/** Parse the persisted cursor field by field; anything malformed means no snapshot. */
export function readWorkspaceState(raw: unknown): WorkspaceSnapshotState | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null
  const value = raw as Record<string, unknown>
  const tree = value['tree']
  const previousTree = value['previousTree']
  const time = value['time']
  const previousTime = value['previousTime']
  if (value['version'] !== 1 || typeof value['root'] !== 'string' || typeof tree !== 'string' || !TREE_PATTERN.test(tree)) return null
  if (typeof time !== 'number' || !Number.isFinite(time)) return null
  if (previousTree !== null && (typeof previousTree !== 'string' || !TREE_PATTERN.test(previousTree))) return null
  if (previousTime !== null && (typeof previousTime !== 'number' || !Number.isFinite(previousTime))) return null
  return { version: 1, root: value['root'], tree, time, previousTree, previousTime }
}

/** Parse `git diff --numstat -z` and `--name-status -z` output (without rename detection). */
export function parseWorkspaceChanges(numstat: string, nameStatus: string): WorkspaceFileChange[] {
  const statuses = new Map<string, WorkspaceFileChange['status']>()
  const parts = nameStatus.split('\0')
  for (let index = 0; index + 1 < parts.length; index += 2) {
    const code = parts[index]!
    const path = parts[index + 1]!
    if (code === '' || path === '') continue
    statuses.set(path, code.startsWith('A') ? 'added' : code.startsWith('D') ? 'deleted' : code.startsWith('M') ? 'modified' : 'changed')
  }
  const files: WorkspaceFileChange[] = []
  for (const record of numstat.split('\0')) {
    const match = /^(\d+|-)\t(\d+|-)\t(.+)$/su.exec(record)
    if (match === null) continue
    const path = match[3]!
    files.push({
      path,
      status: statuses.get(path) ?? 'changed',
      added: match[1] === '-' ? null : Number(match[1]),
      deleted: match[2] === '-' ? null : Number(match[2]),
    })
  }
  return files
}

/** Snapshots of one Topic's working directory, stored under a Citer-owned directory. */
export class WorkspaceSnapshots {
  /**
   * @param directory - Citer-owned directory for the private index, objects and cursor.
   * @param cwd - the Topic's working directory inside a git work tree.
   */
  constructor(private readonly directory: string, private readonly cwd: string) {}

  private async repository(signal?: AbortSignal): Promise<{ readonly root: string, readonly objects: string } | null> {
    if (this.cwd === '' || !isAbsolute(this.cwd)) return null
    let root: string
    let common: string
    try {
      root = (await git(['rev-parse', '--show-toplevel'], { cwd: this.cwd, ...(signal === undefined ? {} : { signal }) })).trim()
      common = (await git(['rev-parse', '--git-common-dir'], { cwd: this.cwd, ...(signal === undefined ? {} : { signal }) })).trim()
    } catch (error) {
      signal?.throwIfAborted()
      if (error instanceof Error && /ENOENT|not a git repository/iu.test(`${error.message} ${String(error.cause)}`)) return null
      throw error
    }
    if (root === '' || common === '') return null
    return { root: resolve(root), objects: join(resolve(this.cwd, common), 'objects') }
  }

  private environment(objects: string): NodeJS.ProcessEnv {
    const env: NodeJS.ProcessEnv = { ...process.env }
    for (const key of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY', 'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_NAMESPACE']) delete env[key]
    return {
      ...env,
      GIT_INDEX_FILE: join(this.directory, 'index'),
      GIT_OBJECT_DIRECTORY: join(this.directory, 'objects'),
      GIT_ALTERNATE_OBJECT_DIRECTORIES: objects,
      GIT_OPTIONAL_LOCKS: '0',
    }
  }

  private async stage(signal?: AbortSignal): Promise<{ readonly root: string, readonly tree: string, readonly env: NodeJS.ProcessEnv } | null> {
    const repository = await this.repository(signal)
    if (repository === null) return null
    await mkdir(join(this.directory, 'objects'), { recursive: true, mode: 0o700 })
    if (repository.objects.includes(delimiter)) throw new Error('repository object path contains the path delimiter')
    const env = this.environment(repository.objects)
    const options = { cwd: repository.root, env, ...(signal === undefined ? {} : { signal }) }
    await git(['add', '--all', '--', '.'], options)
    const tree = (await git(['write-tree'], options)).trim()
    if (!TREE_PATTERN.test(tree)) throw new Error('git write-tree returned an invalid tree id')
    return { root: repository.root, tree, env }
  }

  /** Read the persisted cursor, or null before the first snapshot. */
  async state(): Promise<WorkspaceSnapshotState | null> {
    let raw: string
    try { raw = await readFile(join(this.directory, STATE_FILE), 'utf8') }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
      throw error
    }
    try { return readWorkspaceState(JSON.parse(raw)) }
    catch { return null } // A torn or foreign cursor restarts tracking instead of failing the turn.
  }

  private async save(state: WorkspaceSnapshotState): Promise<void> {
    const destination = join(this.directory, STATE_FILE)
    const temporary = `${destination}.${process.pid}.${Date.now()}.tmp`
    await writeFile(temporary, `${JSON.stringify(state)}\n`, { mode: 0o600 })
    await atomicReplace(temporary, destination)
  }

  private async changes(env: NodeJS.ProcessEnv, root: string, from: string, to: string, signal?: AbortSignal): Promise<WorkspaceFileChange[]> {
    const options = { cwd: root, env, ...(signal === undefined ? {} : { signal }) }
    const [numstat, nameStatus] = await Promise.all([
      git(['diff', '--no-renames', '--numstat', '-z', from, to], options),
      git(['diff', '--no-renames', '--name-status', '-z', from, to], options),
    ])
    return parseWorkspaceChanges(numstat, nameStatus)
  }

  /**
   * Record a new snapshot at the start of a turn and report what changed since the previous one.
   * @param now - snapshot time.
   * @returns the new cursor and changes, or null outside a git work tree.
   */
  advance(now: number, signal?: AbortSignal): Promise<WorkspaceAdvance | null> {
    return serialize(this.directory, async () => {
      const staged = await this.stage(signal)
      if (staged === null) return null
      const previous = await this.state()
      const usable = previous !== null && previous.root === staged.root ? previous : null
      const files = usable === null ? null : await this.changes(staged.env, staged.root, usable.tree, staged.tree, signal)
      const state: WorkspaceSnapshotState = {
        version: 1, root: staged.root, tree: staged.tree, time: now,
        previousTree: usable?.tree ?? null, previousTime: usable?.time ?? null,
      }
      await this.save(state)
      return { state, files, elapsedMs: usable === null ? null : Math.max(0, now - usable.time) }
    })
  }

  /**
   * Diff the snapshot taken when the previous turn began (or this turn, before a previous one exists) against the live working tree.
   * @param paths - optional repository-relative paths to restrict the patch.
   * @returns changed files and their unified patches, or null when nothing has been recorded.
   */
  live(paths: readonly string[], signal?: AbortSignal): Promise<{ readonly baseTime: number, readonly files: readonly WorkspaceFileChange[], readonly patch: string } | null> {
    return serialize(this.directory, async () => {
      const state = await this.state()
      if (state === null) return null
      const staged = await this.stage(signal)
      if (staged === null || staged.root !== state.root) return null
      const base = state.previousTree ?? state.tree
      const options = { cwd: staged.root, env: staged.env, ...(signal === undefined ? {} : { signal }) }
      const scope = paths.length === 0 ? [] : ['--', ...paths]
      const files = (await this.changes(staged.env, staged.root, base, staged.tree, signal))
        .filter(file => paths.length === 0 || paths.some(path => file.path === path || file.path.startsWith(`${path.replace(/\/+$/u, '')}/`)))
      const patch = files.length === 0 ? '' : await git(['diff', '--no-renames', '--no-color', '--unified=2', base, staged.tree, ...scope], options)
      return { baseTime: state.previousTree === null ? state.time : state.previousTime ?? state.time, files, patch }
    })
  }

  /** Unified patch of one path between two recorded trees. */
  filePatch(from: string, to: string, path: string, signal?: AbortSignal): Promise<string> {
    return serialize(this.directory, async () => {
      const repository = await this.repository(signal)
      if (repository === null) return ''
      return git(['diff', '--no-renames', '--no-color', '--unified=2', from, to, '--', path], { cwd: repository.root, env: this.environment(repository.objects), ...(signal === undefined ? {} : { signal }) })
    })
  }
}

/** Human-readable elapsed time such as "2h 13m" or "45s". */
export function formatElapsed(ms: number): string {
  const seconds = Math.round(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 48) return `${hours}h ${minutes % 60}m`
  return `${Math.floor(hours / 24)}d ${hours % 24}h`
}

function lineCounts(file: WorkspaceFileChange): string {
  if (file.added === null || file.deleted === null) return 'binary'
  return [file.added > 0 ? `+${file.added}` : '', file.deleted > 0 ? `−${file.deleted}` : ''].filter(Boolean).join(' ') || 'no line changes'
}

const STATUS_CODE: Readonly<Record<WorkspaceFileChange['status'], string>> = { added: 'A', modified: 'M', deleted: 'D', changed: 'T' }
const LISTED_FILES = 60

/** Markdown list of changed files with a total line count. */
export function renderFileList(files: readonly WorkspaceFileChange[]): string {
  const added = files.reduce((sum, file) => sum + (file.added ?? 0), 0)
  const deleted = files.reduce((sum, file) => sum + (file.deleted ?? 0), 0)
  const listed = files.slice(0, LISTED_FILES).map(file => `- ${STATUS_CODE[file.status]} ${file.path} (${lineCounts(file)})`)
  if (files.length > LISTED_FILES) listed.push(`- … and ${files.length - LISTED_FILES} more files`)
  return [`${files.length} file${files.length === 1 ? '' : 's'} changed (+${added} −${deleted}):`, ...listed].join('\n')
}

function fenced(text: string): string {
  let longest = 0
  for (const run of text.matchAll(/`+/gu)) longest = Math.max(longest, run[0].length)
  const marks = '`'.repeat(Math.max(3, longest + 1))
  return `${marks}diff\n${text.replace(/\n$/u, '')}\n${marks}`
}

/** Name of the model tool that reads workspace changes. */
export const WORKSPACE_CHANGES_TOOL = 'workspace_changes'

/**
 * Compose the per-turn workspace notice injected before the first step of a turn.
 * @param input - elapsed time, repository root, changed files, per-file patches (diff mode) and byte budget.
 * @returns the Markdown notice.
 */
export function renderWorkspaceNotice(input: {
  readonly elapsedMs: number
  readonly root: string
  readonly files: readonly WorkspaceFileChange[]
  readonly patches?: ReadonlyMap<string, string>
  readonly budgetBytes?: number
}): string {
  const lines = [
    `# Workspace changes · ${formatElapsed(input.elapsedMs)} since your previous turn began`,
    `Repository ${input.root}, git working tree including uncommitted changes. Edits made during your previous turn, by you or anyone else, are included. This is context, not a request.`,
    '',
    renderFileList(input.files),
  ]
  if (input.patches === undefined) {
    lines.push('', `Call ${WORKSPACE_CHANGES_TOOL} (optionally with paths) to read line-level diffs when they matter for the current request.`)
    return lines.join('\n')
  }
  const budget = input.budgetBytes ?? 16 * 1024
  let used = 0
  const skipped: string[] = []
  for (const file of input.files) {
    const patch = input.patches.get(file.path)
    if (patch === undefined || patch.trim() === '') continue
    const section = `\n## ${file.path}\n${fenced(patch)}`
    const size = Buffer.byteLength(section, 'utf8')
    if (used + size > budget) { skipped.push(file.path); continue }
    lines.push(section)
    used += size
  }
  if (skipped.length > 0) lines.push('', `Not shown within the notice budget: ${skipped.slice(0, 20).join(', ')}${skipped.length > 20 ? ', …' : ''}. Call ${WORKSPACE_CHANGES_TOOL} with paths to read them.`)
  return lines.join('\n')
}

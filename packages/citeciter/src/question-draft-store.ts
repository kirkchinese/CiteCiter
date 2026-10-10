import { createHash, randomUUID } from 'node:crypto'
import { lstat, mkdir, readFile, readdir, realpath, rmdir, unlink, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { atomicReplace } from './atomic-replace.ts'
import { EMPTY_QUESTION_DRAFT_STATE, questionDraftKeySchema, questionDraftRecordSchema, type QuestionDraftRecord, type QuestionDraftState } from './question-draft-contract.ts'

function absent(error: unknown): boolean { return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT' }
function filename(key: string): string { return `${createHash('sha256').update(questionDraftKeySchema.parse(key)).digest('hex')}.json` }

/** Caller serializes all operations with Topic admission/deletion and verifies ownership of the Topic directory. */
export class QuestionDraftStore {
  constructor(private readonly topicDirectory: string) {}

  private async directory(create = false): Promise<string | undefined> {
    const topic = await realpath(this.topicDirectory)
    if ((await lstat(this.topicDirectory)).isSymbolicLink()) throw new Error('Citer 拒绝链接问题草稿目录')
    const directory = resolve(topic, 'question-drafts')
    const info = await lstat(directory).catch(error => { if (absent(error)) return undefined; throw error })
    if (info === undefined) {
      if (!create) return undefined
      await mkdir(directory, { mode: 0o700 })
    } else if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('Citer 问题草稿目录必须是普通目录')
    return directory
  }

  private async file(directory: string, name: string): Promise<string> {
    const file = resolve(directory, name)
    const info = await lstat(file).catch(error => { if (absent(error)) return undefined; throw error })
    if (info !== undefined && (!info.isFile() || info.isSymbolicLink())) throw new Error('Citer 问题草稿文件必须是普通文件')
    return file
  }

  private async readIfPresent(key: string): Promise<QuestionDraftRecord | undefined> {
    const name = filename(key)
    const directory = await this.directory()
    const raw = directory === undefined ? undefined : await readFile(await this.file(directory, name), 'utf8').catch(error => { if (absent(error)) return undefined; throw error })
    if (raw === undefined) return undefined
    const record = questionDraftRecordSchema.parse(JSON.parse(raw))
    if (record.key !== key) throw new Error('Citer 问题草稿身份不匹配')
    return record
  }

  /** Read validated data bound to the exact key. Corrupt records remain intact and surface an error. */
  async read(key: string): Promise<QuestionDraftRecord> {
    return await this.readIfPresent(key) ?? { key, closed: false, state: EMPTY_QUESTION_DRAFT_STATE }
  }

  /** Register a real blocking call before any edit, preserving every existing draft and its CAS revision. */
  async registerBlocking(key: string): Promise<QuestionDraftRecord> {
    const current = await this.readIfPresent(key)
    if (current !== undefined) return current
    const record: QuestionDraftRecord = { key, closed: false, blocking: true, state: EMPTY_QUESTION_DRAFT_STATE }
    await this.write(record)
    return record
  }

  /** List only validated records for restart reconciliation; unknown files are never consumed as drafts. */
  async records(): Promise<QuestionDraftRecord[]> {
    const directory = await this.directory()
    if (directory === undefined) return []
    const records: QuestionDraftRecord[] = []
    for (const name of await readdir(directory)) {
      if (!/^[a-f\d]{64}\.json$/u.test(name)) continue
      const record = questionDraftRecordSchema.parse(JSON.parse(await readFile(await this.file(directory, name), 'utf8')))
      if (filename(record.key) !== name) throw new Error('Citer 问题草稿文件身份不匹配')
      records.push(record)
    }
    return records
  }

  private async write(record: QuestionDraftRecord): Promise<void> {
    const validated = questionDraftRecordSchema.parse(record)
    const directory = (await this.directory(true))!
    const temporary = await this.file(directory, `${randomUUID()}.tmp`)
    await writeFile(temporary, JSON.stringify(validated) + '\n', { flag: 'wx', mode: 0o600 })
    try { await atomicReplace(temporary, await this.file(directory, filename(record.key))) }
    finally { await unlink(temporary).catch(error => { if (!absent(error)) throw error }) }
  }

  /** CAS returns the authoritative record on conflict; a closed record never accepts another save. */
  async save(key: string, next: QuestionDraftState, blocking?: boolean): Promise<{ state: QuestionDraftState, conflict: boolean, closed: boolean }> {
    const current = await this.read(key)
    if (current.closed || current.state.revision !== next.revision) return { state: current.state, conflict: true, closed: current.closed }
    const state = { ...next, revision: next.revision + 1 }
    await this.write({ ...current, key, closed: false, state, ...(blocking === undefined ? {} : { blocking }) })
    return { state, conflict: false, closed: false }
  }

  /**
   * Check the submitting window's saved revision inside the same Topic admission
   * operation that accepts its answer. A separate preflight GET cannot prevent a race.
   * @param expectedRevision - the saved version, or undefined for a legacy caller without a draft protocol.
   * Legacy callers are accepted only when this exact key has no persisted record.
   * @returns the authoritative conflict/closed record, or undefined when admission may proceed.
   */
  async checkSubmission(key: string, expectedRevision: number | undefined): Promise<{ state: QuestionDraftState, conflict: boolean, closed: boolean } | undefined> {
    const persisted = await this.readIfPresent(key)
    if (expectedRevision === undefined) return persisted === undefined ? undefined : { state: persisted.state, conflict: true, closed: persisted.closed }
    const current = persisted ?? { key, closed: false, state: EMPTY_QUESTION_DRAFT_STATE }
    return current.closed || current.state.revision !== expectedRevision
      ? { state: current.state, conflict: true, closed: current.closed }
      : undefined
  }

  /** Called only after an exact Host admission or terminal outcome, never on timeout or Client disposal. */
  async close(key: string, onlyExisting = false): Promise<QuestionDraftRecord> {
    const persisted = await this.readIfPresent(key)
    const current = persisted ?? { key, closed: false, state: EMPTY_QUESTION_DRAFT_STATE }
    if (current.closed || (onlyExisting && persisted === undefined)) return current
    const record: QuestionDraftRecord = { ...current, key, closed: true, state: { ...EMPTY_QUESTION_DRAFT_STATE, revision: current.state.revision + 1 } }
    await this.write(record)
    return record
  }

  /** Permanently remove only recognized ordinary files after the owning Topic is retired. */
  async remove(): Promise<void> {
    const directory = await this.directory()
    if (directory === undefined) return
    const files = await readdir(directory)
    for (const name of files) {
      if (!/^(?:[a-f\d]{64}\.json|[a-f\d-]{36}\.tmp)$/u.test(name)) throw new Error('问题草稿目录包含未识别文件，已保留')
      await this.file(directory, name)
    }
    for (const name of files) await unlink(await this.file(directory, name))
    await rmdir(directory)
  }
}

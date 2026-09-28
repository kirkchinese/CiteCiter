import { randomUUID } from 'node:crypto'
import { lstat, mkdir, open, readFile, readdir, realpath, rename, rmdir, unlink, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { atomicReplace } from './atomic-replace.ts'
import { DRAFT_CHUNK_BYTES, EMPTY_DRAFT_STATE, draftFileSchema, draftStateSchema, subtractSubmitted, type DraftFile, type DraftState } from './draft-contract.ts'

function absent(error: unknown): boolean { return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT' }

/** Caller serializes with Topic deletion and supplies an ownership-verified Topic directory. No model log is touched. */
export class DraftStore {
  constructor(private readonly topicDirectory: string) {}

  private async directory(create = false): Promise<string | undefined> {
    const topic = await realpath(this.topicDirectory)
    if ((await lstat(this.topicDirectory)).isSymbolicLink()) throw new Error('Citer 拒绝链接草稿目录')
    const directory = resolve(topic, 'draft')
    const info = await lstat(directory).catch(error => { if (absent(error)) return undefined; throw error })
    if (info === undefined) {
      if (!create) return undefined
      await mkdir(directory, { mode: 0o700 })
    } else if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('Citer 草稿目录必须是普通目录')
    return directory
  }

  private async file(directory: string, name: string): Promise<string> {
    const file = resolve(directory, name)
    const info = await lstat(file).catch(error => { if (absent(error)) return undefined; throw error })
    if (info !== undefined && (!info.isFile() || info.isSymbolicLink())) throw new Error('Citer 草稿文件必须是普通文件')
    return file
  }

  /** Read validated state. Missing drafts are empty; malformed drafts remain on disk and surface an error. */
  async read(): Promise<DraftState> {
    const directory = await this.directory()
    if (directory === undefined) return EMPTY_DRAFT_STATE
    const raw = await readFile(await this.file(directory, 'state.json'), 'utf8').catch(error => { if (absent(error)) return undefined; throw error })
    return raw === undefined ? EMPTY_DRAFT_STATE : draftStateSchema.parse(JSON.parse(raw))
  }

  /** Compare-and-swap state; conflict returns the authoritative draft without overwriting either client's input. */
  async save(expected: number, next: Omit<DraftState, 'revision'>): Promise<{ state: DraftState, conflict: boolean }> {
    const current = await this.read()
    if (current.revision !== expected) return { state: current, conflict: true }
    const directory = (await this.directory(true))!
    for (const meta of [...next.content.files, ...(next.pending?.content.files ?? [])]) {
      const file = await this.file(directory, `${meta.id}.bin`)
      if ((await lstat(file)).size !== meta.size) throw new Error(`草稿附件未完整保存：${meta.name}`)
      const saved = draftFileSchema.parse(JSON.parse(await readFile(await this.file(directory, `${meta.id}.json`), 'utf8')))
      if (JSON.stringify(saved) !== JSON.stringify(meta)) throw new Error('草稿附件身份不匹配')
    }
    const state = draftStateSchema.parse({ ...next, revision: expected + 1 })
    const temporary = await this.file(directory, `${randomUUID()}.tmp`)
    await writeFile(temporary, JSON.stringify(state) + '\n', { flag: 'wx', mode: 0o600 })
    try { await atomicReplace(temporary, await this.file(directory, 'state.json')) }
    finally { await unlink(temporary).catch(error => { if (!absent(error)) throw error }) }
    // Only remove previously referenced files. In-progress uploads from another client stay intact.
    const keep = new Set([...state.content.files, ...(state.pending?.content.files ?? [])].map(file => file.id))
    for (const file of [...current.content.files, ...(current.pending?.content.files ?? [])]) {
      if (keep.has(file.id)) continue
      for (const suffix of ['bin', 'json']) await unlink(await this.file(directory, `${file.id}.${suffix}`)).catch(error => { if (!absent(error)) throw error })
    }
    return { state, conflict: false }
  }

  /** Reconcile an exact native admission receipt after a lost response or restart. */
  async acknowledge(state: DraftState): Promise<DraftState> {
    if (state.pending === null) return state
    return (await this.save(state.revision, { version: 1, content: subtractSubmitted(state.content, state.pending.content), pending: null })).state
  }

  /** Sequential bounded upload. Repeated identical chunks are safe after a lost response. */
  async put(meta: DraftFile, offset: number, data: string): Promise<void> {
    const bytes = Buffer.from(data, 'base64')
    if (bytes.length > DRAFT_CHUNK_BYTES || offset + bytes.length > meta.size || (bytes.length === 0 && meta.size !== 0)) throw new Error('草稿附件分片无效')
    const directory = (await this.directory(true))!
    const complete = await this.file(directory, `${meta.id}.bin`)
    const exists = await lstat(complete).catch(error => { if (absent(error)) return undefined; throw error })
    const target = exists === undefined ? await this.file(directory, `${meta.id}.part`) : complete
    const handle = await open(target, exists === undefined && offset === 0 ? 'a+' : 'r+')
    try {
      const size = (await handle.stat()).size
      if (offset < size || exists !== undefined) {
        const previous = Buffer.alloc(bytes.length)
        const result = await handle.read(previous, 0, previous.length, offset)
        if (result.bytesRead !== bytes.length || !previous.equals(bytes)) throw new Error('草稿附件重复分片内容不一致')
      } else {
        if (offset !== size) throw new Error('草稿附件分片顺序不一致')
        await handle.write(bytes, 0, bytes.length, offset)
      }
      if ((await handle.stat()).size !== offset + bytes.length && exists === undefined && offset + bytes.length === meta.size) throw new Error('草稿附件长度不一致')
    } finally { await handle.close() }
    if (exists === undefined && offset + bytes.length === meta.size) {
      await rename(target, complete)
    }
    if (offset + bytes.length === meta.size) {
      const descriptor = await this.file(directory, `${meta.id}.json`)
      const saved = await readFile(descriptor, 'utf8').catch(error => { if (absent(error)) return undefined; throw error })
      if (saved === undefined) await writeFile(descriptor, JSON.stringify(meta) + '\n', { flag: 'wx', mode: 0o600 })
      else if (JSON.stringify(draftFileSchema.parse(JSON.parse(saved))) !== JSON.stringify(meta)) throw new Error('草稿附件描述不一致')
    }
  }

  /** Read only an attachment referenced by this exact saved draft, never an arbitrary path. */
  async chunk(id: string, offset: number): Promise<string> {
    const state = await this.read()
    const meta = [...state.content.files, ...(state.pending?.content.files ?? [])].find(file => file.id === id)
    if (meta === undefined || offset > meta.size) throw new Error('此文件未被当前草稿引用')
    const directory = (await this.directory())!
    const handle = await open(await this.file(directory, `${id}.bin`), 'r')
    try {
      if ((await handle.stat()).size !== meta.size) throw new Error(`草稿附件损坏：${meta.name}`)
      const bytes = Buffer.alloc(Math.min(DRAFT_CHUNK_BYTES, meta.size - offset))
      const { bytesRead } = await handle.read(bytes, 0, bytes.length, offset)
      if (bytesRead !== bytes.length) throw new Error('草稿附件读取不完整')
      return bytes.toString('base64')
    } finally { await handle.close() }
  }

  /** Delete only the verified draft subtree after the Topic is retired. */
  async remove(): Promise<void> {
    const directory = await this.directory()
    if (directory === undefined) return
    const files = await readdir(directory)
    for (const name of files) {
      if (name !== 'state.json' && !/^[a-f\d-]{36}\.(?:bin|json|part|tmp)$/u.test(name)) throw new Error('草稿目录包含未识别文件，已保留')
      await this.file(directory, name)
    }
    for (const name of files) await unlink(await this.file(directory, name))
    await rmdir(directory)
  }
}

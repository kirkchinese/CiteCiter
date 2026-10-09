import { lstat, mkdir, readFile, realpath } from 'node:fs/promises'
import { resolve } from 'node:path'
import { z } from 'zod'

const sessionIdentity = z.string().regex(/^citeciter-[a-zA-Z0-9-]+$/u).max(200)
const receiptSchema = z.object({
  version: z.literal(1),
  sourceSessionId: z.string().min(1),
  topicId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  sessionId: sessionIdentity,
  cleanup: z.enum(['pending', 'complete']),
}).strict()

/** Minimal deletion evidence; never retains a Topic's content, attachment or Session header. */
export type TopicDeletionReceipt = z.infer<typeof receiptSchema>
type AtomicJsonWriter = (path: string, value: unknown) => Promise<void>

function absent(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT'
}

/** Store exact identities below an already owned source root, independently of numeric Topic directories. */
export class TopicDeletionReceipts {
  /** @param writeJson - the owner's atomic JSON writer; no Host services or log writer are involved. */
  constructor(private readonly writeJson: AtomicJsonWriter) {}

  private async directory(root: string, create: boolean): Promise<string | undefined> {
    const rootInfo = await lstat(root).catch(error => { if (absent(error) && !create) return undefined; throw error })
    if (rootInfo === undefined) return undefined
    if (!rootInfo.isDirectory() || rootInfo.isSymbolicLink()) throw new Error('Citer 删除回执的来源根必须是普通目录')
    const canonicalRoot = await realpath(root)
    const directory = resolve(canonicalRoot, 'deleted')
    if (create) await mkdir(directory, { mode: 0o700 }).catch(error => {
      if (!(typeof error === 'object' && error !== null && 'code' in error && error.code === 'EEXIST')) throw error
    })
    const info = await lstat(directory).catch(error => { if (absent(error)) return undefined; throw error })
    if (info === undefined) return undefined
    if (!info.isDirectory() || info.isSymbolicLink() || await realpath(directory) !== directory) {
      throw new Error('Citer 拒绝读取或写入链接形式的删除回执目录')
    }
    return directory
  }

  /**
   * Read one exact receipt from a known Citer-owned source root.
   * @param root - canonical source/citeciter root.
   * @param sourceSessionId - source identity supplied by the owner, never derived from receipt data.
   * @param sessionId - exact generated Topic identity; no arbitrary path segments are accepted.
   * @returns verified evidence, or undefined only when the receipt does not exist.
   * Malformed, linked or identity-mismatched artifacts fail visibly and never imply deletion.
   */
  async read(root: string, sourceSessionId: string, sessionId: string): Promise<TopicDeletionReceipt | undefined> {
    const identity = sessionIdentity.parse(sessionId)
    const directory = await this.directory(root, false)
    if (directory === undefined) return undefined
    const path = resolve(directory, `${identity}.json`)
    const info = await lstat(path).catch(error => { if (absent(error)) return undefined; throw error })
    if (info === undefined) return undefined
    if (!info.isFile() || info.isSymbolicLink() || info.size > 8192) throw new Error('Citer 删除回执不是有效的普通文件')
    const content = await readFile(path, 'utf8').catch(error => { if (absent(error)) return undefined; throw error })
    if (content === undefined) return undefined
    const receipt = receiptSchema.parse(JSON.parse(content))
    if (receipt.sessionId !== identity || receipt.sourceSessionId !== sourceSessionId) throw new Error('Citer 删除回执与来源或 Topic 身份不匹配')
    return receipt
  }

  /**
   * Commit completed deletion evidence before the owner removes its recovery marker.
   * @param root - existing owned source root; this method never creates a source Session.
   * @param receipt - completed exact identity, with no content-bearing metadata.
   * @returns after atomic publication, or when the identical receipt was already committed.
   */
  async complete(root: string, receipt: TopicDeletionReceipt & { cleanup: 'complete' }): Promise<void> {
    const previous = await this.read(root, receipt.sourceSessionId, receipt.sessionId)
    if (previous !== undefined) {
      if (previous.topicId !== receipt.topicId) throw new Error('Citer 删除回执中的 Topic 编号发生冲突')
      if (previous.cleanup === 'complete') return
    }
    const directory = await this.directory(root, true)
    if (directory === undefined) throw new Error('Citer 删除回执目录不可用')
    await this.writeJson(resolve(directory, `${sessionIdentity.parse(receipt.sessionId)}.json`), receipt)
  }
}

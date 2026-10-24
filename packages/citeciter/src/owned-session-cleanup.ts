import { chmod, lstat, readdir, realpath, rmdir, unlink } from 'node:fs/promises'
import { isAbsolute, relative, resolve } from 'node:path'

function contained(root: string, path: string): void {
  const part = relative(root, path)
  if (part === '' || part.startsWith('..') || isAbsolute(part)) throw new Error('Citer 拒绝清理自有 Session 目录之外的路径')
}

async function removeFile(file: string): Promise<void> {
  try {
    await unlink(file)
  } catch (error) {
    // Git writes loose objects read-only; Windows refuses to unlink those until they are writable.
    if ((error as NodeJS.ErrnoException).code !== 'EPERM' && (error as NodeJS.ErrnoException).code !== 'EACCES') throw error
    await chmod(file, 0o600)
    await unlink(file)
  }
}

/**
 * Delete one private subtree of a retired Topic directory without following links.
 * @param topicDirectory - the Topic's owned directory; the caller verified its source ownership marker.
 * @param name - `sessions` (the private Session backend, including child Agents) or `workspace` (the snapshot object store).
 */
export async function removeOwnedTree(topicDirectory: string, name: 'sessions' | 'workspace'): Promise<void> {
  const owner = await realpath(topicDirectory)
  const root = resolve(owner, name)
  const files: string[] = []
  const directories: string[] = []
  const walk = async (path: string): Promise<void> => {
    const info = await lstat(path).catch(error => { if (error.code === 'ENOENT') return undefined; throw error })
    if (info === undefined) return
    if (info.isSymbolicLink()) throw new Error('Citer 拒绝递归清理链接目录')
    contained(owner, await realpath(path))
    if (info.isDirectory()) {
      for (const entry of await readdir(path)) await walk(resolve(path, entry))
      directories.push(path)
    } else if (info.isFile()) files.push(path)
    else throw new Error('Citer Session 目录包含无法识别的文件类型')
  }
  // Validate the complete tree before removing its first file.
  await walk(root)
  for (const file of files) { contained(owner, await realpath(file)); await removeFile(file) }
  for (const directory of directories) { contained(owner, await realpath(directory)); await rmdir(directory) }
}

/** Delete a retired Topic's private Session backend. The caller must drain the factory first. Never accepts the Host backend root. */
export async function removeOwnedSessionTree(topicDirectory: string): Promise<void> {
  await removeOwnedTree(topicDirectory, 'sessions')
}

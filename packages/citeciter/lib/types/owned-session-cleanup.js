import { lstat, readdir, realpath, rmdir, unlink } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';
function contained(root, path) {
    const part = relative(root, path);
    if (part === '' || part.startsWith('..') || isAbsolute(part))
        throw new Error('Citer 拒绝清理自有 Session 目录之外的路径');
}
/** Delete a retired Topic's private backend, including its child Agents. The caller must drain the factory and verify its source ownership marker first. Never accepts the Host backend root. */
export async function removeOwnedSessionTree(topicDirectory) {
    const owner = await realpath(topicDirectory);
    const root = resolve(owner, 'sessions');
    const files = [];
    const directories = [];
    const walk = async (path) => {
        const info = await lstat(path).catch(error => { if (error.code === 'ENOENT')
            return undefined; throw error; });
        if (info === undefined)
            return;
        if (info.isSymbolicLink())
            throw new Error('Citer 拒绝递归清理链接目录');
        contained(owner, await realpath(path));
        if (info.isDirectory()) {
            for (const entry of await readdir(path))
                await walk(resolve(path, entry));
            directories.push(path);
        }
        else if (info.isFile())
            files.push(path);
        else
            throw new Error('Citer Session 目录包含无法识别的文件类型');
    };
    // Validate the complete tree before removing its first file; never follow links.
    await walk(root);
    for (const file of files) {
        contained(owner, await realpath(file));
        await unlink(file);
    }
    for (const directory of directories) {
        contained(owner, await realpath(directory));
        await rmdir(directory);
    }
}

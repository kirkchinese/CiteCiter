import assert from 'node:assert/strict'
import { chmod, mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { removeOwnedTree } from '../lib/types/owned-session-cleanup.js'

test('deleting a Topic removes its workspace snapshots, including read-only git objects', async () => {
  const root = await mkdtemp(join(tmpdir(), 'citer-cleanup-'))
  try {
    const topic = join(root, '3')
    const object = join(topic, 'workspace', 'objects', '95')
    await mkdir(object, { recursive: true })
    const blob = join(object, '64c1ff2996a2ea9392b78d39faccf10f0e83dd')
    await writeFile(blob, 'compressed file copy')
    await chmod(blob, 0o444)
    await writeFile(join(topic, 'workspace', 'state.json'), '{}')
    await writeFile(join(topic, 'topic.json'), '{}')
    await removeOwnedTree(topic, 'workspace')
    assert.deepEqual(await readdir(topic), ['topic.json'])
    // A Topic that never tracked a workspace has nothing to remove.
    await removeOwnedTree(topic, 'workspace')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

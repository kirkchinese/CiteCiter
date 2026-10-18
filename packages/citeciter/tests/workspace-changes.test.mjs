import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import {
  WorkspaceSnapshots,
  formatElapsed,
  parseWorkspaceChanges,
  readWorkspaceState,
  renderWorkspaceNotice,
} from '../lib/types/workspace-changes.js'

const gitAvailable = (() => {
  try { execFileSync('git', ['--version'], { stdio: 'ignore' }); return true } catch { return false }
})()

async function repository() {
  const root = await mkdtemp(join(tmpdir(), 'citer-ws-'))
  const repo = join(root, 'repo')
  const store = join(root, 'store')
  execFileSync('git', ['init', '-q', repo])
  execFileSync('git', ['-C', repo, 'config', 'user.email', 'citer@example.invalid'])
  execFileSync('git', ['-C', repo, 'config', 'user.name', 'Citer Test'])
  await writeFile(join(repo, 'a.txt'), 'one\ntwo\nthree\n')
  await writeFile(join(repo, '.gitignore'), 'ignored.txt\n')
  execFileSync('git', ['-C', repo, 'add', '-A'])
  execFileSync('git', ['-C', repo, 'commit', '-q', '-m', 'init'])
  return { root, repo, store }
}

test('snapshots report line changes since the previous turn without writing the repository', { skip: !gitAvailable }, async () => {
  const { root, repo, store } = await repository()
  try {
    const objectsBefore = await readdir(join(repo, '.git', 'objects'), { recursive: true })
    const workspace = new WorkspaceSnapshots(store, repo)
    const first = await workspace.advance(1_000)
    assert.equal(first.files, null)
    assert.equal(first.elapsedMs, null)

    await writeFile(join(repo, 'a.txt'), 'one\nTWO\nthree\n')
    await writeFile(join(repo, 'b.txt'), 'new\n')
    await writeFile(join(repo, 'ignored.txt'), 'secret\n')
    const second = await workspace.advance(61_000)
    assert.equal(second.elapsedMs, 60_000)
    assert.deepEqual(second.files.map(file => [file.path, file.status, file.added, file.deleted]), [['a.txt', 'modified', 1, 1], ['b.txt', 'added', 1, 0]])
    assert.equal(second.state.previousTree, first.state.tree)

    const patch = await workspace.filePatch(second.state.previousTree, second.state.tree, 'a.txt')
    assert.match(patch, /-two\n\+TWO/u)

    const live = await workspace.live(['b.txt'])
    assert.deepEqual(live.files.map(file => file.path), ['b.txt'])
    assert.match(live.patch, /\+new/u)

    const third = await workspace.advance(62_000)
    assert.deepEqual(third.files, [])

    // The repository's own index and object store are untouched; uncommitted edits stay unstaged.
    assert.deepEqual(await readdir(join(repo, '.git', 'objects'), { recursive: true }), objectsBefore)
    assert.match(execFileSync('git', ['-C', repo, 'status', '--porcelain'], { encoding: 'utf8' }), / M a\.txt\n\?\? b\.txt/u)
    assert.equal(existsSync(join(store, 'objects')), true)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('the private store keeps only objects reachable from the last two snapshots', { skip: !gitAvailable }, async () => {
  const { root, repo, store } = await repository()
  try {
    const workspace = new WorkspaceSnapshots(store, repo)
    const blob = text => execFileSync('git', ['hash-object', '--stdin'], { input: text, encoding: 'utf8' }).trim()
    const stored = async () => (await readdir(join(store, 'objects'), { recursive: true })).filter(name => /^[0-9a-f]{2}[\\/][0-9a-f]{38}$/u.test(name)).map(name => name.replace(/[\\/]/u, ''))
    const versions = ['v1\n', 'v2\n', 'v3\n', 'v4\n', 'v5\n']
    for (const [index, text] of versions.entries()) {
      await writeFile(join(repo, 'draft.txt'), text)
      await workspace.advance(index * 1000)
    }
    const objects = await stored()
    assert.equal(objects.includes(blob('v1\n')), false)
    assert.equal(objects.includes(blob('v3\n')), false)
    assert.equal(objects.includes(blob('v4\n')), true)
    assert.equal(objects.includes(blob('v5\n')), true)
    // Two root trees plus the two draft blobs; committed files stay in the repository's own store.
    assert.equal(objects.length, 4)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('a directory outside git yields no snapshot', { skip: !gitAvailable }, async () => {
  const root = await mkdtemp(join(tmpdir(), 'citer-ws-plain-'))
  try {
    assert.equal(await new WorkspaceSnapshots(join(root, 'store'), root).advance(0), null)
    assert.equal(await new WorkspaceSnapshots(join(root, 'store'), '').advance(0), null)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('persisted cursors are read field by field', () => {
  const tree = 'a'.repeat(40)
  assert.deepEqual(readWorkspaceState({ version: 1, root: '/r', tree, time: 1, previousTree: null, previousTime: null }), { version: 1, root: '/r', tree, time: 1, previousTree: null, previousTime: null })
  assert.equal(readWorkspaceState({ version: 1, root: '/r', tree: '--upload-pack=x', time: 1, previousTree: null, previousTime: null }), null)
  assert.equal(readWorkspaceState({ version: 2, root: '/r', tree, time: 1, previousTree: null, previousTime: null }), null)
  assert.equal(readWorkspaceState(null), null)
})

test('numstat and name-status combine into typed file changes', () => {
  const files = parseWorkspaceChanges('3\t1\tsrc/a.ts\0-\t-\timg.png\0' + '0\t4\told.ts\0', 'M\0src/a.ts\0A\0img.png\0D\0old.ts\0')
  assert.deepEqual(files, [
    { path: 'src/a.ts', status: 'modified', added: 3, deleted: 1 },
    { path: 'img.png', status: 'added', added: null, deleted: null },
    { path: 'old.ts', status: 'deleted', added: 0, deleted: 4 },
  ])
})

test('notices list files and either point to the tool or include diffs within a budget', () => {
  const files = [{ path: 'a.ts', status: 'modified', added: 2, deleted: 1 }, { path: 'big.ts', status: 'modified', added: 900, deleted: 0 }]
  const summary = renderWorkspaceNotice({ elapsedMs: 7_980_000, root: '/repo', files })
  assert.match(summary, /^# Workspace changes · 2h 13m since your previous turn began/u)
  assert.match(summary, /2 files changed \(\+902 −1\):\n- M a\.ts \(\+2 −1\)\n- M big\.ts \(\+900\)/u)
  assert.match(summary, /Call workspace_changes/u)
  const patches = new Map([['a.ts', '@@ -1 +1 @@\n-x\n+y\n'], ['big.ts', `@@ -0,0 +1,900 @@\n${'+line\n'.repeat(900)}`]])
  const diff = renderWorkspaceNotice({ elapsedMs: 30_000, root: '/repo', files, patches, budgetBytes: 1000 })
  assert.match(diff, /## a\.ts\n```diff\n@@ -1 \+1 @@\n-x\n\+y\n```/u)
  assert.match(diff, /Not shown within the notice budget: big\.ts/u)
  assert.equal(formatElapsed(45_000), '45s')
  assert.equal(formatElapsed(3 * 86_400_000), '3d 0h')
})

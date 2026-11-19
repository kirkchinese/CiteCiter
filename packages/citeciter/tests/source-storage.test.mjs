import assert from 'node:assert/strict'
import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { SourceStorage } from '../lib/types/source-storage.js'

/** A JSONL root on disk and a Host whose backend counts the expensive per-Session lookups. */
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'citer-sources-'))
  const calls = { resolve: 0, list: 0 }
  const warnings = []
  const host = {
    logger: { warn: (message) => warnings.push(String(message)) },
    sessionPersistence: {
      config: { root },
      async list() { calls.list++; return [] },
      async resolveCurrentLog(id) {
        calls.resolve++
        return undefined
      },
    },
  }
  const session = async (project, id, { log = 'session.v4.jsonl.zstd', owner } = {}) => {
    const directory = join(root, project, id)
    await mkdir(directory, { recursive: true })
    if (log !== null) await writeFile(join(directory, log), '')
    if (owner !== undefined) {
      await mkdir(join(directory, 'citeciter'), { recursive: true })
      await writeFile(join(directory, 'citeciter', 'owner.json'), JSON.stringify({ kind: 'citeciter-source', version: 1, sourceSessionId: owner }) + '\n')
    }
    return directory
  }
  return { root, calls, warnings, host, session, cleanup: () => rm(root, { recursive: true, force: true }) }
}

test('discovery lists the store once instead of resolving every Session', async () => {
  const { calls, warnings, host, session, cleanup } = await fixture()
  try {
    const marked = await session('--E-a--', 's1', { owner: 's1' })
    await session('--E-a--', 's2')
    const other = await session('--E-b--', 's3', { owner: 's3' })
    // Hundreds of unmarked Sessions across many projects cost one directory probe each.
    for (let project = 0; project < 40; project++) {
      for (let index = 0; index < 25; index++) await mkdir(join(host.sessionPersistence.config.root, `--p${project}--`, `session-${project}-${index}`), { recursive: true })
    }
    const started = performance.now()
    const roots = await new SourceStorage(host).discover()
    const elapsed = performance.now() - started
    assert.deepEqual([...roots.keys()].sort(), ['s1', 's3'])
    assert.equal(roots.get('s1'), await realpath(join(marked, 'citeciter')))
    assert.equal(roots.get('s3'), await realpath(join(other, 'citeciter')))
    assert.equal(calls.resolve, 0, 'no per-Session backend lookup')
    assert.equal(calls.list, 0)
    assert.deepEqual(warnings, [])
    assert.ok(elapsed < 10_000, `discovery took ${Math.round(elapsed)} ms`)
  } finally { await cleanup() }
})

test('one bad source is skipped with a warning; the rest are still found', async () => {
  const { calls, warnings, host, session, cleanup } = await fixture()
  try {
    await session('--E-a--', 'good', { owner: 'good' })
    // The same id in two projects: DSH refuses it, and Citer binds neither.
    await session('--E-a--', 'twice', { owner: 'twice' })
    await session('--E-b--', 'twice', { owner: 'twice' })
    // Saved by a newer DSH.
    await session('--E-b--', 'newer', { log: 'session.v99.jsonl', owner: 'newer' })
    // A marker without a Session log is not a source.
    await session('--E-b--', 'stray', { log: null, owner: 'stray' })
    // A marker naming another Session: only the backend may say where that one lives.
    await session('--E-b--', 'renamed', { owner: 'elsewhere' })
    const directory = await session('--E-c--', 'broken', { owner: 'broken' })
    await writeFile(join(directory, 'citeciter', 'owner.json'), '{not json')
    const roots = await new SourceStorage(host).discover()
    assert.deepEqual([...roots.keys()], ['good'])
    assert.equal(calls.resolve, 1, 'only the renamed marker reaches the backend')
    assert.equal(warnings.length, 3)
    assert.ok(warnings.some(warning => warning.includes('twice')))
    assert.ok(warnings.some(warning => warning.includes('newer')))
    assert.ok(warnings.some(warning => warning.includes('broken')))
  } finally { await cleanup() }
})

test('discovery stops when Citer shuts down', async () => {
  const { host, session, cleanup } = await fixture()
  try {
    await session('--E-a--', 's1', { owner: 's1' })
    const controller = new AbortController()
    controller.abort(new Error('shutting down'))
    await assert.rejects(new SourceStorage(host).discover(controller.signal), /shutting down/u)
  } finally { await cleanup() }
})

test('a backend without a root directory is asked Session by Session, and a failure there is only a warning', async () => {
  const warnings = []
  const host = {
    logger: { warn: (message) => warnings.push(String(message)) },
    sessionPersistence: {
      async list() { return [{ header: { id: 'a' } }, { header: { id: 'b' } }] },
      async resolveCurrentLog(id) { if (id === 'a') throw new Error('unreadable'); return undefined },
    },
  }
  const roots = await new SourceStorage(host).discover()
  assert.equal(roots.size, 0)
  // a fails to resolve; b has no current log and no root to look for a historical one in. Neither stops discovery.
  assert.equal(warnings.length, 2)
  assert.match(warnings[0], /unreadable/u)
})

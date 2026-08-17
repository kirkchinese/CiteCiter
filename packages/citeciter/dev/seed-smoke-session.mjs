import { randomUUID } from 'node:crypto'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { zstdCompressSync, zstdDecompressSync } from 'node:zlib'

const dshHome = process.argv[2] ?? '/tmp/citeciter-dsh-home'
const cwd = process.argv[3] ?? fileURLToPath(new URL('../../../', import.meta.url))
const fixtureKind = 'citeciter-smoke-fixture-v1'
const legacySessionId = 'session-11111111-1111-4111-8111-111111111111'
const metadataPath = join(dshHome, 'citeciter-smoke.json')
const sessionId = `session-${randomUUID()}`
const title = 'CiteCiter'
const createdAt = Date.now()

function projectKey(path) {
  let readable = ''
  let separatorRun = false
  for (const ch of path) {
    const code = ch.charCodeAt(0)
    if (ch === '/' || ch === '\\' || ch === ':') {
      if (!separatorRun) readable += '-'
      separatorRun = true
    } else if (ch !== '~' && /^[A-Za-z0-9._-]$/u.test(ch)) {
      readable += ch
      separatorRun = false
    } else {
      readable += `~${code.toString(16).toUpperCase().padStart(4, '0')}`
      separatorRun = false
    }
  }
  return `--${(readable.replace(/^-+/u, '') || 'root').slice(0, 251)}--`
}

async function removePreviousFixtureTree(projectDir, rootId) {
  await mkdir(projectDir, { recursive: true })
  const headers = []
  for (const entry of await readdir(projectDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const candidate = join(projectDir, entry.name, 'session.jsonl.zstd')
    let bytes
    try {
      bytes = await readFile(candidate)
    } catch (error) {
      if (error !== null && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') continue
      throw error
    }
    const header = JSON.parse(zstdDecompressSync(bytes).toString('utf8').trim())
    if (header.type !== 'session' || typeof header.id !== 'string') {
      throw new Error(`invalid session header in ${candidate}`)
    }
    headers.push({ dir: join(projectDir, entry.name), id: header.id, parent: header.parentSession })
  }
  const owned = new Set([rootId])
  let changed = true
  while (changed) {
    changed = false
    for (const header of headers) {
      if (typeof header.parent === 'string' && owned.has(header.parent) && !owned.has(header.id)) {
        owned.add(header.id)
        changed = true
      }
    }
  }
  await Promise.all(headers.filter((header) => owned.has(header.id)).map((header) => rm(header.dir, { recursive: true, force: true })))
}

const messageId = '22222222-2222-4222-8222-222222222222'
const sourceText = 'The Riemann curvature tensor measures how parallel transport depends on path.'
const rows = [
  { type: 'session', version: 0, id: sessionId, createdAt, cwd, delegationDepth: 0, agentPreset: 'standard' },
  { type: 'permission/preset', seq: 0, time: createdAt + 1, data: { preset: 'workspace-write' } },
  { type: 'sandbox/mode', seq: 1, time: createdAt + 2, data: { mode: 'workspace-write' } },
  { type: 'approval/policy', seq: 2, time: createdAt + 3, data: { policy: 'ask' } },
  { type: 'turn/start', seq: 3, time: createdAt + 4, data: { turn: 1 } },
  { type: 'step/start', seq: 4, time: createdAt + 5, data: { turn: 1, step: 1 } },
  {
    type: 'user/message',
    seq: 5,
    time: createdAt + 6,
    data: {
      content: [{ type: 'text', text: 'Explain the geometric meaning of curvature.' }],
      source: { kind: 'user', rpcId: 'citeciter-smoke-seed' },
      role: 'user',
      id: '33333333-3333-4333-8333-333333333333',
    },
    surfaceOp: 'append',
  },
  {
    type: 'assistant/message',
    seq: 6,
    time: createdAt + 7,
    data: {
      turn: 1,
      step: 1,
      message: {
        content: [{ type: 'text', text: sourceText }],
        source: { kind: 'model', provider: 'fixture', model: 'fixture' },
        role: 'assistant',
        id: messageId,
      },
    },
    surfaceOp: 'append',
  },
  { type: 'step/end', seq: 7, time: createdAt + 8, data: { turn: 1, step: 1 } },
  { type: 'turn/end', seq: 8, time: createdAt + 9, data: { turn: 1, reason: { kind: 'completed' } } },
  { type: 'session/end-seed', seq: 9, time: createdAt + 10, data: {} },
  { type: 'session/title', seq: 10, time: createdAt + 11, data: { title, messageSeqs: [], source: { kind: 'user' } } },
]
const projectDir = join(dshHome, 'sessions', projectKey(cwd))
const previousRoots = new Set([legacySessionId])
try {
  const previous = JSON.parse(await readFile(metadataPath, 'utf8'))
  if (previous.kind === fixtureKind && typeof previous.sessionId === 'string') previousRoots.add(previous.sessionId)
} catch (error) {
  if (error === null || typeof error !== 'object' || !('code' in error) || error.code !== 'ENOENT') throw error
}
for (const rootId of previousRoots) await removePreviousFixtureTree(projectDir, rootId)
const sessionDir = join(projectDir, sessionId)
const logPath = join(sessionDir, 'session.jsonl.zstd')
await mkdir(sessionDir, { recursive: true })
const [header, ...events] = rows
const headerFrame = zstdCompressSync(Buffer.from(`${JSON.stringify(header)}\n`))
const eventFrame = zstdCompressSync(Buffer.from(`${events.map((row) => JSON.stringify(row)).join('\n')}\n`))
await writeFile(logPath, Buffer.concat([headerFrame, eventFrame]))
const metadata = { kind: fixtureKind, sessionId, title, anchorKey: '14:assistant-step1:1', anchorSeq: 6, logPath }
await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`)
console.log(JSON.stringify(metadata))

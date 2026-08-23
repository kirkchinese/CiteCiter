import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const EXPECTED_SHA256 = '9dd621452ba17bed382f756901f4ea5f8d1d53b172a84d7f62701ca28ada1c80'
const EXPECTED_SELECTOR = '[data-citeciter-docked]>:has(+[data-shell-overlay])'
const tarball = resolve(process.argv[2] ?? '')
if (process.argv[2] === undefined) throw new Error('usage: node verify-candidate.mjs <candidate.tgz>')

const bytes = readFileSync(tarball)
const digest = createHash('sha256').update(bytes).digest('hex')
if (digest !== EXPECTED_SHA256) {
  throw new Error(`candidate SHA-256 ${digest} does not match ${EXPECTED_SHA256}`)
}

const unpacked = mkdtempSync(join(tmpdir(), 'citeciter-candidate-'))
try {
  const tar = spawnSync('tar', ['-xzf', tarball, '-C', unpacked], { encoding: 'utf8' })
  if (tar.error !== undefined) throw tar.error
  if (tar.status !== 0) throw new Error(`tar failed: ${tar.stderr}`)

  const manifest = JSON.parse(readFileSync(join(unpacked, 'package', 'package.json'), 'utf8'))
  if (manifest.name !== '@kirkchinese/dsh-citeciter' || manifest.version !== '0.4.1') {
    throw new Error(`unexpected package identity ${manifest.name}@${manifest.version}`)
  }
  const inject = manifest.dsh?.client?.inject
  for (const name of [
    '@deepseek-ai/dsh-client-ui-conversation',
    '@deepseek-ai/dsh-client-ui-layout',
  ]) {
    if (!inject?.includes(name) || manifest.peerDependencies?.[name] !== '>=0.1.1-rc.1 <0.1.1-rc.3') {
      throw new Error(`candidate does not declare ${name} in both client inject and peers`)
    }
  }
  for (const name of [
    'react',
    '@deepseek-ai/dsh-client-ui-slots',
    '@deepseek-ai/dsh-client-ui-primitives',
  ]) {
    if (inject?.includes(name) || manifest.peerDependencies?.[name] !== undefined) {
      throw new Error(`candidate exposes static baseline dependency ${name}`)
    }
  }

  const client = readFileSync(join(unpacked, 'package', 'lib', 'client.js'), 'utf8')
  if (!client.includes(EXPECTED_SELECTOR)) {
    throw new Error(`packed client is missing ${EXPECTED_SELECTOR}`)
  }
  if (/\[data-citeciter-docked\][^{}]{0,240}:nth-child\(/u.test(client)) {
    throw new Error('packed client still contains a docked fixed-child selector')
  }
  console.log(JSON.stringify({ tarball, bytes: bytes.byteLength, sha256: digest, selector: EXPECTED_SELECTOR }))
} finally {
  rmSync(unpacked, { recursive: true, force: true })
}

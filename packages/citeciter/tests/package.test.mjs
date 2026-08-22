import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import plugin, { CiteCiterHost } from '../lib/types/index.js'

const packageRoot = new URL('../', import.meta.url)

test('published v0.3 package declares an installable Observer Host+Client DSH bundle', async () => {
  const manifest = JSON.parse(await readFile(new URL('package.json', packageRoot), 'utf8'))
  const patch = await readFile(new URL('cordis.patch.yml', packageRoot), 'utf8')

  assert.equal(manifest.name, '@kirkchinese/dsh-citeciter')
  assert.equal(manifest.version, '0.3.2')
  assert.equal(manifest.private, undefined)
  assert.equal(manifest.dsh?.bundle?.patch, './cordis.patch.yml')
  assert.equal(manifest.exports?.['./typert']?.default, './lib/typert.host.js')
  assert.equal(manifest.exports?.['./remote']?.default, './lib/typert.remote-client.js')
  assert.ok(manifest.dsh.client.inject.includes('@deepseek-ai/dsh-api-gateway'))
  assert.ok(manifest.dsh.client.inject.includes('@deepseek-ai/dsh-client-ui-settings'))
  assert.ok(manifest.files.includes('lib/*.js'))
  assert.equal(manifest.scripts?.prepack, 'npm run build')
  for (const peer of [
    '@deepseek-ai/dsh-agent',
    '@deepseek-ai/dsh-agent-loop',
    '@deepseek-ai/dsh-fs',
    '@deepseek-ai/dsh-home-paths',
    '@deepseek-ai/dsh-llm',
    '@deepseek-ai/dsh-sandbox-policy',
    '@deepseek-ai/dsh-session-persistence-jsonl',
    '@deepseek-ai/dsh-session-query',
    '@deepseek-ai/dsh-session-title',
    '@deepseek-ai/dsh-session-title-llm',
    '@deepseek-ai/dsh-settings',
    '@deepseek-ai/dsh-system-prompt',
    '@deepseek-ai/dsh-tool-fs',
    '@deepseek-ai/dsh-tools',
    '@deepseek-ai/dsh-typert-protocol',
    '@deepseek-ai/schemastery',
    'zod',
  ]) assert.ok(manifest.peerDependencies[peer], `missing peer ${peer}`)
  for (const removedPeer of [
    '@deepseek-ai/dsh-commands',
    '@deepseek-ai/dsh-permission-presets',
    '@deepseek-ai/dsh-session-projection',
  ]) assert.equal(manifest.peerDependencies[removedPeer], undefined)
  assert.equal(patch, "- insert:\n    - id: citeciter\n      name: '@kirkchinese/dsh-citeciter'\n")
})

test('default package entry mounts the Remote service directly', () => {
  assert.equal(plugin, CiteCiterHost)
})

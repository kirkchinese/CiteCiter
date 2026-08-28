import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { Context } from '@deepseek-ai/cordis'
import { SettingsProvider } from '@deepseek-ai/dsh-settings'
import plugin, { CITECITER_SETTINGS_NS, CiteCiterHost } from '../lib/types/index.js'

const packageRoot = new URL('../', import.meta.url)

test('v0.4.3 candidate declares an installable Observer Host+Client DSH bundle', async () => {
  const manifest = JSON.parse(await readFile(new URL('package.json', packageRoot), 'utf8'))
  const patch = await readFile(new URL('cordis.patch.yml', packageRoot), 'utf8')

  assert.equal(manifest.name, '@kirkchinese/dsh-citeciter')
  assert.equal(manifest.version, '0.4.3')
  assert.equal(manifest.private, undefined)
  assert.equal(manifest.dsh?.bundle?.patch, './cordis.patch.yml')
  assert.equal(manifest.exports?.['./typert']?.default, './lib/typert.host.js')
  assert.equal(manifest.exports?.['./remote']?.default, './lib/typert.remote-client.js')
  assert.ok(manifest.dsh.client.inject.includes('@deepseek-ai/dsh-api-gateway'))
  assert.ok(manifest.dsh.client.inject.includes('@deepseek-ai/dsh-client-ui-settings'))
  assert.ok(manifest.dsh.client.inject.includes('@deepseek-ai/dsh-client-connection'))
  assert.ok(manifest.dsh.client.inject.includes('@deepseek-ai/dsh-client-ui-conversation'))
  assert.equal(manifest.dsh.client.inject.includes('@deepseek-ai/dsh-client-ui-primitives'), false)
  assert.equal(manifest.dsh.client.inject.includes('@deepseek-ai/dsh-client-ui-slots'), false)
  assert.ok(manifest.files.includes('lib/*.js'))
  assert.equal(manifest.scripts?.prepack, 'npm run build')
  for (const peer of [
    '@deepseek-ai/dsh-agent',
    '@deepseek-ai/dsh-agent-loop',
    '@deepseek-ai/dsh-client-connection',
    '@deepseek-ai/dsh-client-ui-conversation',
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
    '@deepseek-ai/dsh-client-ui-primitives',
    '@deepseek-ai/dsh-client-ui-slots',
    'react',
  ]) assert.equal(manifest.peerDependencies[removedPeer], undefined)
  for (const developmentOnly of [
    '@deepseek-ai/dsh-client-ui-primitives',
    '@deepseek-ai/dsh-client-ui-slots',
    'react',
  ]) assert.ok(manifest.devDependencies[developmentOnly], `missing development-only dependency ${developmentOnly}`)
  for (const [name, range] of Object.entries(manifest.peerDependencies)) {
    if (name.startsWith('@deepseek-ai/dsh-')) assert.equal(range, '>=0.1.1-rc.1 <0.1.1-rc.3')
  }
  assert.equal(patch, "- insert:\n    - id: citeciter\n      name: '@kirkchinese/dsh-citeciter'\n")
})

test('default package entry mounts the Remote service directly', () => {
  assert.equal(plugin, CiteCiterHost)
})

test('Host unload removes its settings registration so the plugin can load again', async () => {
  class MemorySettings extends SettingsProvider {
    writable = true

    async load() { return {} }

    async persist() {}
  }

  const ctx = new Context()
  const settingsFiber = await ctx.plugin(MemorySettings)
  const releases = [
    ctx.provide('llm', {}),
    ctx.provide('sessionQuery', { readSession: async () => { throw new Error('unused') } }),
    ctx.provide('subprocess', {}),
  ]
  try {
    const first = await ctx.plugin(CiteCiterHost)
    assert.notEqual(ctx.settings.get(CITECITER_SETTINGS_NS), undefined)
    assert.equal(ctx.settings.describe().filter(({ ns }) => ns === CITECITER_SETTINGS_NS).length, 1)
    await first.dispose()
    assert.equal(ctx.settings.get(CITECITER_SETTINGS_NS), undefined)

    const second = await ctx.plugin(CiteCiterHost)
    assert.notEqual(ctx.settings.get(CITECITER_SETTINGS_NS), undefined)
    assert.equal(ctx.settings.describe().filter(({ ns }) => ns === CITECITER_SETTINGS_NS).length, 1)
    await second.dispose()
    assert.equal(ctx.settings.get(CITECITER_SETTINGS_NS), undefined)
  } finally {
    for (const release of releases.reverse()) await release()
    await settingsFiber.dispose()
  }
})

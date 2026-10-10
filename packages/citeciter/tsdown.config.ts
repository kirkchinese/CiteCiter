import type { TsdownPlugin, UserConfig } from 'tsdown'
import { clientBundle } from './scripts/tsdown.client.ts'

const bundle = clientBundle(
  '@kirkchinese/dsh-citeciter',
  [
    'lib/types/index.js',
    'lib/types/typert.host.js',
    'lib/types/typert.remote-client.js',
  ],
)

/**
 * pnpm truncates and hashes long virtual-store directory names at a platform-dependent length,
 * so region comments name dependencies by package path only.
 */
const STORE_REGION_PATH = /^([\t ]*\/\/#region )(?:\.\.\/)*node_modules\/\.pnpm\/[^/\n]+\/node_modules\//gmu

/** Normalize emitted chunks before their first write, so committed lib/ is identical on every platform. */
const normalizeChunks: TsdownPlugin = {
  name: 'citeciter-normalize-chunks',
  generateBundle(_options, output) {
    for (const entry of Object.values(output)) {
      if (entry.type === 'chunk') entry.code = entry.code.replace(/[\t ]+$/gmu, '').replace(STORE_REGION_PATH, '$1node_modules/')
    }
  },
}

export default (inlineConfig: Pick<UserConfig, 'env'>): UserConfig[] => bundle(inlineConfig).map(config => ({
  ...config,
  plugins: [config.plugins, normalizeChunks],
}))

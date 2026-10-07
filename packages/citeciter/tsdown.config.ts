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

/** Normalize emitted chunks before their first write, without reopening mapped files. */
const normalizeChunks: TsdownPlugin = {
  name: 'citeciter-normalize-chunks',
  generateBundle(_options, output) {
    for (const entry of Object.values(output)) {
      if (entry.type === 'chunk') entry.code = entry.code.replace(/[\t ]+$/gmu, '')
    }
  },
}

export default (inlineConfig: Pick<UserConfig, 'env'>): UserConfig[] => bundle(inlineConfig).map(config => ({
  ...config,
  plugins: [config.plugins, normalizeChunks],
}))

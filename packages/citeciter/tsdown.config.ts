import { clientBundle } from './scripts/tsdown.client.ts'

export default clientBundle(
  '@kirkchinese/dsh-citeciter',
  [
    'lib/types/index.js',
    'lib/types/typert.host.js',
    'lib/types/typert.remote-client.js',
  ],
)

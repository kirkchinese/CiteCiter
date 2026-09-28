import type { InvocationDescriptor } from '@deepseek-ai/dsh-typert-protocol'
import { citeCiterRequestSchema, citeCiterResponseSchema } from './topic.ts'
import { updateCheckResponseSchema } from './update.ts'
import { strictCodec } from './typert-codec.ts'

/** Strict root-scoped Topic command shared by Host and browser manifests. */
export const citeCiterRequestDescriptor = {
  id: '@kirkchinese/dsh-citeciter#citeciter/request',
  service: 'citeciter',
  namespace: 'citeciter',
  method: 'request',
  invocation: { kind: 'direct' },
  parameters: [{
    name: 'rawRequest',
    wire: 'rawRequest',
    source: 'json',
    codec: strictCodec('@kirkchinese/dsh-citeciter#CiteCiterRequest', citeCiterRequestSchema),
  }],
  cancellation: { parameter: 'signal' },
  result: strictCodec('@kirkchinese/dsh-citeciter#CiteCiterResponse', citeCiterResponseSchema),
  sourceLocation: {
    file: 'src/index.ts',
    line: 127,
    column: 3,
  },
} as const satisfies InvocationDescriptor

/** Strict root-scoped read-only update check shared by Host and browser manifests. */
export const updateCheckDescriptor = {
  id: '@kirkchinese/dsh-citeciter#citeciter/checkUpdate',
  service: 'citeciter',
  namespace: 'citeciter',
  method: 'checkUpdate',
  invocation: { kind: 'direct' },
  parameters: [],
  cancellation: { parameter: 'signal' },
  result: strictCodec('@kirkchinese/dsh-citeciter#UpdateCheckResponse', updateCheckResponseSchema),
  sourceLocation: {
    file: 'src/index.ts',
    line: 134,
    column: 3,
  },
} as const satisfies InvocationDescriptor

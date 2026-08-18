import type { InvocationDescriptor } from '@deepseek-ai/dsh-typert-protocol'
import { z } from 'zod'
import { citationRecordSchema } from './thread.ts'

export const prepareThreadResultSchema = z.object({
  ready: z.literal(true),
  citation: citationRecordSchema,
}).strict()

/** Strict descriptor shared byte-for-byte by Host and Client contributions. */
export const prepareThreadDescriptor = {
  id: '@kirkchinese/dsh-citeciter#citeciter/prepareThread',
  service: 'citeciter',
  namespace: 'citeciter',
  method: 'prepareThread',
  invocation: { kind: 'direct' },
  scope: {
    context: 'agent',
    wire: 'agentId',
  },
  parameters: [
    {
      name: 'agent',
      wire: 'agentId',
      source: 'lookup',
      lookup: 'agent',
      codec: {
        mode: 'strict',
        typeSymbol: '@deepseek-ai/dsh-session/types#SessionId',
        schema: z.string().min(1),
      },
    },
    {
      name: 'rawCitation',
      wire: 'rawCitation',
      source: 'json',
      codec: {
        mode: 'strict',
        typeSymbol: '@kirkchinese/dsh-citeciter#CitationRecord',
        schema: citationRecordSchema,
      },
    },
  ],
  result: {
    mode: 'strict',
    typeSymbol: '@kirkchinese/dsh-citeciter#PrepareThreadResult',
    schema: prepareThreadResultSchema,
  },
  sourceLocation: {
    file: 'src/index.ts',
    line: 104,
    column: 3,
  },
} as const satisfies InvocationDescriptor

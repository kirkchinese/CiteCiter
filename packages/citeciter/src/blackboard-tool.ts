/** The model-facing blackboard_apply tool; it validates a batch against the board replayed from the Topic log. */
import { defineTool } from '@deepseek-ai/dsh-tools'
import { BOARD_MAX_BATCH_OPS, applyBoardOps, boardBatchSchema } from './board.ts'
import { projectBoardFromLog } from './topic-log.ts'

const boardStyleParameterSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    color: { type: 'string', description: 'CSS color restricted by the board validator.' },
    fontSize: { type: 'string', description: 'CSS length in px, em, rem, or percent.' },
  },
} as const

const boardEnvelopeParameterProperties = {
  x: { type: 'number', required: true, description: 'Left edge as canvas percent; x + w must be at most 100.' },
  y: { type: 'number', required: true, description: 'Top edge as canvas percent; y + h must be at most 100.' },
  w: { type: 'number', required: true, description: 'Width as canvas percent, from 0.5 to 100.' },
  h: { type: 'number', required: true, description: 'Height as canvas percent, from 0.5 to 100.' },
} as const

/** Complete model-visible parameter schema for blackboard_apply. */
const BLACKBOARD_APPLY_PARAMETERS = {
  ops: {
    type: 'array',
    required: true,
    description: `Ordered atomic batch containing 1-${BOARD_MAX_BATCH_OPS} board operations.`,
    items: {
      oneOf: [
        {
          type: 'object',
          additionalProperties: false,
          properties: { op: { type: 'string', const: 'clear', required: true } },
        },
        {
          type: 'object',
          additionalProperties: false,
          properties: {
            op: { type: 'string', const: 'set', required: true },
            id: { type: 'string', required: true },
            kind: { type: 'string', enum: ['text', 'markdown', 'math', 'svg', 'html', 'image', 'table'], required: true },
            content: { type: 'string', required: true },
            ...boardEnvelopeParameterProperties,
            style: boardStyleParameterSchema,
          },
        },
        {
          type: 'object',
          additionalProperties: false,
          properties: {
            op: { type: 'string', const: 'update', required: true },
            id: { type: 'string', required: true },
            content: { type: 'string' },
            x: { type: 'number' },
            y: { type: 'number' },
            w: { type: 'number' },
            h: { type: 'number' },
            style: boardStyleParameterSchema,
          },
        },
        {
          type: 'object',
          additionalProperties: false,
          properties: {
            op: { type: 'string', const: 'remove', required: true },
            id: { type: 'string', required: true },
          },
        },
        {
          type: 'object',
          additionalProperties: false,
          properties: {
            op: { type: 'string', const: 'clear_region', required: true },
            ...boardEnvelopeParameterProperties,
          },
        },
        {
          type: 'object',
          additionalProperties: false,
          properties: {
            op: { type: 'string', const: 'animate', required: true },
            id: { type: 'string', required: true },
            animation: { type: 'string', enum: ['fade-in', 'slide-in', 'pulse', 'highlight'], required: true },
            durationMs: { type: 'integer', description: 'Animation duration from 50 to 5000 milliseconds.' },
            iterations: { type: 'integer', description: 'Iteration count from 1 to 5.' },
          },
        },
        {
          type: 'object',
          additionalProperties: false,
          properties: {
            op: { type: 'string', const: 'focus', required: true },
            id: {
              oneOf: [{ type: 'string' }, { type: 'null' }],
              required: true,
              description: 'Existing element id, or null to clear focus.',
            },
          },
        },
      ],
    },
  },
} as const

/**
 * Create the blackboard_apply tool. A successful call only validates and records the batch;
 * the board itself is replayed from committed results.
 * @returns a tool definition for one Topic tool registry.
 */
export function createBlackboardApplyTool() {
  return defineTool({
    name: 'blackboard_apply',
    description: 'Atomically apply one protocol-v4 blackboard batch for the current Topic. A failed batch leaves the board unchanged. The canvas is dark green: use light text or provide a contrasting background inside SVG. Coordinates and sizes are percentages, not pixels; leave margins and keep notes short enough to fit their envelopes. SVG colors are preserved. Keep labels inside the SVG viewBox and clear of lines. After drawing, use blackboard_view to inspect the rendered image and correct clipping, overlap and low contrast before claiming completion.',
    parameters: BLACKBOARD_APPLY_PARAMETERS,
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          applied: { type: 'integer', required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }],
      presentationMeta: (_args, value) => ({ applied: value.applied }),
    },
    execute: async (args, exec) => {
      const ops = boardBatchSchema.parse(args.ops)
      const session = exec.agent?.session
      if (session === undefined) throw new Error('blackboard_apply requires a Topic Session')
      const current = projectBoardFromLog({
        header: session.header, events: session.snapshotEvents(), inheritedEventCount: session.inheritedEventCount,
      })
      applyBoardOps(new Map(current.elements.map((element) => [element.id, element])), ops)
      return { applied: ops.length }
    },
    presentCall: () => ({ card: 'generic', title: '更新黑板' }),
    presentResult: (_args, result) => ({
      card: 'generic',
      title: result.isError ? '黑板更新失败' : `黑板已应用 ${(result.meta as { readonly applied?: number })?.applied ?? 0} 条`,
    }),
  })
}

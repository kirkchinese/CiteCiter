/** The model-facing blackboard_apply tool; it validates a batch against the board replayed from the Topic log. */
import { defineTool } from '@deepseek-ai/dsh-tools'
import { BOARD_MAX_BATCH_OPS, applyBoardOps, boardBatchSchema } from './board.ts'
import { ANIMATION_MAX_BEATS, ANIMATION_MAX_DURATION_MS, ANIMATION_MAX_FRAMES, ANIMATION_MAX_TRACKS, animationSpecSchema, compileTimeline } from './board-animation.ts'
import { BOARD_ANIMATE_TOOL, projectBoardFromLog } from './topic-log.ts'

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

const point = { type: 'object', additionalProperties: false, properties: { x: { type: 'number', required: true }, y: { type: 'number', required: true } } } as const

/** Complete model-visible parameter schema for blackboard_animate. */
const BLACKBOARD_ANIMATE_PARAMETERS = {
  durationMs: { type: 'integer', required: true, description: `Total timeline length, 200-${ANIMATION_MAX_DURATION_MS} ms.` },
  loop: { type: 'boolean', description: 'Repeat the timeline while playing. Default false.' },
  beats: {
    type: 'array',
    description: `Up to ${ANIMATION_MAX_BEATS} narration beats. The player shows the latest caption and lets the user jump between beats.`,
    items: { type: 'object', additionalProperties: false, properties: { atMs: { type: 'integer', required: true }, caption: { type: 'string', required: true, description: 'At most 160 characters, in the user\'s language.' } } },
  },
  tracks: {
    type: 'array',
    required: true,
    description: `1-${ANIMATION_MAX_TRACKS} tracks. Each animates one existing board element; tracks on the same property hand over in start order, starting from where the previous one left the element.`,
    items: {
      type: 'object',
      additionalProperties: false,
      properties: {
        target: { type: 'string', required: true, description: 'Existing board element id.' },
        verb: {
          type: 'string',
          required: true,
          enum: ['appear', 'disappear', 'move', 'scale', 'rotate', 'highlight', 'reveal', 'follow', 'keyframes', 'parametric'],
          description: 'appear/disappear: fade, optionally sliding (direction). move: to the center point `to`. scale: to factor `scale`. rotate: by `degrees`. highlight: one glow pulse. reveal: wipe in toward `direction` (default right). follow: center travels along `path`. keyframes: `frames`. parametric: center at (`x`(t), `y`(t)).',
        },
        startMs: { type: 'integer', description: 'Track start, default 0.' },
        endMs: { type: 'integer', description: 'Track end, default durationMs. Ignored by keyframes, whose frames carry their own times.' },
        easing: { type: 'string', enum: ['linear', 'ease-in', 'ease-out', 'ease-in-out'], description: 'Default ease-in-out; follow and parametric default to linear.' },
        to: { ...point, description: 'move: destination of the element center, in canvas percent.' },
        scale: { type: 'number', description: 'scale: target factor, 0.05-10.' },
        degrees: { type: 'number', description: 'rotate: relative rotation in degrees.' },
        direction: { type: 'string', enum: ['left', 'right', 'up', 'down'], description: 'appear: slide in moving this way; disappear: slide out this way; reveal: wipe direction.' },
        path: { type: 'string', description: 'follow: SVG path data in canvas percent (0-100 on both axes; M L H V C S Q T A Z). The element center travels from start to end.' },
        orient: { type: 'boolean', description: 'follow: rotate the element along the path tangent.' },
        frames: {
          type: 'array',
          description: `keyframes: 1-${ANIMATION_MAX_FRAMES} frames with absolute atMs. x/y are the element center in canvas percent; omitted fields interpolate between the frames that set them.`,
          items: { type: 'object', additionalProperties: false, properties: { atMs: { type: 'integer', required: true }, x: { type: 'number' }, y: { type: 'number' }, opacity: { type: 'number' }, scale: { type: 'number' }, rotate: { type: 'number' } } },
        },
        x: { type: 'string', description: 'parametric: center x in canvas percent as an expression of t, e.g. "10 + 30*t". Allowed: numbers, t, + - * / ^, parentheses, pi, e, tau, sin cos tan asin acos atan atan2 sqrt abs exp log min max pow floor ceil round sign.' },
        y: { type: 'string', description: 'parametric: center y in canvas percent as an expression of t; y grows downward, e.g. "80 - 60*t + 30*t^2".' },
        t: { type: 'array', items: { type: 'number' }, description: 'parametric: [t0, t1] mapped linearly over startMs-endMs. Default [0, 1].' },
      },
    },
  },
} as const

/**
 * Create the blackboard_animate tool. A successful call validates the timeline against the current
 * board and records it; the board keeps one timeline, replaced by the next successful call.
 * @returns a tool definition for one Topic tool registry.
 */
export function createBlackboardAnimateTool() {
  return defineTool({
    name: BOARD_ANIMATE_TOOL,
    description: 'Animate existing blackboard elements on one timeline the user can play, pause and scrub. Draw the elements first with blackboard_apply (their envelopes are the resting state), then describe motion with verbs, keyframes, an SVG path or a parametric expression. Positions are element centers in canvas percent (x right, y down). The latest call replaces the previous timeline. Afterwards call blackboard_view with atMs to inspect key moments and fix overlaps or elements leaving the canvas. Keep motion purposeful: show a process, a trajectory or a before/after, not decoration.',
    parameters: BLACKBOARD_ANIMATE_PARAMETERS,
    output: {
      schema: { type: 'object', additionalProperties: false, properties: { tracks: { type: 'integer', required: true }, durationMs: { type: 'integer', required: true } } },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }],
      presentationMeta: (_args, value) => ({ tracks: value.tracks, durationMs: value.durationMs }),
    },
    execute: async (args, exec) => {
      const spec = animationSpecSchema.parse(args)
      const session = exec.agent?.session
      if (session === undefined) throw new Error('blackboard_animate requires a Topic Session')
      const current = projectBoardFromLog({ header: session.header, events: session.snapshotEvents(), inheritedEventCount: session.inheritedEventCount })
      compileTimeline(spec, current.elements)
      return { tracks: spec.tracks.length, durationMs: spec.durationMs }
    },
    presentCall: () => ({ card: 'generic', title: '编排板书动画' }),
    presentResult: (_args, result) => ({ card: 'generic', title: result.isError ? '板书动画无效' : '板书动画已就绪' }),
  })
}

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

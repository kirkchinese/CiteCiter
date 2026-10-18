/**
 * Board animation timelines: a declarative spec of verbs, keyframes, SVG paths and restricted
 * parametric expressions over existing board elements, plus a pure sampler shared by the Host
 * validator, the browser player and frame capture. Coordinates are canvas percentages.
 */
import { z } from 'zod'

export const ANIMATION_MAX_TRACKS = 40
export const ANIMATION_MAX_BEATS = 20
export const ANIMATION_MAX_FRAMES = 40
export const ANIMATION_MAX_DURATION_MS = 30_000
/** Offset in canvas percent used by directional appear and disappear. */
const SLIDE_DISTANCE = 6

const easingSchema = z.enum(['linear', 'ease-in', 'ease-out', 'ease-in-out'])
export type AnimationEasing = z.infer<typeof easingSchema>
const directionSchema = z.enum(['left', 'right', 'up', 'down'])
const timeSchema = z.number().int().min(0).max(ANIMATION_MAX_DURATION_MS)
const coordinateSchema = z.number().min(-50).max(150)
const expressionSchema = z.string().min(1).max(240)

/** One verb applied to one board element. */
export const animationTrackSchema = z.object({
  target: z.string().min(1).max(80),
  verb: z.enum(['appear', 'disappear', 'move', 'scale', 'rotate', 'highlight', 'reveal', 'follow', 'keyframes', 'parametric']),
  startMs: timeSchema.optional(),
  endMs: timeSchema.optional(),
  easing: easingSchema.optional(),
  to: z.object({ x: coordinateSchema, y: coordinateSchema }).strict().optional(),
  scale: z.number().min(0.05).max(10).optional(),
  degrees: z.number().min(-3600).max(3600).optional(),
  direction: directionSchema.optional(),
  path: z.string().min(1).max(4000).optional(),
  orient: z.boolean().optional(),
  frames: z.array(z.object({
    atMs: timeSchema,
    x: coordinateSchema.optional(),
    y: coordinateSchema.optional(),
    opacity: z.number().min(0).max(1).optional(),
    scale: z.number().min(0.05).max(10).optional(),
    rotate: z.number().min(-3600).max(3600).optional(),
  }).strict()).min(1).max(ANIMATION_MAX_FRAMES).optional(),
  x: expressionSchema.optional(),
  y: expressionSchema.optional(),
  t: z.tuple([z.number().min(-1e6).max(1e6), z.number().min(-1e6).max(1e6)]).optional(),
}).strict()
export type AnimationTrack = z.infer<typeof animationTrackSchema>

/** One complete timeline as written by the model. */
export const animationSpecSchema = z.object({
  durationMs: z.number().int().min(200).max(ANIMATION_MAX_DURATION_MS),
  loop: z.boolean().optional(),
  beats: z.array(z.object({ atMs: timeSchema, caption: z.string().min(1).max(160) }).strict()).max(ANIMATION_MAX_BEATS).optional(),
  tracks: z.array(animationTrackSchema).min(1).max(ANIMATION_MAX_TRACKS),
}).strict()
export type AnimationSpec = z.infer<typeof animationSpecSchema>

/** The board's current timeline: the spec of the latest successful call, keyed by that call. */
export const boardTimelineSchema = z.object({ id: z.string().min(1), spec: animationSpecSchema }).strict()
export type BoardTimeline = z.infer<typeof boardTimelineSchema>

// ---------------------------------------------------------------- expressions

type Expression = (t: number) => number
const FUNCTIONS: Readonly<Record<string, (...args: number[]) => number>> = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2,
  sqrt: Math.sqrt, abs: Math.abs, exp: Math.exp, log: Math.log, min: Math.min, max: Math.max, pow: Math.pow,
  floor: Math.floor, ceil: Math.ceil, round: Math.round, sign: Math.sign,
}
const CONSTANTS: Readonly<Record<string, number>> = { pi: Math.PI, e: Math.E, tau: Math.PI * 2 }

/**
 * Compile a restricted arithmetic expression of `t`: numbers, `+ - * / ^`, parentheses,
 * the constants pi, e, tau and a fixed set of Math functions. Nothing else is accepted.
 * @throws an Error naming the first unexpected token.
 */
export function compileExpression(source: string): Expression {
  const tokens = source.match(/\d+(?:\.\d+)?(?:e[+-]?\d+)?|\.\d+|[a-z_][a-z0-9_]*|\*\*|[-+*/^(),]|\S/giu) ?? []
  let index = 0
  const peek = () => tokens[index]
  const take = (expected?: string) => {
    const token = tokens[index]
    if (token === undefined || (expected !== undefined && token !== expected)) throw new Error(`expression "${source}": expected ${expected ?? 'a value'} at ${token ?? 'end'}`)
    index += 1
    return token
  }
  const primary = (): Expression => {
    const token = take()
    if (/^(?:\d|\.\d)/u.test(token)) { const value = Number(token); return () => value }
    if (token === '(') { const inner = sum(); take(')'); return inner }
    if (token === '-') { const inner = power(); return t => -inner(t) }
    if (token === '+') return power()
    const name = token.toLowerCase()
    if (name === 't') return t => t
    if (Object.hasOwn(CONSTANTS, name)) { const value = CONSTANTS[name]!; return () => value }
    if (Object.hasOwn(FUNCTIONS, name)) {
      const fn = FUNCTIONS[name]!
      take('(')
      const args: Expression[] = [sum()]
      while (peek() === ',') { take(','); args.push(sum()) }
      take(')')
      return t => fn(...args.map(arg => arg(t)))
    }
    throw new Error(`expression "${source}": unknown name or symbol "${token}"`)
  }
  const power = (): Expression => {
    const base = primary()
    if (peek() === '^' || peek() === '**') { take(); const exponent = power(); return t => base(t) ** exponent(t) }
    return base
  }
  const product = (): Expression => {
    let left = power()
    while (peek() === '*' || peek() === '/') {
      const op = take()
      const right = power()
      const previous = left
      left = op === '*' ? t => previous(t) * right(t) : t => previous(t) / right(t)
    }
    return left
  }
  const sum = (): Expression => {
    let left = product()
    while (peek() === '+' || peek() === '-') {
      const op = take()
      const right = product()
      const previous = left
      left = op === '+' ? t => previous(t) + right(t) : t => previous(t) - right(t)
    }
    return left
  }
  const expression = sum()
  if (index !== tokens.length) throw new Error(`expression "${source}": unexpected "${tokens[index]}"`)
  return expression
}

// ---------------------------------------------------------------- SVG paths

interface Point { readonly x: number; readonly y: number }
/** A sampled path: points with cumulative arc length. */
export interface SampledPath { readonly points: readonly Point[]; readonly lengths: readonly number[]; readonly total: number }

const CURVE_STEPS = 24

function arcPoints(from: Point, rx: number, ry: number, rotation: number, large: boolean, sweep: boolean, to: Point): Point[] {
  if (rx === 0 || ry === 0) return [to]
  const phi = rotation * Math.PI / 180
  const cos = Math.cos(phi)
  const sin = Math.sin(phi)
  const dx = (from.x - to.x) / 2
  const dy = (from.y - to.y) / 2
  const x1 = cos * dx + sin * dy
  const y1 = -sin * dx + cos * dy
  let a = Math.abs(rx)
  let b = Math.abs(ry)
  const lambda = (x1 * x1) / (a * a) + (y1 * y1) / (b * b)
  if (lambda > 1) { a *= Math.sqrt(lambda); b *= Math.sqrt(lambda) }
  const numerator = a * a * b * b - a * a * y1 * y1 - b * b * x1 * x1
  const factor = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, numerator / (a * a * y1 * y1 + b * b * x1 * x1)))
  const cx1 = factor * (a * y1) / b
  const cy1 = factor * -(b * x1) / a
  const cx = cos * cx1 - sin * cy1 + (from.x + to.x) / 2
  const cy = sin * cx1 + cos * cy1 + (from.y + to.y) / 2
  const angle = (ux: number, uy: number, vx: number, vy: number) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy)
  const start = angle(1, 0, (x1 - cx1) / a, (y1 - cy1) / b)
  let delta = angle((x1 - cx1) / a, (y1 - cy1) / b, (-x1 - cx1) / a, (-y1 - cy1) / b)
  if (!sweep && delta > 0) delta -= Math.PI * 2
  if (sweep && delta < 0) delta += Math.PI * 2
  const points: Point[] = []
  for (let step = 1; step <= CURVE_STEPS; step += 1) {
    const theta = start + delta * step / CURVE_STEPS
    points.push({ x: cos * a * Math.cos(theta) - sin * b * Math.sin(theta) + cx, y: sin * a * Math.cos(theta) + cos * b * Math.sin(theta) + cy })
  }
  return points
}

/**
 * Sample an SVG path (M L H V C S Q T A Z, absolute and relative) into a polyline.
 * @throws an Error for unsupported commands or malformed numbers.
 */
export function samplePath(d: string): SampledPath {
  const tokens = d.match(/[a-z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/giu) ?? []
  if (tokens.join('').length < d.replace(/[\s,]/gu, '').length) throw new Error('path contains unsupported characters')
  const points: Point[] = []
  let index = 0
  let command = ''
  let current: Point = { x: 0, y: 0 }
  let start: Point = { x: 0, y: 0 }
  let control: Point | null = null
  const number = () => {
    const token = tokens[index]
    if (token === undefined || /^[a-z]$/iu.test(token)) throw new Error(`path command ${command} is missing a number`)
    index += 1
    return Number(token)
  }
  const flag = () => number() !== 0
  while (index < tokens.length) {
    if (/^[a-z]$/iu.test(tokens[index]!)) command = tokens[index++]!
    else if (command === '') throw new Error('path must start with a command')
    const relative = command === command.toLowerCase()
    const base = relative ? current : { x: 0, y: 0 }
    const at = (x: number, y: number): Point => ({ x: base.x + x, y: base.y + y })
    switch (command.toUpperCase()) {
      case 'M': {
        current = at(number(), number()); start = current; points.push(current); control = null
        command = relative ? 'l' : 'L'
        break
      }
      case 'L': current = at(number(), number()); points.push(current); control = null; break
      case 'H': current = { x: (relative ? current.x : 0) + number(), y: current.y }; points.push(current); control = null; break
      case 'V': current = { x: current.x, y: (relative ? current.y : 0) + number() }; points.push(current); control = null; break
      case 'Z': current = start; points.push(current); control = null; break
      case 'C': case 'S': {
        const first: Point = command.toUpperCase() === 'C' ? at(number(), number()) : control === null ? current : { x: 2 * current.x - control.x, y: 2 * current.y - control.y }
        const second = at(number(), number())
        const end = at(number(), number())
        for (let step = 1; step <= CURVE_STEPS; step += 1) {
          const s = step / CURVE_STEPS
          const r = 1 - s
          points.push({ x: r ** 3 * current.x + 3 * r * r * s * first.x + 3 * r * s * s * second.x + s ** 3 * end.x, y: r ** 3 * current.y + 3 * r * r * s * first.y + 3 * r * s * s * second.y + s ** 3 * end.y })
        }
        control = second; current = end
        break
      }
      case 'Q': case 'T': {
        const middle: Point = command.toUpperCase() === 'Q' ? at(number(), number()) : control === null ? current : { x: 2 * current.x - control.x, y: 2 * current.y - control.y }
        const end = at(number(), number())
        for (let step = 1; step <= CURVE_STEPS; step += 1) {
          const s = step / CURVE_STEPS
          const r = 1 - s
          points.push({ x: r * r * current.x + 2 * r * s * middle.x + s * s * end.x, y: r * r * current.y + 2 * r * s * middle.y + s * s * end.y })
        }
        control = middle; current = end
        break
      }
      case 'A': {
        const rx = number(); const ry = number(); const rotation = number(); const large = flag(); const sweep = flag()
        const end = at(number(), number())
        points.push(...arcPoints(current, rx, ry, rotation, large, sweep, end))
        current = end; control = null
        break
      }
      default: throw new Error(`unsupported path command ${command}`)
    }
    if (command.toUpperCase() === 'Z' && index < tokens.length && !/^[a-z]$/iu.test(tokens[index]!)) throw new Error('numbers after Z need a command')
  }
  if (points.length < 2) throw new Error('path needs at least two points')
  if (points.some(point => !Number.isFinite(point.x) || !Number.isFinite(point.y))) throw new Error('path has non-finite coordinates')
  const lengths = [0]
  for (let i = 1; i < points.length; i += 1) lengths.push(lengths[i - 1]! + Math.hypot(points[i]!.x - points[i - 1]!.x, points[i]!.y - points[i - 1]!.y))
  return { points, lengths, total: lengths.at(-1)! }
}

/** Position and tangent angle (degrees) at a fraction of a sampled path's length. */
export function pointAlong(path: SampledPath, fraction: number): { readonly x: number, readonly y: number, readonly angle: number } {
  const target = Math.min(1, Math.max(0, fraction)) * path.total
  let i = 1
  while (i < path.points.length - 1 && path.lengths[i]! < target) i += 1
  const a = path.points[i - 1]!
  const b = path.points[i]!
  const span = path.lengths[i]! - path.lengths[i - 1]!
  const local = span === 0 ? 0 : (target - path.lengths[i - 1]!) / span
  return { x: a.x + (b.x - a.x) * local, y: a.y + (b.y - a.y) * local, angle: Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI }
}

// ---------------------------------------------------------------- sampling

/** Render-ready transform of one element at one time. */
export interface ElementFrame {
  /** Translation in canvas percent. */
  readonly dx: number
  readonly dy: number
  readonly scale: number
  readonly rotate: number
  readonly opacity: number
  /** Hidden fraction (0-100) clipped from `clipSide`. */
  readonly clip: number
  readonly clipSide: 'left' | 'right' | 'top' | 'bottom'
  /** Highlight glow strength, 0-1. */
  readonly glow: number
}

type Prop = 'dx' | 'dy' | 'scale' | 'rotate' | 'opacity' | 'clip' | 'glow' | 'slideX' | 'slideY'
const BASE: Readonly<Record<Prop, number>> = { dx: 0, dy: 0, scale: 1, rotate: 0, opacity: 1, clip: 0, glow: 0, slideX: 0, slideY: 0 }

interface Segment {
  readonly start: number
  readonly end: number
  /** Value shown before the segment starts when it is the first for its property. */
  readonly before?: number
  readonly at: (t: number, from: number) => number
}

interface CompiledElement {
  readonly segments: ReadonlyMap<Prop, readonly Segment[]>
  /** Value of each segment's property at its start, from the segments before it. */
  readonly from: ReadonlyMap<Segment, number>
  readonly clipSide: ElementFrame['clipSide']
}

/** A timeline compiled against the board element envelopes it animates. */
export interface CompiledTimeline {
  readonly durationMs: number
  readonly loop: boolean
  readonly beats: readonly { readonly atMs: number, readonly caption: string }[]
  readonly elements: ReadonlyMap<string, CompiledElement>
}

/** Envelope fields a timeline needs from each target. */
export interface AnimationTargetEnvelope { readonly id: string; readonly x: number; readonly y: number; readonly w: number; readonly h: number }

function ease(kind: AnimationEasing, p: number): number {
  if (kind === 'ease-in') return p ** 3
  if (kind === 'ease-out') return 1 - (1 - p) ** 3
  if (kind === 'ease-in-out') return p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2
  return p
}

const lerp = (a: number, b: number, p: number) => a + (b - a) * p

function direction(value: AnimationTrack['direction']): { readonly x: number, readonly y: number } {
  if (value === 'left') return { x: -1, y: 0 }
  if (value === 'right') return { x: 1, y: 0 }
  if (value === 'up') return { x: 0, y: -1 }
  return { x: 0, y: 1 }
}

function valueAt(segments: readonly Segment[], from: ReadonlyMap<Segment, number>, base: number, t: number): number {
  let active: Segment | undefined
  for (const segment of segments) {
    if (segment.start > t) break
    active = segment
  }
  if (active === undefined) return segments[0]?.before ?? base
  return active.at(t, from.get(active) ?? base)
}

/**
 * Validate and compile a timeline against the current board.
 * @param spec - parsed timeline spec.
 * @param targets - current board element envelopes.
 * @returns the compiled timeline.
 * @throws an Error describing the first invalid track.
 */
export function compileTimeline(spec: AnimationSpec, targets: readonly AnimationTargetEnvelope[]): CompiledTimeline {
  const byId = new Map(targets.map(target => [target.id, target]))
  const pending = new Map<string, Map<Prop, Segment[]>>()
  const clipSides = new Map<string, ElementFrame['clipSide']>()
  spec.tracks.forEach((track, index) => {
    const label = `track ${index + 1} (${track.verb} ${track.target})`
    const target = byId.get(track.target)
    if (target === undefined) throw new Error(`${label}: no board element with id "${track.target}"`)
    const cx = target.x + target.w / 2
    const cy = target.y + target.h / 2
    const start = track.startMs ?? 0
    const end = track.endMs ?? spec.durationMs
    if (track.verb !== 'keyframes' && (end <= start || end > spec.durationMs)) throw new Error(`${label}: needs 0 <= startMs < endMs <= durationMs`)
    const easing = track.easing ?? (track.verb === 'follow' || track.verb === 'parametric' ? 'linear' : 'ease-in-out')
    const progress = (t: number) => ease(easing, Math.min(1, Math.max(0, (t - start) / (end - start))))
    const props = pending.get(track.target) ?? new Map<Prop, Segment[]>()
    pending.set(track.target, props)
    const add = (prop: Prop, segment: Segment) => { props.set(prop, [...(props.get(prop) ?? []), segment]) }
    const require = <T>(value: T | undefined, name: string): T => {
      if (value === undefined) throw new Error(`${label}: ${track.verb} requires ${name}`)
      return value
    }
    switch (track.verb) {
      case 'appear': case 'disappear': {
        const showing = track.verb === 'appear'
        add('opacity', { start, end, ...(showing ? { before: 0 } : {}), at: (t, from) => showing ? progress(t) : lerp(from, 0, progress(t)) })
        if (track.direction !== undefined) {
          const unit = direction(track.direction)
          // appear slides in from the opposite side of its direction; disappear slides out along it.
          add('slideX', { start, end, at: t => (showing ? -unit.x * (1 - progress(t)) : unit.x * progress(t)) * SLIDE_DISTANCE })
          add('slideY', { start, end, at: t => (showing ? -unit.y * (1 - progress(t)) : unit.y * progress(t)) * SLIDE_DISTANCE })
        }
        break
      }
      case 'move': {
        const to = require(track.to, 'to')
        add('dx', { start, end, at: (t, from) => lerp(from, to.x - cx, progress(t)) })
        add('dy', { start, end, at: (t, from) => lerp(from, to.y - cy, progress(t)) })
        break
      }
      case 'scale': {
        const factor = require(track.scale, 'scale')
        add('scale', { start, end, at: (t, from) => lerp(from, factor, progress(t)) })
        break
      }
      case 'rotate': {
        const degrees = require(track.degrees, 'degrees')
        add('rotate', { start, end, at: (t, from) => from + degrees * progress(t) })
        break
      }
      case 'highlight':
        add('glow', { start, end, at: t => (t >= end ? 0 : Math.sin(Math.PI * Math.min(1, Math.max(0, (t - start) / (end - start))))) })
        break
      case 'reveal': {
        const side = track.direction ?? 'right'
        // Revealing toward the right hides the right side first; the hidden side is where the wipe goes.
        clipSides.set(track.target, side === 'right' ? 'right' : side === 'left' ? 'left' : side === 'up' ? 'top' : 'bottom')
        add('clip', { start, end, before: 100, at: t => 100 * (1 - progress(t)) })
        break
      }
      case 'follow': {
        let path: SampledPath
        try { path = samplePath(require(track.path, 'path')) }
        catch (error) { throw new Error(`${label}: ${error instanceof Error ? error.message : String(error)}`) }
        add('dx', { start, end, at: t => pointAlong(path, progress(t)).x - cx })
        add('dy', { start, end, at: t => pointAlong(path, progress(t)).y - cy })
        if (track.orient === true) add('rotate', { start, end, at: t => pointAlong(path, progress(t)).angle })
        break
      }
      case 'parametric': {
        let x: Expression
        let y: Expression
        try { x = compileExpression(require(track.x, 'x')); y = compileExpression(require(track.y, 'y')) }
        catch (error) { throw new Error(`${label}: ${error instanceof Error ? error.message : String(error)}`) }
        const [t0, t1] = track.t ?? [0, 1]
        const param = (t: number) => lerp(t0, t1, Math.min(1, Math.max(0, (t - start) / (end - start))))
        for (let step = 0; step <= 16; step += 1) {
          const value = lerp(t0, t1, step / 16)
          if (!Number.isFinite(x(value)) || !Number.isFinite(y(value))) throw new Error(`${label}: x or y is not finite at t = ${value}`)
        }
        add('dx', { start, end, at: t => x(param(t)) - cx })
        add('dy', { start, end, at: t => y(param(t)) - cy })
        break
      }
      case 'keyframes': {
        const frames = [...require(track.frames, 'frames')].sort((a, b) => a.atMs - b.atMs)
        if (frames.some(frame => frame.atMs > spec.durationMs)) throw new Error(`${label}: frame atMs exceeds durationMs`)
        const channels: readonly [Prop, (frame: typeof frames[number]) => number | undefined][] = [
          ['dx', frame => frame.x === undefined ? undefined : frame.x - cx],
          ['dy', frame => frame.y === undefined ? undefined : frame.y - cy],
          ['opacity', frame => frame.opacity],
          ['scale', frame => frame.scale],
          ['rotate', frame => frame.rotate],
        ]
        for (const [prop, read] of channels) {
          const stops = frames.flatMap(frame => { const value = read(frame); return value === undefined ? [] : [{ at: frame.atMs, value }] })
          if (stops.length === 0) continue
          const first = stops[0]!
          const last = stops.at(-1)!
          add(prop, {
            start: first.at,
            end: Math.max(first.at + 1, last.at),
            at: t => {
              if (t >= last.at) return last.value
              let i = 1
              while (i < stops.length - 1 && stops[i]!.at <= t) i += 1
              const a = stops[i - 1]!
              const b = stops[i]!
              return lerp(a.value, b.value, ease(easing, b.at === a.at ? 1 : Math.min(1, Math.max(0, (t - a.at) / (b.at - a.at)))))
            },
          })
        }
        break
      }
      default: return track.verb satisfies never
    }
  })
  const elements = new Map<string, CompiledElement>()
  for (const [id, props] of pending) {
    const segments = new Map<Prop, readonly Segment[]>()
    const from = new Map<Segment, number>()
    for (const [prop, list] of props) {
      const sorted = [...list].sort((a, b) => a.start - b.start)
      sorted.forEach((segment, index) => { from.set(segment, valueAt(sorted.slice(0, index), from, BASE[prop], segment.start)) })
      segments.set(prop, sorted)
    }
    elements.set(id, { segments, from, clipSide: clipSides.get(id) ?? 'right' })
  }
  return {
    durationMs: spec.durationMs,
    loop: spec.loop ?? false,
    beats: [...(spec.beats ?? [])].sort((a, b) => a.atMs - b.atMs),
    elements,
  }
}

/**
 * Sample every animated element at one time.
 * @param timeline - compiled timeline.
 * @param atMs - time within the timeline; clamped to its duration.
 * @returns frames keyed by element id; elements without tracks are absent.
 */
export function sampleTimeline(timeline: CompiledTimeline, atMs: number): Map<string, ElementFrame> {
  const t = Math.min(timeline.durationMs, Math.max(0, atMs))
  const frames = new Map<string, ElementFrame>()
  for (const [id, element] of timeline.elements) {
    const read = (prop: Prop) => valueAt(element.segments.get(prop) ?? [], element.from, BASE[prop], t)
    frames.set(id, {
      dx: read('dx') + read('slideX'),
      dy: read('dy') + read('slideY'),
      scale: read('scale'),
      rotate: read('rotate'),
      opacity: Math.min(1, Math.max(0, read('opacity'))),
      clip: Math.min(100, Math.max(0, read('clip'))),
      clipSide: element.clipSide,
      glow: Math.min(1, Math.max(0, read('glow'))),
    })
  }
  return frames
}

/** Caption of the latest beat at or before a time, or null. */
export function beatAt(timeline: CompiledTimeline, atMs: number): string | null {
  let caption: string | null = null
  for (const beat of timeline.beats) if (beat.atMs <= atMs) caption = beat.caption
  return caption
}

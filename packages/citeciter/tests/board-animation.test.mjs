import assert from 'node:assert/strict'
import test from 'node:test'

import { animationSpecSchema, beatAt, compileExpression, compileTimeline, pointAlong, sampleTimeline, samplePath } from '../lib/types/board-animation.js'
import { projectBoardFromLog } from '../lib/types/topic-log.js'
import { frameStyle } from '../lib/types/client/board-timeline.js'

const ball = { id: 'ball', x: 0, y: 70, w: 10, h: 10 } // center (5, 75)
const label = { id: 'label', x: 40, y: 10, w: 20, h: 10 }
const close = (actual, expected, epsilon = 1e-6) => assert.ok(Math.abs(actual - expected) < epsilon, `${actual} ≈ ${expected}`)

test('restricted expressions evaluate arithmetic of t and refuse everything else', () => {
  close(compileExpression('10 + 30*t')(0.5), 25)
  close(compileExpression('80 - 60*t + 30*t^2')(1), 50)
  close(compileExpression('2^3^2')(0), 512)
  close(compileExpression('-t^2')(3), -9)
  close(compileExpression('max(sin(pi/2), 0.5) * tau')(0), Math.PI * 2)
  assert.throws(() => compileExpression('constructor'), /unknown name/u)
  assert.throws(() => compileExpression('t; process.exit()'), /unknown name or symbol|unexpected/u)
  assert.throws(() => compileExpression('(t'), /expected \)/u)
})

test('SVG paths sample lines, curves and arcs in canvas percent', () => {
  const line = samplePath('M0 0 L10 0 l0 10')
  close(line.total, 20)
  const mid = pointAlong(line, 0.5)
  close(mid.x, 10); close(mid.y, 0)
  close(pointAlong(line, 0.75).angle, 90)
  const arc = samplePath('M 10 50 A 40 40 0 0 1 90 50')
  close(arc.total, Math.PI * 40, 0.5)
  const top = pointAlong(arc, 0.5)
  close(top.x, 50, 0.5); close(top.y, 10, 0.5)
  assert.ok(samplePath('M0 0 Q 50 100 100 0 T 200 0').total > 200)
  assert.throws(() => samplePath('M0 0 X 1 2'), /unsupported/u)
  assert.throws(() => samplePath('L 1 2'), /path|command/u)
})

test('verbs hand over in start order and hold their end state', () => {
  const spec = animationSpecSchema.parse({
    durationMs: 3000,
    beats: [{ atMs: 0, caption: 'start' }, { atMs: 2000, caption: 'later' }],
    tracks: [
      { target: 'label', verb: 'appear', startMs: 0, endMs: 1000, easing: 'linear' },
      { target: 'ball', verb: 'move', to: { x: 55, y: 75 }, startMs: 0, endMs: 1000, easing: 'linear' },
      { target: 'ball', verb: 'move', to: { x: 55, y: 25 }, startMs: 1000, endMs: 2000, easing: 'linear' },
      { target: 'ball', verb: 'rotate', degrees: 90, startMs: 2000, endMs: 3000, easing: 'linear' },
      { target: 'label', verb: 'highlight', startMs: 2000, endMs: 3000 },
    ],
  })
  const timeline = compileTimeline(spec, [ball, label])
  const at = ms => sampleTimeline(timeline, ms)
  assert.equal(at(0).get('label').opacity, 0)
  close(at(500).get('label').opacity, 0.5)
  close(at(500).get('ball').dx, 25)
  close(at(1500).get('ball').dx, 50)
  close(at(1500).get('ball').dy, -25)
  close(at(2500).get('ball').rotate, 45)
  close(at(2500).get('label').glow, 1)
  close(at(3000).get('label').glow, 0)
  close(at(3000).get('ball').dy, -50)
  assert.equal(beatAt(timeline, 2500), 'later')
  assert.equal(beatAt(timeline, 10), 'start')
})

test('follow, parametric, reveal and keyframes position the element center', () => {
  const timeline = compileTimeline(animationSpecSchema.parse({
    durationMs: 1000,
    tracks: [
      { target: 'ball', verb: 'follow', path: 'M5 75 L45 75', orient: true },
      { target: 'label', verb: 'reveal', direction: 'right', endMs: 500, easing: 'linear' },
      { target: 'label', verb: 'keyframes', frames: [{ atMs: 500, opacity: 1, y: 15 }, { atMs: 1000, opacity: 0.2, y: 35 }], easing: 'linear' },
    ],
  }), [ball, label])
  const mid = sampleTimeline(timeline, 500)
  close(mid.get('ball').dx, 20)
  close(mid.get('ball').rotate, 0)
  close(sampleTimeline(timeline, 0).get('label').clip, 100)
  close(sampleTimeline(timeline, 250).get('label').clip, 50)
  close(sampleTimeline(timeline, 750).get('label').opacity, 0.6)
  close(sampleTimeline(timeline, 750).get('label').dy, 10)

  const projectile = compileTimeline(animationSpecSchema.parse({
    durationMs: 2000,
    tracks: [{ target: 'ball', verb: 'parametric', x: '5 + 40*t', y: '75 - 60*t + 30*t^2', t: [0, 2] }],
  }), [ball])
  close(sampleTimeline(projectile, 1000).get('ball').dx, 40)
  close(sampleTimeline(projectile, 1000).get('ball').dy, -30)
})

test('invalid timelines name the offending track', () => {
  const compile = tracks => compileTimeline(animationSpecSchema.parse({ durationMs: 1000, tracks }), [ball])
  assert.throws(() => compile([{ target: 'ghost', verb: 'appear' }]), /track 1 \(appear ghost\): no board element/u)
  assert.throws(() => compile([{ target: 'ball', verb: 'move' }]), /requires to/u)
  assert.throws(() => compile([{ target: 'ball', verb: 'scale', scale: 2, startMs: 900, endMs: 1200 }]), /durationMs/u)
  assert.throws(() => compile([{ target: 'ball', verb: 'parametric', x: 'log(t-1)', y: '1' }]), /not finite/u)
  assert.throws(() => animationSpecSchema.parse({ durationMs: 1000, tracks: [{ target: 'ball', verb: 'appear', script: 'x' }] }))
})

test('frame styles convert canvas percent into element percent', () => {
  const style = frameStyle({ dx: 5, dy: -10, scale: 2, rotate: 30, opacity: 0.5, clip: 25, clipSide: 'top', glow: 0 }, { w: 10, h: 20 })
  assert.equal(style.transform, 'translate(50%, -50%) rotate(30deg) scale(2)')
  assert.equal(style.clipPath, 'inset(25% 0 0 0)')
  assert.equal(style.opacity, 0.5)
  assert.equal('filter' in style, false)
})

function call(seq, callId, name, args) {
  return { seq, time: seq, type: 'tool/call', data: { turn: 1, step: 1, callId, name, arguments: JSON.stringify(args) } }
}
function result(seq, callId, isError = false) {
  return { seq, time: seq, type: 'tool/result', data: { turn: 1, step: 1, message: { id: `r${seq}`, role: 'user', source: { kind: 'tool', callId }, toolCallId: callId, isError, content: [{ type: 'text', text: '{}' }] } } }
}

test('the board projection keeps the latest valid timeline and drops it when the board is cleared', () => {
  const draw = { ops: [{ op: 'set', id: 'ball', kind: 'text', content: '●', x: 0, y: 70, w: 10, h: 10 }] }
  const animate = { durationMs: 1000, tracks: [{ target: 'ball', verb: 'appear' }] }
  const log = events => projectBoardFromLog({ header: {}, events, inheritedEventCount: 0 })
  const animated = log([call(0, 'a', 'blackboard_apply', draw), result(1, 'a'), call(2, 'b', 'blackboard_animate', animate), result(3, 'b')])
  assert.equal(animated.revision, 2)
  assert.deepEqual(animated.timeline, { id: 'b', spec: animate })
  const orphan = log([call(0, 'b', 'blackboard_animate', animate), result(1, 'b')])
  assert.equal(orphan.timeline, null)
  assert.equal(orphan.invalid, 1)
  const cleared = log([call(0, 'a', 'blackboard_apply', draw), result(1, 'a'), call(2, 'b', 'blackboard_animate', animate), result(3, 'b'), call(4, 'c', 'blackboard_apply', { ops: [{ op: 'clear' }] }), result(5, 'c')])
  assert.equal(cleared.timeline, null)
})

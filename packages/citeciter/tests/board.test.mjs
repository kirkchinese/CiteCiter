import assert from 'node:assert/strict'
import test from 'node:test'

import {
  applyBoardOps,
  boardBatchSchema,
  boardOpSchema,
  boardSnapshotSchema,
  EMPTY_BOARD_STATE,
  foldBoardElements,
  foldBoardSnapshot,
} from '../lib/types/board.js'

function set(id, overrides = {}) {
  return {
    op: 'set',
    id,
    kind: 'text',
    content: `内容 ${id}`,
    x: 4,
    y: 4,
    w: 42,
    h: 8,
    ...overrides,
  }
}

test('board ops validate the v4 tool-only protocol', () => {
  const ops = [
    set('a', { kind: 'math', content: 'R = 0', style: { color: '#f2ead8', fontSize: '15px' } }),
    { op: 'update', id: 'a', content: 'R > 0', x: 6 },
    { op: 'animate', id: 'a', animation: 'pulse', durationMs: 600, iterations: 2 },
    { op: 'focus', id: 'a' },
    { op: 'focus', id: null },
    { op: 'remove', id: 'a' },
    { op: 'clear_region', x: 0, y: 0, w: 100, h: 40 },
    { op: 'clear' },
  ]
  assert.deepEqual(boardBatchSchema.parse(ops), ops)
  assert.throws(() => boardBatchSchema.parse([]))
  assert.throws(() => boardBatchSchema.parse(Array.from({ length: 51 }, () => ({ op: 'clear' }))))
  assert.throws(() => boardOpSchema.parse({ op: 'reveal', ids: ['a'] }))
  assert.throws(() => boardOpSchema.parse({ op: 'update', id: 'a' }))
  assert.throws(() => boardOpSchema.parse({ op: 'update', id: 'a', style: {} }))
  assert.throws(() => boardOpSchema.parse({ ...set('b'), kind: 'script' }))
  assert.throws(() => boardOpSchema.parse({ ...set('b'), x: 70, w: 31 }))
  assert.throws(() => boardOpSchema.parse({ ...set('b'), y: 95, h: 6 }))
  assert.throws(() => boardOpSchema.parse({ ...set('b'), style: { background: 'url(http://evil)' } }))
  assert.throws(() => boardOpSchema.parse({ ...set('b'), style: { fontSize: 'expression(alert(1))' } }))
  assert.throws(() => boardOpSchema.parse({ op: 'animate', id: 'b', animation: 'spin' }))
  assert.throws(() => boardOpSchema.parse(set('b', { kind: 'image', content: 'https://evil/x.png' })))
  assert.throws(() => boardOpSchema.parse(set('b', { kind: 'table', content: 'not a table' })))
  assert.doesNotThrow(() => boardOpSchema.parse(set('b', { kind: 'image', content: 'data:image/png;base64,iVBORw0KGgo=' })))
  assert.doesNotThrow(() => boardOpSchema.parse(set('b', { kind: 'table', content: '| a | b |\n|---|---|\n| 1 | 2 |' })))
})

test('board batches fold atomically and reject unknown stateful targets', () => {
  const first = applyBoardOps(EMPTY_BOARD_STATE, [
    set('a', { x: 0, y: 0, w: 50, h: 20 }),
    set('b', { x: 40, y: 10, w: 30, h: 20 }),
    set('c', { x: 0, y: 60, w: 20, h: 20 }),
  ])
  assert.equal(first.revision, 3)
  assert.deepEqual([...first.state.keys()], ['a', 'b', 'c'])

  const region = applyBoardOps(first.state, [
    { op: 'clear_region', x: 30, y: 5, w: 30, h: 30 },
  ])
  assert.equal(region.state.has('a'), false)
  assert.equal(region.state.has('b'), false)
  assert.equal(region.state.has('c'), true)

  for (const op of [
    { op: 'update', id: 'missing', content: 'x' },
    { op: 'animate', id: 'missing', animation: 'pulse' },
    { op: 'focus', id: 'missing' },
  ]) {
    assert.throws(() => applyBoardOps(region.state, [set('temporary'), op]))
    assert.deepEqual([...region.state.keys()], ['c'])
  }
  assert.doesNotThrow(() => applyBoardOps(region.state, [{ op: 'remove', id: 'missing' }]))
  assert.throws(() => applyBoardOps(region.state, [{ op: 'update', id: 'c', y: 90, h: 20 }]))

  const focused = applyBoardOps(region.state, [{ op: 'focus', id: 'c' }]).state
  assert.equal(focused.get('c')?.focused, true)
  assert.equal(applyBoardOps(focused, [{ op: 'focus', id: null }]).state.get('c')?.focused, false)
})

test('board batches enforce final element and content budgets', () => {
  const full = applyBoardOps(EMPTY_BOARD_STATE, Array.from(
    { length: 50 },
    (_, index) => set(String(index), { x: 0, y: 0, w: 1, h: 1 }),
  )).state
  assert.throws(() => applyBoardOps(full, [set('overflow')]))
  assert.throws(() => applyBoardOps(EMPTY_BOARD_STATE, [
    set('a', { content: '字'.repeat(90_000) }),
    set('b', { content: '字'.repeat(90_000) }),
  ]))
})

test('board snapshots carry final elements instead of replay history', () => {
  const elements = foldBoardElements([
    set('a', { content: '旧' }),
    { op: 'update', id: 'a', content: '新' },
    set('b', { content: '板书' }),
    { op: 'focus', id: 'b' },
    { op: 'animate', id: 'b', animation: 'highlight', durationMs: 300 },
  ])
  const snapshot = boardSnapshotSchema.parse({
    version: 4,
    revision: 2,
    elements,
    invalid: 0,
  })
  const folded = foldBoardSnapshot(snapshot)
  assert.equal(folded.revision, 2)
  assert.equal(Object.hasOwn(folded.elements[0], 'animation'), false)
  assert.deepEqual(folded.elements.map((element) => [element.id, element.content]), [
    ['a', '新'],
    ['b', '板书'],
  ])
  assert.equal(folded.elements.find((element) => element.id === 'b')?.focused, true)
  assert.equal(folded.elements.find((element) => element.id === 'b')?.animation?.name, 'highlight')
  assert.throws(() => boardSnapshotSchema.parse({ ...snapshot, version: 3 }))
  assert.throws(() => boardSnapshotSchema.parse({ ...snapshot, ops: [] }))
})

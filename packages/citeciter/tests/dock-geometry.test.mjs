import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveDockGeometry } from '../lib/types/client/dock-geometry.js'

test('large ratios reserve 480 CSS pixels for conversation and preserve open details', () => {
  for (const width of [1440, 1920, 2560]) {
    const view = { width, height: 900, sidebar: 260, details: 320, caption: 38, percent: 55 }
    const result = resolveDockGeometry(view)
    assert.equal(result.mode, 'columns')
    assert.ok(width - view.sidebar - view.details - result.width >= 480)
    assert.equal(result.top, 38)
    assert.equal(result.top + result.height, view.height)
  }
})

test('narrow and zoomed windows allocate a bottom row with the conversation still visible', () => {
  for (const width of [320, 768, 1024, 1280]) {
    const view = { width, height: 640, sidebar: 260, details: 320, caption: 38, percent: 55 }
    const result = resolveDockGeometry(view)
    assert.equal(result.mode, 'rows')
    assert.equal(result.width, width)
    assert.ok(result.top - view.caption >= 260)
    assert.equal(result.top + result.height, view.height)
  }
})

test('collapsed sidebar enables columns again without changing the saved ratio', () => {
  const view = { width: 1000, height: 700, sidebar: 260, details: 0, caption: 0, percent: 55 }
  assert.equal(resolveDockGeometry(view).mode, 'rows')
  assert.deepEqual(resolveDockGeometry({ ...view, sidebar: 48 }), { mode: 'columns', width: 472, height: 700, top: 0 })
})

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

test('narrow windows use the compact page beside the sidebar', () => {
  for (const width of [320, 768, 1024]) {
    const view = { width, height: 640, sidebar: 260, details: 0, caption: 38, percent: 55 }
    assert.deepEqual(resolveDockGeometry(view), { mode: 'page', width: Math.max(0, width - 260), height: 602, top: 38 })
  }
})

test('open native details take priority in a narrow window unless Citer was explicitly chosen', () => {
  const view = { width: 1000, height: 700, sidebar: 260, details: 320, caption: 0, percent: 55 }
  assert.equal(resolveDockGeometry(view).mode, 'suspended')
  assert.equal(resolveDockGeometry({ ...view, preferDetails: true }).mode, 'suspended')
  assert.equal(resolveDockGeometry({ ...view, preferDetails: false }).mode, 'page')
})

test('collapsing the sidebar enables columns again without changing the saved ratio', () => {
  const view = { width: 1000, height: 700, sidebar: 260, details: 0, caption: 0, percent: 55 }
  assert.equal(resolveDockGeometry(view).mode, 'page')
  assert.deepEqual(resolveDockGeometry({ ...view, sidebar: 48 }), { mode: 'columns', width: 472, height: 700, top: 0 })
})

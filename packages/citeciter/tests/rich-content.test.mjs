import assert from 'node:assert/strict'
import test from 'node:test'
import { isSafeSvg, isolatedHtmlDocument, splitRichContent } from '../lib/types/client/rich-content.js'

test('splitRichContent preserves prose and lifts a complete safe SVG fence', () => {
  const segments = splitRichContent([
    'Before diagram.',
    '```svg',
    '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" /></svg>',
    '```',
    'After diagram.',
  ].join('\n'))
  assert.deepEqual(segments.map((segment) => segment.kind), ['markdown', 'svg', 'markdown'])
  assert.equal(segments[1].dataUrl.startsWith('data:image/svg+xml;charset=utf-8,'), true)
})

test('unsafe SVG remains Markdown rather than becoming a preview', () => {
  for (const source of [
    '<svg><script>alert(1)</script></svg>',
    '<svg onload="alert(1)"></svg>',
    '<svg><foreignObject><div>unsafe</div></foreignObject></svg>',
    '<svg><use href="https://example.test/shape.svg#x" /></svg>',
    '<svg><rect style="fill:url(https://example.test/pattern)" /></svg>',
  ]) {
    assert.equal(isSafeSvg(source), false)
    const [segment] = splitRichContent(`\`\`\`svg\n${source}\n\`\`\``)
    assert.equal(segment.kind, 'markdown')
  }
})

test('HTML previews are wrapped in a network-free CSP document', () => {
  const document = isolatedHtmlDocument('<h1>Demo</h1>')
  assert.match(document, /default-src 'none'/)
  assert.match(document, /img-src data:/)
  assert.match(document, /<h1>Demo<\/h1>/)
  const [segment] = splitRichContent('```html\n<h1>Demo</h1>\n```')
  assert.equal(segment.kind, 'html')
})

test('an incomplete rich fence stays with the Markdown renderer while streaming', () => {
  const [segment] = splitRichContent('Before\n```svg\n<svg viewBox="0 0 1 1">')
  assert.equal(segment.kind, 'markdown')
})

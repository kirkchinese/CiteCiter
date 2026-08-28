import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { resolveCitationRange } from '../lib/types/citation-mapping.js'
import { markdownSourceCandidates } from '../lib/types/client/markdown-source-map.js'
import { isCurrentTopicResponse, shouldReopenLastTopic } from '../lib/types/client/response-guard.js'
import { claimSelectionContextMenu } from '../lib/types/client/selection.js'

class FakeNode {
  static ELEMENT_NODE = 1
  static TEXT_NODE = 3

  constructor(nodeType, text = '') {
    this.nodeType = nodeType
    this.ownText = text
    this.childNodes = []
    this.parentElement = null
  }

  get textContent() {
    return this.nodeType === FakeNode.TEXT_NODE
      ? this.ownText
      : this.childNodes.map((child) => child.textContent ?? '').join('')
  }

  append(...children) {
    for (const child of children) {
      child.parentElement = this
      this.childNodes.push(child)
    }
    return this
  }
}

class FakeElement extends FakeNode {
  constructor(tagName = 'div', dataset = {}, classNames = []) {
    super(FakeNode.ELEMENT_NODE)
    this.tagName = tagName.toUpperCase()
    this.dataset = { ...dataset }
    this.classNames = new Set(classNames)
  }

  matches(selector) {
    return selector.split(',').some((candidate) => this.matchesOne(candidate.trim()))
  }

  matchesOne(selector) {
    if (selector === 'button' || selector === 'pre' || selector === 'sup') {
      return this.tagName === selector.toUpperCase()
    }
    if (selector.startsWith('.')) return this.classNames.has(selector.slice(1))
    const attributes = [...selector.matchAll(/\[data-([a-z-]+)(?:="([^"]*)")?\]/gu)]
    if (attributes.length === 0) return false
    return attributes.every(([, rawName, expected]) => {
      const name = rawName.replaceAll(/-([a-z])/gu, (_, letter) => letter.toUpperCase())
      return Object.hasOwn(this.dataset, name) && (expected === undefined || this.dataset[name] === expected)
    })
  }

  closest(selector) {
    let current = this
    while (current !== null) {
      if (current.matches(selector)) return current
      current = current.parentElement
    }
    return null
  }

  querySelectorAll(selector) {
    const matches = []
    const visit = (node) => {
      for (const child of node.childNodes) {
        if (child instanceof FakeElement && child.matches(selector)) matches.push(child)
        if (child instanceof FakeElement) visit(child)
      }
    }
    visit(this)
    return matches
  }

  contains(candidate) {
    if (candidate === this) return true
    return this.childNodes.some((child) => child === candidate
      || child instanceof FakeElement && child.contains(candidate))
  }
}

class FakeRange {
  constructor(startContainer, startOffset, endContainer, endOffset, text, intersections = []) {
    this.startContainer = startContainer
    this.startOffset = startOffset
    this.endContainer = endContainer
    this.endOffset = endOffset
    this.text = text
    this.intersections = new Set(intersections)
  }

  intersectsNode(node) {
    return this.intersections.has(node)
      || node instanceof FakeElement && (node.contains(this.startContainer) || node.contains(this.endContainer))
  }

  toString() {
    return this.text
  }
}

function text(value) {
  return new FakeNode(FakeNode.TEXT_NODE, value)
}

function contextMenu(target) {
  return {
    target,
    clientX: 41,
    clientY: 73,
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true
    },
  }
}

function withConversationDom(run) {
  const saved = {
    Node: globalThis.Node,
    Element: globalThis.Element,
    document: globalThis.document,
    window: globalThis.window,
  }
  const body = new FakeElement('body')
  let range = null
  globalThis.Node = FakeNode
  globalThis.Element = FakeElement
  globalThis.document = { querySelectorAll: (selector) => body.querySelectorAll(selector) }
  globalThis.window = {
    getSelection: () => range === null ? null : {
      isCollapsed: false,
      rangeCount: 1,
      getRangeAt: () => range,
    },
  }
  try {
    run({ body, setRange: (next) => { range = next } })
  } finally {
    for (const [name, value] of Object.entries(saved)) {
      if (value === undefined) delete globalThis[name]
      else globalThis[name] = value
    }
  }
}

test('the temporary Host-column workaround is scoped and reversible without closing Details', async () => {
  const [panel, styles, entry] = await Promise.all([
    readFile(new URL('../src/client/components/CitePanel.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/client/components/CiteCiter.module.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/client/index.ts', import.meta.url), 'utf8'),
  ])
  assert.match(panel, /function findContainingFrame[\s\S]*?panel\?\.closest<HTMLElement>\('\[data-shell-overlay\]'\)/u)
  assert.match(panel, /function useDockColumn\(panel: RefObject<HTMLElement \| null>/u)
  assert.match(panel, /const owner = crypto\.randomUUID\(\)/u)
  assert.match(panel, /frame\.dataset\.citeciterDocked = owner/u)
  assert.match(panel, /frame\.dataset\.citeciterDocked !== owner/u)
  assert.match(panel, /delete frame\.dataset\.citeciterDocked/u)
  assert.match(panel, /frame\.style\.removeProperty\('--citeciter-sidebar-width'\)/u)
  assert.match(panel, /frame\.style\.removeProperty\('--citeciter-dock-width'\)/u)
  assert.match(styles, /:global\(\[data-citeciter-docked\]\)[\s\S]*?var\(--citeciter-dock-width\) !important/u)
  assert.match(styles, /:global\(\[data-citeciter-docked\] > \[data-side="details"\]\)[\s\S]*?display: none !important/u)
  assert.match(styles, /:global\(\[data-citeciter-docked\] > :has\(\+ \[data-shell-overlay\]\)\)[\s\S]*?visibility: hidden !important/u)
  assert.doesNotMatch(styles, /\[data-citeciter-docked\][^\n]*:nth-child/u)
  assert.doesNotMatch(entry, /layout\.closeDetails|data-side=["']details/u)
})

test('the Host-column workaround concedes whenever the panel and conversation fit', async () => {
  const panel = await readFile(new URL('../src/client/components/CitePanel.tsx', import.meta.url), 'utf8')
  assert.match(panel, /const available = frameWidth - sidebarWidth - 480/u)
  assert.match(panel, /if \(available < 360\) \{\s*clearDock\(\)\s*setWidth\(Math\.min\(frameWidth, 720\)\)\s*setDocked\(false\)/u)
  assert.match(panel, /const panelWidth = Math\.max\(360, Math\.min\(requested, available\)\)/u)
  assert.match(panel, /'--citeciter-panel-width': `\$\{widthPercent\}vw`/u)
  assert.match(panel, /data-overlay=\{docked \? undefined : true\}/u)
  assert.match(panel, /\{docked && \(\s*<div\s*className=\{css\.resizeHandle\}/u)
})

test('DSH assistant selection claims only the owning assistant context menu', () => {
  withConversationDom(({ body, setRange }) => {
    const assistant = new FakeElement('article', { chatFlowKind: 'assistant-step', chatAnchorKey: 'assistant:7' })
    const paragraph = new FakeElement('p')
    const answer = text('Alpha beta gamma')
    const outside = new FakeElement('main')
    paragraph.append(answer)
    assistant.append(paragraph)
    body.append(assistant, outside)
    setRange(new FakeRange(answer, 6, answer, 10, 'beta'))

    const event = contextMenu(paragraph)
    const selection = claimSelectionContextMenu(event, 'source')
    assert.equal(event.defaultPrevented, true)
    assert.equal(selection?.anchorKey, 'assistant:7')
    assert.equal(selection?.displayText, 'beta')
    assert.equal(selection?.startOffset, 6)
    assert.equal(selection?.endOffset, 10)

    const unrelatedEvent = contextMenu(outside)
    assert.equal(claimSelectionContextMenu(unrelatedEvent, 'source'), null)
    assert.equal(unrelatedEvent.defaultPrevented, false)
  })
})

test('cross-flow DSH selection binds and claims only its final assistant anchor', () => {
  withConversationDom(({ body, setRange }) => {
    const first = new FakeElement('article', { chatFlowKind: 'assistant-step', chatAnchorKey: 'assistant:1' })
    const second = new FakeElement('article', { chatFlowKind: 'assistant-step', chatAnchorKey: 'assistant:2' })
    const firstText = text('Alpha')
    const reasoning = new FakeElement('div', { variant: 'think' }).append(text('Think secret'))
    const secondText = text('Omega')
    first.append(firstText)
    second.append(reasoning, secondText)
    body.append(first, second)
    setRange(new FakeRange(firstText, 0, secondText, 5, 'Alpha Omega', [first, second]))

    const finalEvent = contextMenu(second)
    const selection = claimSelectionContextMenu(finalEvent, 'source')
    assert.equal(finalEvent.defaultPrevented, true)
    assert.equal(selection?.anchorKey, 'assistant:2')
    assert.equal(selection?.sourceHintText, 'Omega')

    const firstEvent = contextMenu(first)
    assert.equal(claimSelectionContextMenu(firstEvent, 'source'), null)
    assert.equal(firstEvent.defaultPrevented, false)
  })
})

test('Read Frog translated selection maps to its committed DSH source paragraph', () => {
  withConversationDom(({ body, setRange }) => {
    const assistant = new FakeElement('article', { chatFlowKind: 'assistant-step', chatAnchorKey: 'assistant:9' })
    const paragraph = new FakeElement('p', { readFrogParagraph: '' })
    const source = text('The watchdog stops the stale source.')
    const translated = new FakeElement('span', { readFrogTranslationMode: 'bilingual' })
    translated.append(text('看门狗会停止过期来源。'))
    paragraph.append(source, translated)
    assistant.append(paragraph)
    body.append(assistant)
    setRange(new FakeRange(translated, 0, translated, 1, '看门狗会停止过期来源。'))

    const event = contextMenu(translated)
    const selection = claimSelectionContextMenu(event, 'source')
    assert.equal(event.defaultPrevented, true)
    assert.equal(selection?.displayText, '看门狗会停止过期来源。')
    assert.equal(selection?.sourceHintText, 'The watchdog stops the stale source.')
    assert.equal(selection?.startOffset, 0)
    assert.equal(selection?.endOffset, source.textContent.length)
  })
})

test('only an idle source without an active Topic may auto-reopen the remembered Topic', () => {
  assert.equal(shouldReopenLastTopic(false, true, true), true)
  assert.equal(shouldReopenLastTopic(false, false, true), false)
  assert.equal(shouldReopenLastTopic(true, true, true), false)
  assert.equal(shouldReopenLastTopic(false, true, false), false)
  assert.equal(shouldReopenLastTopic(false, true, true, true), false)
  assert.equal(shouldReopenLastTopic(false, true, true, false, true), false)
  assert.equal(shouldReopenLastTopic(false, true, true, false, false, true), false)
})

test('only the current source, epoch, and requested Topic may update the view', () => {
  assert.equal(isCurrentTopicResponse(4, 4, 'source', 'source', 'B', 'B'), true)
  assert.equal(isCurrentTopicResponse(3, 4, 'source', 'source', 'A', 'A'), false)
  assert.equal(isCurrentTopicResponse(4, 4, 'new-source', 'old-source', 'A', 'A'), false)
  assert.equal(isCurrentTopicResponse(4, 4, 'source', 'source', 'A', 'B'), false)
})

test('rendered Markdown context disambiguates repeated source text', () => {
  const answer = 'First **value** here. Second **value** there.'
  const normalized = resolveCitationRange({
    displayText: 'value',
    prefixText: 'First value here. Second ',
    suffixText: ' there.',
  }, answer)

  assert.equal(normalized.startOffset, answer.lastIndexOf('value'))
  assert.equal(normalized.endOffset, answer.lastIndexOf('value') + 'value'.length)
  assert.equal(normalized.sourceText, 'value')
})

test('a translated visible quote maps through its committed source paragraph', () => {
  const answer = 'The watchdog stops the stale source.'
  const selection = {
    displayText: '过期来源',
    sourceHintText: answer,
    prefixText: '',
    suffixText: '',
  }
  const normalized = resolveCitationRange(selection, answer)

  assert.equal(selection.displayText, '过期来源')
  assert.equal(normalized.sourceText, answer)
})

test('a visible selection crossing Markdown markers maps to one exact raw range', () => {
  const answer = 'foo **bar** baz'
  const selection = {
    displayText: 'foo bar',
    prefixText: '',
    suffixText: ' baz',
  }
  const normalized = resolveCitationRange(selection, answer)

  assert.equal(normalized.startOffset, 0)
  assert.equal(normalized.endOffset, answer.indexOf('bar') + 'bar'.length)
  assert.equal(normalized.sourceText, 'foo **bar')
  assert.equal(selection.displayText, 'foo bar')
})

test('browser list separators map back to one Markdown source range', () => {
  const answer = '**做了什么**\n1. A；\n2. B；\n3. C：\n   - D；\n   - E。'
  const candidates = markdownSourceCandidates(answer, '做了什么\nA；B；C：\nD；E。')

  assert.equal(candidates.length, 1)
  assert.equal(candidates[0]?.sourceText, '做了什么**\n1. A；\n2. B；\n3. C：\n   - D；\n   - E。')
  assert.equal(markdownSourceCandidates('foo bar', 'foobar').length, 0)
})

test('GFM source positions keep code and link labels out of hidden destinations', () => {
  const code = resolveCitationRange({
    displayText: 'json',
    prefixText: '',
    suffixText: '',
  }, '```json\njson\n```')
  assert.equal(code.sourceText, 'json')
  assert.equal(code.startOffset, '```json\n'.length)

  const link = resolveCitationRange({
    displayText: 'xx',
    prefixText: '',
    suffixText: '',
  }, '[x](xy)x')
  assert.equal(link.sourceText, 'x](xy)x')
  assert.equal(link.startOffset, 1)
  assert.equal(link.endOffset, 8)
})

test('rendered offsets never bypass Markdown source mapping', () => {
  const answer = '**x** x'
  const normalized = resolveCitationRange({
    displayText: 'x',
    prefixText: 'x ',
    suffixText: '',
  }, answer)
  assert.equal(normalized.startOffset, answer.lastIndexOf('x'))
  assert.equal(normalized.sourceText, 'x')
})

test('entities and inline-code delimiters cannot impersonate visible text', () => {
  assert.deepEqual(
    markdownSourceCandidates('&amp;amp;', 'amp').map(({ startOffset, endOffset }) => [startOffset, endOffset]),
    [[5, 8]],
  )
  assert.deepEqual(
    markdownSourceCandidates('&copy;copy', 'copy').map(({ startOffset, endOffset }) => [startOffset, endOffset]),
    [[6, 10]],
  )
  assert.deepEqual(
    markdownSourceCandidates('``` `` ```', '`').map(({ startOffset, endOffset }) => [startOffset, endOffset]),
    [[4, 5], [5, 6]],
  )
  assert.equal(markdownSourceCandidates('\\] tail', ']')[0]?.sourceText, '\\]')
  assert.equal(markdownSourceCandidates('a\r\nb', 'a\nb')[0]?.sourceText, 'a\r\nb')
  assert.equal(markdownSourceCandidates('`a\r\nb`', 'a b')[0]?.sourceText, 'a\r\nb')
})

test('unclosed or shorter code fences remain visible source', () => {
  const unclosed = markdownSourceCandidates('```\nfoo\n~~~', 'foo\n~~~')[0]
  assert.equal(unclosed?.sourceText, 'foo\n~~~')
  const short = markdownSourceCandidates('````\nfoo\n```', 'foo\n```')[0]
  assert.equal(short?.sourceText, 'foo\n```')
  const crlf = markdownSourceCandidates('```\r\nfoo\r\n~~~', 'foo\n~~~')[0]
  assert.equal(crlf?.sourceText, 'foo\r\n~~~')
})

test('image alt text maps only to its label', () => {
  const candidate = markdownSourceCandidates('![foo](foo)', 'oo')[0]
  assert.equal(candidate?.startOffset, 3)
  assert.equal(candidate?.endOffset, 5)
  assert.equal(candidate?.sourceText, 'oo')
})

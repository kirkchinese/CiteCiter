import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { normalizeSelectionAgainstAnswer } from '../lib/types/client/citation.js'
import { markdownSourceCandidates } from '../lib/types/client/markdown-source-map.js'
import { isCurrentTopicResponse, shouldReopenLastTopic } from '../lib/types/client/response-guard.js'

test('the native DSH grid is measured before the dock override activates', async () => {
  const source = await readFile(new URL('../src/client/components/CitePanel.tsx', import.meta.url), 'utf8')
  const effect = source.slice(source.indexOf('function useDockColumn'), source.indexOf('export interface CitePanelProps'))
  assert.ok(effect.indexOf('apply()') < effect.indexOf("frame.dataset.citeciterDocked = 'true'"))
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
  const normalized = normalizeSelectionAgainstAnswer({
    sourceSessionId: 'source',
    displayText: 'value',
    kind: 'assistant-step',
    anchorKey: 'assistant:6',
    startOffset: 'First value here. Second '.length,
    endOffset: 'First value here. Second value'.length,
    prefixText: 'First value here. Second ',
    suffixText: ' there.',
    x: 1,
    y: 1,
  }, answer)

  assert.equal(normalized.startOffset, answer.lastIndexOf('value'))
  assert.equal(normalized.endOffset, answer.lastIndexOf('value') + 'value'.length)
  assert.equal(normalized.sourceText, 'value')
})

test('a translated visible quote maps through its committed source paragraph', () => {
  const answer = 'The watchdog stops the stale source.'
  const normalized = normalizeSelectionAgainstAnswer({
    sourceSessionId: 'source',
    displayText: '过期来源',
    sourceHintText: answer,
    kind: 'assistant-step',
    anchorKey: 'assistant:6',
    startOffset: 0,
    endOffset: answer.length,
    prefixText: '',
    suffixText: '',
    x: 1,
    y: 1,
  }, answer)

  assert.equal(normalized.displayText, '过期来源')
  assert.equal(normalized.sourceText, answer)
})

test('a visible selection crossing Markdown markers maps to one exact raw range', () => {
  const answer = 'foo **bar** baz'
  const normalized = normalizeSelectionAgainstAnswer({
    sourceSessionId: 'source',
    displayText: 'foo bar',
    kind: 'assistant-step',
    anchorKey: 'assistant:6',
    startOffset: 0,
    endOffset: 'foo bar'.length,
    prefixText: '',
    suffixText: ' baz',
    x: 1,
    y: 1,
  }, answer)

  assert.equal(normalized.startOffset, 0)
  assert.equal(normalized.endOffset, answer.indexOf('bar') + 'bar'.length)
  assert.equal(normalized.sourceText, 'foo **bar')
  assert.equal(normalized.displayText, 'foo bar')
})

test('GFM source positions keep code and link labels out of hidden destinations', () => {
  const code = normalizeSelectionAgainstAnswer({
    sourceSessionId: 'source',
    displayText: 'json',
    kind: 'assistant-step',
    anchorKey: 'assistant:6',
    startOffset: 0,
    endOffset: 4,
    prefixText: '',
    suffixText: '',
    x: 1,
    y: 1,
  }, '```json\njson\n```')
  assert.equal(code.sourceText, 'json')
  assert.equal(code.startOffset, '```json\n'.length)

  const link = normalizeSelectionAgainstAnswer({
    sourceSessionId: 'source',
    displayText: 'xx',
    kind: 'assistant-step',
    anchorKey: 'assistant:6',
    startOffset: 0,
    endOffset: 2,
    prefixText: '',
    suffixText: '',
    x: 1,
    y: 1,
  }, '[x](xy)x')
  assert.equal(link.sourceText, 'x](xy)x')
  assert.equal(link.startOffset, 1)
  assert.equal(link.endOffset, 8)
})

test('rendered offsets never bypass Markdown source mapping', () => {
  const answer = '**x** x'
  const normalized = normalizeSelectionAgainstAnswer({
    sourceSessionId: 'source',
    displayText: 'x',
    kind: 'assistant-step',
    anchorKey: 'assistant:6',
    startOffset: 2,
    endOffset: 3,
    prefixText: 'x ',
    suffixText: '',
    x: 1,
    y: 1,
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

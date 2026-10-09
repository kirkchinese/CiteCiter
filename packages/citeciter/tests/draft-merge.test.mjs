import assert from 'node:assert/strict'
import test from 'node:test'
import { mergeDraftContent, mergeDraftText, mergeQuestionDraft } from '../lib/types/client/draft-merge.js'
import { subtractSubmitted } from '../lib/types/draft-contract.js'

test('independent text edits from two windows both survive', () => {
  const base = 'first line\nsecond line'
  assert.equal(mergeDraftText(base, 'FIRST line\nsecond line', 'first line\nsecond LINE', true), 'FIRST line\nsecond LINE')
  assert.equal(mergeDraftText(base, 'first line\nsecond line!', 'intro\nfirst line\nsecond line', false), 'intro\nfirst line\nsecond line!')
})

test('overlapping edits keep the operating window and one-sided changes win', () => {
  assert.equal(mergeDraftText('abc', 'aXc', 'aYc', true), 'aXc')
  assert.equal(mergeDraftText('abc', 'aXc', 'aYc', false), 'aYc')
  assert.equal(mergeDraftText('abc', 'abc', 'abcd', true), 'abcd')
  assert.equal(mergeDraftText('abc', 'zabc', 'abc', false), 'zabc')
  assert.equal(mergeDraftText('abc', 'same', 'same', false), 'same')
})

test('merging is idempotent and keeps surrogate pairs and CJK text intact', () => {
  const base = '你好 🧭 世界'
  const local = '你好呀 🧭 世界'
  const remote = '你好 🧭 新世界'
  const merged = mergeDraftText(base, local, remote, true)
  assert.equal(merged, '你好呀 🧭 新世界')
  assert.equal(mergeDraftText(base, merged, merged, false), merged)
  assert.ok(!merged.includes('�'))
})

test('references and files merge by identity and removals are never undone', () => {
  const ref = (id, label = id) => ({ id, kind: 'excerpt', label, content: id })
  const file = id => ({ id, name: `${id}.txt`, type: 'text/plain', size: 1, lastModified: 0 })
  const base = { text: '', references: [ref('kept'), ref('removed')], files: [file('a')] }
  const local = { text: '', references: [ref('kept'), ref('added-here')], files: [file('a'), file('b')] }
  const remote = { text: '', references: [ref('kept', 'renamed'), ref('removed'), ref('added-there')], files: [] }
  const merged = mergeDraftContent(base, local, remote, true)
  assert.deepEqual(merged.references.map(item => [item.id, item.label]), [['kept', 'renamed'], ['added-there', 'added-there'], ['added-here', 'added-here']])
  assert.deepEqual(merged.files.map(item => item.id), ['b'])
})

test('question answers stay atomic when the selection differs and merge custom text otherwise', () => {
  const base = { answers: { q1: { selected: [], custom: '' }, q2: { selected: ['A'], custom: 'note' } }, page: 0, edited: false, held: false }
  const local = { answers: { q1: { selected: ['B'], custom: '' }, q2: { selected: ['A'], custom: 'note!' } }, page: 1, edited: true, held: false }
  const remote = { answers: { q1: { selected: [], custom: 'typed elsewhere' }, q2: { selected: ['A'], custom: 'my note' } }, page: 0, edited: true, held: true }
  const merged = mergeQuestionDraft(base, local, remote, true)
  assert.deepEqual(merged.answers.q1, { selected: ['B'], custom: '' })
  assert.deepEqual(merged.answers.q2, { selected: ['A'], custom: 'my note!' })
  assert.equal(merged.page, 1)
  assert.equal(merged.held, true)
  assert.equal(mergeQuestionDraft(base, local, remote, false).page, 1)
})

test('an acknowledged submission is removed while later edits are kept', () => {
  const submitted = { text: 'sent', references: [{ id: 'r1', kind: 'source', label: 's', content: 's' }], files: [] }
  assert.deepEqual(subtractSubmitted(submitted, submitted), { text: '', references: [], files: [] })
  const later = { ...submitted, text: 'sent plus more', references: [...submitted.references, { id: 'r2', kind: 'excerpt', label: 'e', content: 'e' }] }
  assert.deepEqual(subtractSubmitted(later, submitted), { text: 'sent plus more', references: [later.references[1]], files: [] })
})

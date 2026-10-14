import assert from 'node:assert/strict'
import test from 'node:test'

import { draftReferenceTitle, parseSentReferences, serializeDraftReferences } from '../lib/types/client/draft-references.js'

const source = { id: 's', kind: 'source', label: '来源对话', content: 'session-1', address: 'dsh://session/session-1' }
const excerpt = { id: 'e', kind: 'excerpt', label: '引用文段', content: '中文输入法组合输入期间，字符仍在候选和修改中，立即保存会出错。' }
const documentExcerpt = { id: 'd', kind: 'excerpt', label: '引用文段', content: '文档：notes.md\n\n第一段正文' }

test('chips show what a reference contains', () => {
  assert.equal(draftReferenceTitle(excerpt), '中文输入法组合输入期间，字符仍在候选和修改中，立…')
  assert.equal(draftReferenceTitle(documentExcerpt), '第一段正文')
  assert.equal(draftReferenceTitle(source, id => id === 'session-1' ? '输入法同步更新与异步保存' : undefined), '输入法同步更新与异步保存')
  assert.equal(draftReferenceTitle(source), '来源对话')
  assert.equal(draftReferenceTitle({ id: 'b', kind: 'board', label: '板书引用', content: '请解释板书里的状态图' }), '板书：请解释板书里的状态图')
})

test('serialized labels are unchanged, so sent messages still parse', () => {
  const text = serializeDraftReferences('为什么？', [source, excerpt])
  const parsed = parseSentReferences(text)
  assert.equal(parsed.question, '为什么？')
  assert.deepEqual(parsed.references.map(reference => [reference.kind, reference.label, reference.content]), [
    ['source', '来源对话', 'session-1'],
    ['excerpt', '引用文段', excerpt.content],
  ])
})

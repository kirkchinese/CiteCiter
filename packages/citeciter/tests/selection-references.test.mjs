import assert from 'node:assert/strict'
import test from 'node:test'

import { selectionReferences } from '../lib/types/client/selection-references.js'

test('a user-message excerpt keeps its source conversation without a verified citation claim', () => {
  const references = selectionReferences({ kind: 'quote', sourceSessionId: 'src', anchorKey: 'turn:1:user', displayText: '我的论述有错吗？' })
  assert.equal(references.length, 2)
  assert.equal(references[0].address, 'dsh://session/src')
  assert.equal(references[1].kind, 'excerpt')
  assert.equal(references[1].content, '我的论述有错吗？')
  assert.match(references[1].id, /turn:1:user/u)
})

test('a passage of a Topic transcript is cited as an excerpt without a source address', () => {
  const references = selectionReferences({ kind: 'topic', sourceSessionId: 'src', topicSessionId: 'citeciter-1', displayText: '梯度下降沿负梯度方向更新参数' })
  assert.equal(references.length, 1)
  assert.equal(references[0].kind, 'excerpt')
  assert.equal(references[0].label, '引用文段')
  assert.equal(references[0].content, '梯度下降沿负梯度方向更新参数')
  assert.equal(references[0].address, undefined)
  assert.throws(() => selectionReferences({ kind: 'topic', sourceSessionId: 'src', topicSessionId: 't', displayText: '  ' }), /请先选中/u)
})

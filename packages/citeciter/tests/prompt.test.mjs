import assert from 'node:assert/strict'
import test from 'node:test'
import { buildPrompt, parseAnchorSeq } from '../lib/types/client/prompt.js'

test('parseAnchorSeq accepts canonical "<seq>:kind..." anchors', () => {
  assert.equal(parseAnchorSeq('42:assistant-step7'), 42)
  assert.equal(parseAnchorSeq('0:user'), 0)
  assert.equal(parseAnchorSeq('13:input-message04cf'), 13)
})

test('parseAnchorSeq rejects non-numeric, negative and missing prefixes', () => {
  assert.equal(parseAnchorSeq('assistant-step7'), null)
  assert.equal(parseAnchorSeq('-1:user'), null)
  assert.equal(parseAnchorSeq('1.5:user'), null)
  assert.equal(parseAnchorSeq(''), null)
})

test('buildPrompt quotes the selection and forbids writes/escalation', () => {
  const prompt = buildPrompt({
    text: 'Riemann curvature tensor',
    kind: 'assistant-step',
    anchorKey: '42:assistant-step7',
    x: 1,
    y: 2,
  })
  assert.match(prompt, /Riemann curvature tensor/)
  assert.match(prompt, /anchor=42:assistant-step7/)
  assert.match(prompt, /不修改任何文件/)
  assert.match(prompt, /不要请求提升沙箱权限/)
  assert.match(prompt, /```svg 围栏/)
})

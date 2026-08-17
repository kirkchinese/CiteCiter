import assert from 'node:assert/strict'
import test from 'node:test'
import { buildPrompt } from '../lib/types/client/prompt.js'

test('buildPrompt quotes the selection and forbids writes or escalation', () => {
  const prompt = buildPrompt({
    text: 'Riemann curvature tensor',
    kind: 'assistant-step',
    anchorKey: '14:assistant-step2:1',
    x: 1,
    y: 2,
  })
  assert.match(prompt, /Riemann curvature tensor/)
  assert.match(prompt, /anchor=14:assistant-step2:1/)
  assert.match(prompt, /不修改任何文件/)
  assert.match(prompt, /不要请求提升沙箱权限/)
  assert.match(prompt, /```svg 围栏/)
})

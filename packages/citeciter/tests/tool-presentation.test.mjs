import assert from 'node:assert/strict'
import test from 'node:test'

import { toolPresentation } from '../lib/types/client/tool-presentation.js'

const tool = (name, overrides = {}) => ({
  id: name, seq: 1, role: 'tool', name, arguments: '{}', result: '', isError: false, running: false, ...overrides,
})

test('known tools get readable titles; unknown tools keep their own name', () => {
  assert.equal(toolPresentation(tool('read_source_session')).title, '读取来源对话')
  assert.equal(toolPresentation(tool('bash')).title, '运行命令')
  assert.equal(toolPresentation(tool('pwsh')).title, '运行命令')
  assert.equal(toolPresentation(tool('powershell')).title, '运行命令')
  assert.equal(toolPresentation(tool('codex_connect_image_generate')).title, '生成图片')
  assert.equal(toolPresentation(tool('some_plugin_tool')).title, 'some_plugin_tool')
})

test('summaries describe what the call did instead of echoing JSON', () => {
  const source = toolPresentation(tool('read_source_session', { result: JSON.stringify({ events: [{}, {}, {}], hasMore: true }) }))
  assert.equal(source.summary, '3 条记录，还有更多')
  const markdown = 'Source session s · seq 0–9 · latest seq 20 · 4 records · detail compact\nQuoted evidence.\n\n---\n\n# User · seq 1\nhi\n\n---\n\nMore source after seq 9: call read_source_session with fromSeq: 10.'
  assert.equal(toolPresentation(tool('read_source_session', { result: markdown })).summary, '4 条记录，还有更多')
  assert.equal(toolPresentation(tool('read_source_session', { result: markdown.replace(/More source after[^\n]*/u, 'End of the source as of this read.') })).summary, '4 条记录')
  const document = toolPresentation(tool('read_document', { result: JSON.stringify({ throughOffset: 450, documentLength: 1000 }) }))
  assert.equal(document.summary, '读到 45%')
  const cards = toolPresentation(tool('learning_cards', { arguments: JSON.stringify({ cards: [{}, {}] }), result: 'saved' }))
  assert.equal(cards.summary, '2 张')
  const read = toolPresentation(tool('read', { arguments: JSON.stringify({ path: 'src/index.ts' }), result: 'file body' }))
  assert.equal(read.summary, 'src/index.ts')
  const command = toolPresentation(tool('pwsh', { arguments: JSON.stringify({ command: 'node calc.js', description: 'Run calculator script after edit' }), result: 'ok' }))
  assert.deepEqual([command.title, command.summary], ['运行命令', 'Run calculator script after edit'])
  const edit = toolPresentation(tool('edit', { arguments: JSON.stringify({ file_path: 'calc.js', old_string: 'old', new_string: 'new' }), running: true, result: null }))
  assert.equal(edit.summary, 'calc.js  +1 −1')
})

test('running calls show their subject; failures, rejections and interruptions say so', () => {
  const running = toolPresentation(tool('bash', { arguments: JSON.stringify({ command: 'pnpm test' }), running: true }))
  assert.deepEqual([running.summary, running.running], ['pnpm test', true])
  // A failed call keeps its own title, like DSH's rows; the outcome follows its subject.
  const failed = toolPresentation(tool('bash', { isError: true, result: 'command not found\nmore detail' }))
  assert.deepEqual([failed.title, failed.summary], ['运行命令', '失败：command not found more detail'])
  const aborted = toolPresentation(tool('pwsh', { arguments: JSON.stringify({ description: 'List files', command: 'ls' }), isError: true, result: 'Error: tool call aborted' }))
  assert.deepEqual([aborted.title, aborted.summary], ['运行命令', 'List files · 失败：Error: tool call aborted'])
  assert.equal(toolPresentation(tool('write', { isError: true, approvalOutcome: 'rejected' })).summary, '已拒绝')
  assert.equal(toolPresentation(tool('ask_user_question', { isError: true, errorCode: 'ASK_CANCELLED' })).summary, '已取消')
  assert.equal(toolPresentation(tool('run_code', { interruptionOutcome: 'interrupted', running: true })).summary, '已中断')
})

test('attachments-only results and empty results stay short', () => {
  assert.equal(toolPresentation(tool('view_image', { attachments: [{ id: 'a' }] })).summary, '已返回附件')
  assert.equal(toolPresentation(tool('blackboard_view')).summary, '完成')
})

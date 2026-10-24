import assert from 'node:assert/strict'
import test from 'node:test'

import {
  deriveDiffCard, deriveQuestionReply, deriveReadCard, deriveSearchCard,
  deriveTerminalCard, deriveToolCard, isShellTool,
} from '../lib/types/client/tool-cards.js'

const tool = (name, overrides = {}) => ({
  id: `call-${name}`, seq: 1, role: 'tool', name,
  arguments: '{}', result: '', isError: false, running: false, ...overrides,
})

const readResult = (path, body = '8: hello') => `<path>${path}</path>\n<type>file</type>\n<content>\n${body}\n</content>`

test('read uses real offset line numbers and authored relative path', () => {
  const read = tool('read', {
    arguments: JSON.stringify({ file_path: 'src/calc.js', offset: 8, limit: 2 }),
    result: readResult('C:\\work\\src\\calc.js', '8: hello\n9: world'),
    meta: { path: 'C:\\work\\src\\calc.js', offset: 8, totalLines: 20, lang: 'js',
      lines: [{ number: 8, text: 'hello' }, { number: 9, text: 'world' }] },
  })
  assert.deepEqual(deriveReadCard(read), { kind: 'read', label: 'src/calc.js',
    lines: [{ number: 8, text: 'hello' }, { number: 9, text: 'world' }], totalLines: 20, lang: 'js' })
  assert.equal(deriveReadCard({ ...read, meta: { ...read.meta, lines: [{ number: 7, text: 'wrong' }] } }), null)
  assert.equal(deriveReadCard({ ...read, result: 'not a read envelope' }), null)
  assert.equal(deriveReadCard({ ...read, isError: true }), null)
})

test('edit uses applied context hunks, and running edits preview intended changes', () => {
  const edit = tool('edit', {
    arguments: JSON.stringify({ file_path: 'calc.js', old_string: 'before', new_string: 'after' }),
    result: 'The file has been updated successfully.',
    meta: { path: 'C:\\work\\calc.js', diffs: [{ path: 'C:\\work\\calc.js',
      oldText: 'same\nbefore\nend', newText: 'same\nafter\nend' }] },
  })
  const card = deriveDiffCard(edit)
  assert.equal(card.path, 'calc.js')
  assert.deepEqual(card.diffs, [{ path: 'calc.js', oldText: 'same\nbefore\nend', newText: 'same\nafter\nend' }])
  assert.deepEqual([card.added, card.removed], [1, 1])
  assert.deepEqual(deriveDiffCard({ ...edit, running: true, result: null, meta: undefined }).diffs,
    [{ path: 'calc.js', oldText: 'before', newText: 'after' }])
  assert.equal(deriveDiffCard({ ...edit, meta: { diffs: [{ path: 'bad', oldText: 1, newText: 'ok' }] } }), null)
  assert.equal(deriveDiffCard({ ...edit, isError: true }), null)
  assert.equal(deriveDiffCard({ ...edit, approvalOutcome: 'rejected' }), null)
  assert.deepEqual(deriveDiffCard(tool('write', { arguments: JSON.stringify({ file_path: 'new.txt', content: 'a\nb' }), result: 'saved' })).diffs,
    [{ path: 'new.txt', oldText: null, newText: 'a\nb' }])
  assert.deepEqual(deriveDiffCard(tool('str_replace_editor', { arguments: JSON.stringify({ command: 'str_replace', path: 'a', old_str: 'x', new_str: 'y' }), running: true, result: null })).diffs,
    [{ path: 'a', oldText: 'x', newText: 'y' }])
})

test('terminal handles aliases, descriptions, exit markers, metadata and running state', () => {
  assert.equal(isShellTool('pwsh'), true)
  assert.equal(isShellTool('powershell'), true)
  assert.equal(isShellTool('run_command'), true)
  assert.equal(isShellTool('run_code'), false)
  const call = tool('pwsh', {
    arguments: JSON.stringify({ description: 'Run calculator script', command: 'node calc.js', workdir: 'work' }),
    result: '5\n[exit code: 2]', meta: { cwd: 'C:\\work' },
  })
  assert.deepEqual(deriveTerminalCard(call), { kind: 'terminal', command: 'node calc.js',
    cwd: 'C:\\work', output: '5', exitCode: 2, running: false })
  assert.deepEqual(deriveTerminalCard({ ...call, result: null, running: true }), {
    kind: 'terminal', command: 'node calc.js', cwd: 'C:\\work', running: true,
  })
  // Failed and interrupted commands still show what ran.
  assert.deepEqual(deriveTerminalCard({ ...call, result: 'failed', isError: true }), { kind: 'terminal', command: 'node calc.js', cwd: 'C:\\work', output: 'failed', running: false })
  assert.deepEqual(deriveTerminalCard({ ...call, result: null, running: false, interruptionOutcome: 'interrupted' }), { kind: 'terminal', command: 'node calc.js', cwd: 'C:\\work', running: false })
  assert.equal(deriveTerminalCard({ ...call, meta: { exitCode: 'bad' } }), null)
  assert.equal(deriveTerminalCard({ ...call, arguments: '{' }), null)
  assert.deepEqual(deriveTerminalCard({ ...call, result: 'text', meta: { exit_code: 4 } }).exitCode, 4)
})

test('search validates grouped grep matches and flat glob paths', () => {
  const grep = tool('grep', {
    arguments: JSON.stringify({ pattern: 'divide' }), result: 'Found 1 match',
    meta: { shape: 'matches', total: 1, truncated: false,
      files: [{ path: 'calc.js', matches: [{ lineNumber: 7, line: 'divide(a, b)' }] }] },
  })
  assert.deepEqual(deriveSearchCard(grep), { kind: 'search', shape: 'matches', total: 1,
    truncated: false, files: [{ path: 'calc.js', matches: [{ lineNumber: 7, line: 'divide(a, b)' }] }] })
  assert.equal(deriveSearchCard({ ...grep, meta: { ...grep.meta, files: [{ path: 'calc.js', matches: [{ lineNumber: 0, line: 'bad' }] }] } }), null)
  const glob = tool('glob', {
    arguments: JSON.stringify({ pattern: '**/*.ts' }), result: 'src/a.ts',
    meta: { shape: 'paths', total: 50, truncated: true, paths: ['src/a.ts'] },
  })
  assert.deepEqual(deriveSearchCard(glob), { kind: 'search', shape: 'paths', total: 50,
    truncated: true, paths: ['src/a.ts'], recovery: 'src/a.ts' })
  assert.equal(deriveSearchCard({ ...glob, meta: { shape: 'paths', total: 1, truncated: false, paths: [1] } }), null)
  assert.equal(deriveToolCard(tool('other_tool')), null)
})

test('ordinary question results become readable question and selected answer pairs', () => {
  const ask = tool('ask_user_question', {
    arguments: JSON.stringify({ questions: [{ id: 'next', header: '下一步', question: '选择？' }] }),
    result: JSON.stringify({ answers: [{ id: 'next', selected: ['B 保持原样'] }] }),
  })
  assert.deepEqual(deriveQuestionReply(ask), { callId: 'call-ask_user_question',
    items: [{ id: 'next', header: '下一步', question: '选择？', values: ['B 保持原样'] }] })
  assert.equal(deriveQuestionReply({ ...ask, result: JSON.stringify({ answers: [{ id: 'other', selected: [] }] }) }), null)
  assert.equal(deriveQuestionReply({ ...ask, isError: true }), null)
})

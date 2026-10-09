import assert from 'node:assert/strict'
import test from 'node:test'
import { projectBoardFromLog, topicMessages } from '../lib/types/topic-runtime.js'

let seq = 0
const event = (type, data) => ({ type, seq: seq++, time: seq, data })
const turnStart = turn => event('turn/start', { turn })
const turnEnd = (turn, reason = { kind: 'completed' }) => event('turn/end', { turn, reason })
const user = (id, content) => event('user/message', { id, role: 'user', content, source: { kind: 'user' } })
const assistant = (id, turn, content) => event('assistant/message', { turn, message: { id, role: 'assistant', content, source: { provider: 'p', model: 'm' } } })
const call = (callId, name, args) => event('tool/call', { callId, name, arguments: JSON.stringify(args) })
const result = (callId, content, extra = {}) => event('tool/result', { message: { toolCallId: callId, content, isError: extra.isError ?? false }, ...(extra.error === undefined ? {} : { error: extra.error }) })
const log = (events, inheritedEventCount = 0) => ({ header: { id: 'topic' }, events, inheritedEventCount })
const text = value => ({ type: 'text', text: value })

test('the transcript skips the inherited prefix and projects users, answers and reasoning', () => {
  seq = 0
  const events = [
    user('inherited', [text('from the source')]),
    turnStart(1),
    user('u1', [text('why?'), { type: 'image', attachment: { attachmentId: 'img-1', name: 'a.png' } }, { type: 'file', attachment: { attachmentId: 'file-1' } }]),
    assistant('a1', 1, [{ type: 'reasoning', text: 'thinking' }, text('because')]),
    assistant('a2', 1, [{ type: 'reasoning', text: 'only thinking' }]),
    assistant('a3', 1, [text('')]),
    turnEnd(1),
  ]
  const { messages, error } = topicMessages({ ...log(events, 1), renderKeys: new Map([[3, 'live-key']]) })
  assert.equal(error, null)
  assert.deepEqual(messages, [
    { id: 'u1', seq: 2, role: 'user', text: 'why?', attachments: [{ kind: 'image', id: 'img-1', name: 'a.png' }, { kind: 'file', id: 'file-1', name: '文件' }] },
    { id: 'a1', renderKey: 'live-key', seq: 3, role: 'assistant', text: 'because', reasoning: 'thinking', streaming: false },
    { id: 'a2', seq: 4, role: 'assistant', text: '', reasoning: 'only thinking', streaming: false },
  ])
})

test('tool calls pair with their results, attachments and structured question outcomes', () => {
  seq = 0
  const events = [
    turnStart(1),
    call('c1', 'read', { path: 'a.ts' }),
    call('c2', 'ask_user_question', { questions: [] }),
    call('c3', 'pending_tool', {}),
    result('c1', [text('file body'), { type: 'image', attachment: { attachmentId: 'shot' } }]),
    result('c2', [text('cancelled')], { error: { name: 'UserQuestionError', code: 'ASK_CANCELLED', message: 'x' } }),
    result('unknown', [text('orphan')]),
    turnEnd(1),
  ]
  const tools = topicMessages(log(events)).messages
  assert.deepEqual(tools.map(message => [message.id, message.running, message.isError, message.result, message.errorCode]), [
    ['c1', false, false, 'file body', undefined],
    ['c2', false, true, 'cancelled', 'ASK_CANCELLED'],
    ['c3', true, false, null, undefined],
  ])
  assert.deepEqual(tools[0].attachments, [{ kind: 'image', id: 'shot', name: '工具图片' }])
  assert.equal(tools[0].arguments, '{"path":"a.ts"}')
})

test('run_code children are projected with their own call identity', () => {
  seq = 0
  const events = [
    turnStart(1),
    event('tool/ptc-dispatch-start', { subCallId: 'child', rootCallId: 'root', parentCallId: 'root', name: 'grep', arguments: { pattern: 'x' } }),
    event('tool/ptc-dispatch', { subCallId: 'child', content: [text('match')], isError: false }),
    turnEnd(1),
  ]
  const [child] = topicMessages(log(events)).messages
  assert.deepEqual([child.id, child.name, child.arguments, child.result, child.running], ['child', 'grep', '{"pattern":"x"}', 'match', false])
})

test('a failed turn leaves an error row and banner until the next turn starts', () => {
  seq = 0
  const failed = [turnStart(1), user('u1', [text('q')]), assistant('a1', 1, [text('partial')]), turnEnd(1, { kind: 'error', error: { message: 'TRANSPORT' } })]
  const first = topicMessages(log(failed))
  assert.equal(first.error, 'TRANSPORT')
  assert.deepEqual(first.messages.at(-1), { id: 'error:3', seq: 3, role: 'error', text: 'TRANSPORT', bodyRetained: true, attempt: 1, status: 'failed' })

  const retried = topicMessages(log([...failed, turnStart(2)]))
  assert.equal(retried.error, null)
  assert.equal(retried.messages.at(-1).role, 'error')

  seq = 0
  const stopped = topicMessages(log([turnStart(1), turnEnd(1, { kind: 'aborted', reason: { kind: 'user' } })]))
  assert.equal(stopped.error, null)
  assert.equal(stopped.messages[0].status, 'stopped')
})

test('plugin context becomes a labelled context row and a live message is appended last', () => {
  seq = 0
  const context = event('user/message', { id: 'ctx', role: 'user', content: [text('citation json')], source: { kind: 'plugin', plugin: '@deepseek-ai/dsh-system-prompt' } })
  const live = { id: 'live', seq: 99, role: 'assistant', text: 'streaming', reasoning: null, streaming: true }
  const { messages } = topicMessages({ ...log([context]), liveMessage: live })
  assert.deepEqual(messages, [{ id: 'ctx', seq: 0, role: 'context', label: '提示词注入', text: 'citation json' }, live])
})

test('a late question reply renders as a user message and settles its question row', () => {
  seq = 0
  const reply = JSON.stringify({
    kind: 'answer_to_pending_question', tool: 'ask_user_question', callId: 'ask',
    questions: [{ id: 'q', question: '选哪个？' }], answers: [{ id: 'q', selected: ['A'], custom: ' 补充 ' }],
  })
  const events = [
    turnStart(1),
    call('ask', 'ask_user_question', {}),
    event('user/message', { id: 'r1', role: 'user', content: [text(reply)], source: { kind: 'user-question-reply', callId: 'ask' } }),
  ]
  const [question, answer] = topicMessages(log(events)).messages
  const expected = { callId: 'ask', items: [{ id: 'q', question: '选哪个？', values: ['A', ' 补充 '] }] }
  assert.deepEqual(question.questionReply, expected)
  assert.equal(question.running, false)
  assert.deepEqual(answer, { id: 'r1', seq: 2, role: 'user', text: '补答\n\n选哪个？\n回答：A、 补充 ', questionReply: expected })
})

test('the board replays only successful, valid blackboard batches after the inherited prefix', () => {
  seq = 0
  const set = (id, x = 4) => ({ op: 'set', id, kind: 'text', content: id, x, y: 4, w: 40, h: 10 })
  const events = [
    call('old', 'blackboard_apply', { ops: [set('inherited')] }), result('old', [text('{}')]),
    call('b1', 'blackboard_apply', { ops: [set('a'), set('b', 50)] }), result('b1', [text('{}')]),
    call('b2', 'blackboard_apply', { ops: [{ op: 'remove', id: 'b' }] }), result('b2', [text('err')], { isError: true }),
    call('b3', 'blackboard_apply', { ops: [] }), result('b3', [text('{}')]),
    call('b4', 'blackboard_apply', { ops: [{ op: 'update', id: 'a', content: 'A' }] }), result('b4', [text('{}')]),
  ]
  const board = projectBoardFromLog(log(events, 2))
  assert.equal(board.version, 4)
  assert.equal(board.revision, 2)
  assert.equal(board.invalid, 1)
  assert.deepEqual(board.elements.map(element => [element.id, element.content]), [['a', 'A'], ['b', 'b']])
})

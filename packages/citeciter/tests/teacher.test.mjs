import assert from 'node:assert/strict'
import test from 'node:test'
import { latestCompletedTurn, parseTeacherVerdict, TeacherMode } from '../lib/types/teacher.js'

let seq = 0
const event = (type, data) => ({ type, seq: seq++, time: seq, data })
const user = text => event('user/message', { id: `u${seq}`, role: 'user', content: [{ type: 'text', text }], source: { kind: 'user' } })
const answer = (turn, text) => event('assistant/message', { turn, message: { id: `a${seq}`, role: 'assistant', content: [{ type: 'text', text }], source: { provider: 'p', model: 'm' } } })
const source = events => ({ session: { id: 'source', cwd: '' }, events })

test('only the newest turn counts, and only once it completed', () => {
  seq = 0
  const events = [
    event('turn/start', { turn: 1 }), user('a'), answer(1, 'b'), event('turn/end', { turn: 1, reason: { kind: 'completed' } }),
    event('turn/start', { turn: 2 }), user('c'), answer(2, 'd'), event('turn/end', { turn: 2, reason: { kind: 'completed' } }),
  ]
  assert.deepEqual(latestCompletedTurn(events), { turn: 2, fromSeq: 4, throughSeq: 7 })
  seq = 0
  const failed = [event('turn/start', { turn: 1 }), user('a'), event('turn/end', { turn: 1, reason: { kind: 'error', error: { message: 'x' } } })]
  assert.equal(latestCompletedTurn(failed), null)
  assert.equal(latestCompletedTurn([]), null)
})

test('a verdict is read from JSON, with or without surrounding text', () => {
  assert.deepEqual(parseTeacherVerdict('{"worth": true, "title": "IEEE 754 除零", "point": "JS 的除法遵循浮点规则。"}'), { title: 'IEEE 754 除零', point: 'JS 的除法遵循浮点规则。' })
  assert.deepEqual(parseTeacherVerdict('```json\n{"worth":true,"title":" A  B ","point":"c"}\n```'), { title: 'A B', point: 'c' })
  assert.equal(parseTeacherVerdict('{"worth": false}'), null)
  assert.equal(parseTeacherVerdict('{"worth": true, "title": "", "point": "x"}'), null)
  assert.equal(parseTeacherVerdict('not json'), null)
})

test('a turn is judged once, never while teacher mode is off', async () => {
  seq = 0
  const events = [event('turn/start', { turn: 1 }), user('why does 1/0 print Infinity?'), answer(1, 'IEEE 754 defines it.'), event('turn/end', { turn: 1, reason: { kind: 'completed' } })]
  let enabled = false
  let calls = 0
  const teacher = new TeacherMode({
    enabled: () => enabled,
    readSource: async () => source(events),
    route: () => ({ provider: 'p', model: 'cheap' }),
    call: async (route, system, input) => {
      calls++
      assert.equal(route.model, 'cheap')
      assert.match(system, /worth/u)
      assert.match(input, /IEEE 754/u)
      return '{"worth": true, "title": "Division by zero", "point": "Floating point defines it."}'
    },
  })
  const signal = new AbortController().signal
  assert.equal(await teacher.check('source', signal), null)
  assert.equal(calls, 0)
  enabled = true
  const [first, second] = await Promise.all([teacher.check('source', signal), teacher.check('source', signal)])
  assert.deepEqual(first, { sourceSessionId: 'source', turn: 1, title: 'Division by zero', point: 'Floating point defines it.' })
  assert.deepEqual(second, first)
  assert.deepEqual(await teacher.check('source', signal), first)
  assert.equal(calls, 1)
})

test('a failed model call means nothing to offer', async () => {
  seq = 0
  const events = [event('turn/start', { turn: 1 }), user('q'), answer(1, 'a'), event('turn/end', { turn: 1, reason: { kind: 'completed' } })]
  const teacher = new TeacherMode({ enabled: () => true, readSource: async () => source(events), route: () => ({ provider: 'p', model: 'm' }), call: async () => { throw new Error('offline') } })
  assert.equal(await teacher.check('source', new AbortController().signal), null)
})

/** Deterministic keyless LLM route for the assembled CiteCiter Web smoke. */
import { CallId, LlmAdapter } from '@deepseek-ai/dsh-llm'

export const name = 'citeciter-fixture-llm'
export const inject = ['llm']

const PROVIDER = 'fixture'
const MODEL = 'fixture'
const FIRST_ANSWER = '首轮回答：平行移动比较同一向量沿不同路径返回后的差异；这个差异由曲率刻画。'
const FOLLOW_UP_ANSWER = '第二轮回答：曲率可以看成无穷小闭合回路的 holonomy；回路越小，偏差的一阶面积项越直接反映曲率。'
let callNumber = 0

function textChunks(text) {
  return [
    { type: 'block-start', index: 0, blockType: 'text' },
    { type: 'text-delta', index: 0, text },
    { type: 'block-end', index: 0, block: { type: 'text', text } },
    { type: 'usage', usage: { inputTokens: 1, outputTokens: 1 } },
    { type: 'finish', reason: { kind: 'stop' } },
  ]
}

function sourceReadChunks() {
  const id = CallId(`citeciter-fixture-source-${++callNumber}`)
  const block = {
    type: 'tool-call',
    id,
    name: 'read_source_session',
    arguments: '{"fromSeq":0}',
  }
  return [
    { type: 'block-start', index: 0, blockType: 'tool-call' },
    { type: 'tool-call-delta', index: 0, id, name: block.name, argumentsDelta: block.arguments },
    { type: 'block-end', index: 0, block },
    { type: 'usage', usage: { inputTokens: 1, outputTokens: 1 } },
    { type: 'finish', reason: { kind: 'tool-calls' } },
  ]
}

function hasSourceRead(messages) {
  return messages.some((message) => message.content.some((block) => (
    block.type === 'tool-result'
    && String(block.toolCallId).startsWith('citeciter-fixture-source-')
  )))
}

function humanQuestionCount(messages) {
  return messages.filter((message) => message.role === 'user' && message.source.kind === 'user').length
}

class FixtureAdapter extends LlmAdapter {
  providerInfo() {
    return { id: PROVIDER, name: 'CiteCiter Fixture' }
  }

  listModels() {
    return Promise.resolve([{ provider: PROVIDER, id: MODEL, name: 'Fixture' }])
  }

  resolveModel() {
    return Promise.resolve({ provider: PROVIDER, id: MODEL, name: 'Fixture' })
  }

  async *stream(options) {
    options.signal?.throwIfAborted()
    const chunks = options.purpose === 'session-title'
      ? textChunks('曲率与平行移动')
      : !hasSourceRead(options.messages)
        ? sourceReadChunks()
        : textChunks(humanQuestionCount(options.messages) > 1 ? FOLLOW_UP_ANSWER : FIRST_ANSWER)
    for (const chunk of chunks) {
      options.signal?.throwIfAborted()
      yield chunk
    }
  }
}

/** Register the fixture route in the disposable Cordis plugin fiber. */
export function apply(ctx) {
  ctx.llm.registerAdapter([PROVIDER], new FixtureAdapter())
}

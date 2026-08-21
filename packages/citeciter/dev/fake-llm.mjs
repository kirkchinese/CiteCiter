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

function reasoningTextChunks(reasoning, text) {
  return [
    { type: 'block-start', index: 0, blockType: 'reasoning' },
    { type: 'reasoning-delta', index: 0, text: reasoning },
    { type: 'block-end', index: 0, block: { type: 'reasoning', text: reasoning } },
    { type: 'block-start', index: 1, blockType: 'text' },
    { type: 'text-delta', index: 1, text },
    { type: 'block-end', index: 1, block: { type: 'text', text } },
    { type: 'usage', usage: { inputTokens: 1, outputTokens: 1 } },
    { type: 'finish', reason: { kind: 'stop' } },
  ]
}

function toolChunks(name, arguments_, prefix) {
  const id = CallId(`${prefix}-${++callNumber}`)
  const block = {
    type: 'tool-call',
    id,
    name,
    arguments: arguments_,
  }
  return [
    { type: 'block-start', index: 0, blockType: 'reasoning' },
    { type: 'reasoning-delta', index: 0, text: '正在检查可验证的上下文与工具结果。' },
    { type: 'block-end', index: 0, block: { type: 'reasoning', text: '正在检查可验证的上下文与工具结果。' } },
    { type: 'block-start', index: 1, blockType: 'tool-call' },
    { type: 'tool-call-delta', index: 1, id, name: block.name, argumentsDelta: block.arguments },
    { type: 'block-end', index: 1, block },
    { type: 'usage', usage: { inputTokens: 1, outputTokens: 1 } },
    { type: 'finish', reason: { kind: 'tool-calls' } },
  ]
}

function hasToolResult(messages, prefix) {
  return messages.some((message) => message.content.some((block) => (
    block.type === 'tool-result'
    && String(block.toolCallId).startsWith(prefix)
  )))
}

function latestHumanQuestion(messages) {
  return messages.filter((message) => message.role === 'user' && message.source.kind === 'user').at(-1)
    ?.content.find((block) => block.type === 'text')?.text ?? ''
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

  async prepareCall(provider, model, signal) {
    return {
      model: await this.resolveModel(provider, model, signal),
      stream: (options) => this.stream(options),
    }
  }

  async *stream(options) {
    options.signal?.throwIfAborted()
    const question = latestHumanQuestion(options.messages)
    let chunks
    if (options.purpose === 'session-title') chunks = textChunks('曲率与平行移动')
    else if (!hasToolResult(options.messages, 'citeciter-fixture-source-')) {
      chunks = toolChunks('read_source_session', '{"fromSeq":0}', 'citeciter-fixture-source')
    } else if (question.includes('调查项目') && !hasToolResult(options.messages, 'citeciter-fixture-glob-')) {
      chunks = toolChunks('glob', '{"pattern":"*","path":"."}', 'citeciter-fixture-glob')
    } else if (question.includes('调查项目') && !hasToolResult(options.messages, 'citeciter-fixture-grep-')) {
      chunks = toolChunks('grep', '{"pattern":"CiteCiter","path":".","include":"*.json"}', 'citeciter-fixture-grep')
    } else if (question.includes('向我提问') && !hasToolResult(options.messages, 'citeciter-fixture-question-')) {
      chunks = toolChunks('ask_user_question', JSON.stringify({ questions: [{
        id: 'learning-depth',
        header: '学习方式',
        question: '你希望这次解释到什么深度？',
        options: [
          { label: '直觉优先（推荐）', description: '先讲图景，再补必要术语。' },
          { label: '推导优先', description: '从定义和推导逐步展开。' },
        ],
      }] }), 'citeciter-fixture-question')
    } else {
      const answer = question.includes('调查项目')
        ? '项目调查完成：glob 已枚举文件，grep 已完成全局内容搜索。'
        : question.includes('向我提问')
          ? '已收到你的学习偏好，并据此继续解释。'
          : humanQuestionCount(options.messages) > 1 ? FOLLOW_UP_ANSWER : FIRST_ANSWER
      chunks = reasoningTextChunks('正在把工具证据与当前问题整理成清晰回答。', answer)
    }
    for (const chunk of chunks) {
      options.signal?.throwIfAborted()
      await new Promise((resolve) => setTimeout(resolve, 90))
      yield chunk
    }
  }
}

/** Register the fixture route in the disposable Cordis plugin fiber. */
export function apply(ctx) {
  ctx.llm.registerAdapter([PROVIDER], new FixtureAdapter())
}

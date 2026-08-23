/** Deterministic keyless LLM route for the assembled CiteCiter Web smoke. */
import { CallId, LlmAdapter, ReasoningEffortId } from '@deepseek-ai/dsh-llm'

export const name = 'citeciter-fixture-llm'
export const inject = ['llm']

const PROVIDER = 'fixture'
const MODEL = 'fixture'
const ALTERNATE_MODEL = 'fixture-alt'
const FIRST_ANSWER = '首轮回答：平行移动比较同一向量沿不同路径返回后的差异；这个差异由曲率刻画。'
const FOLLOW_UP_ANSWER = '第二轮回答：曲率可以看成无穷小闭合回路的 holonomy；回路越小，偏差的一阶面积项越直接反映曲率。'
const FIRST_ANSWER_WITH_FOLLOWUPS = `${FIRST_ANSWER}\n\n<citeciter-next-questions> [ "能用球面上的例子说明吗？", "holonomy 与曲率是什么关系？", "为什么偏差与回路面积成正比？" ] </citeciter-next-questions>  `
const FOLLOW_UP_ANSWER_WITH_CONTROL = `${FOLLOW_UP_ANSWER}\n\n<citeciter-next-questions> [ "换一种直觉？", "如何形式化？", "边界是什么？" ] </citeciter-next-questions>  `
const MALFORMED_FOLLOWUPS = `${FIRST_ANSWER}\n\n<citeciter-next-questions> [ "只有两个问题？", "应该被静默隐藏吗？" ] </citeciter-next-questions>  `
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
  const marker = '<citeciter-next-'
  const markerIndex = text.indexOf(marker)
  const textDeltas = markerIndex < 0
    ? [text]
    : [text.slice(0, markerIndex + marker.length), text.slice(markerIndex + marker.length)]
  return [
    { type: 'block-start', index: 0, blockType: 'reasoning' },
    { type: 'reasoning-delta', index: 0, text: reasoning },
    { type: 'block-end', index: 0, block: { type: 'reasoning', text: reasoning } },
    { type: 'block-start', index: 1, blockType: 'text' },
    ...textDeltas.map((delta) => ({ type: 'text-delta', index: 1, text: delta })),
    { type: 'block-end', index: 1, block: { type: 'text', text } },
    { type: 'usage', usage: { inputTokens: 1, outputTokens: 1 } },
    { type: 'finish', reason: { kind: 'stop' } },
  ]
}

function toolChunks(name, arguments_, prefix, text = undefined) {
  const id = CallId(`${prefix}-${++callNumber}`)
  const block = {
    type: 'tool-call',
    id,
    name,
    arguments: arguments_,
  }
  const chunks = [
    { type: 'block-start', index: 0, blockType: 'reasoning' },
    { type: 'reasoning-delta', index: 0, text: '正在检查可验证的上下文与工具结果。' },
    { type: 'block-end', index: 0, block: { type: 'reasoning', text: '正在检查可验证的上下文与工具结果。' } },
  ]
  const toolIndex = text === undefined ? 1 : 2
  if (text !== undefined) chunks.push(
    { type: 'block-start', index: 1, blockType: 'text' },
    { type: 'text-delta', index: 1, text },
    { type: 'block-end', index: 1, block: { type: 'text', text } },
  )
  chunks.push(
    { type: 'block-start', index: toolIndex, blockType: 'tool-call' },
    { type: 'tool-call-delta', index: toolIndex, id, name: block.name, argumentsDelta: block.arguments },
    { type: 'block-end', index: toolIndex, block },
    { type: 'usage', usage: { inputTokens: 1, outputTokens: 1 } },
    { type: 'finish', reason: { kind: 'tool-calls' } },
  )
  return chunks
}

function hasToolResult(messages, prefix) {
  return messages.some((message) => message.content.some((block) => (
    block.type === 'tool-result'
    && String(block.toolCallId).startsWith(prefix)
  )))
}

function hasTool(options, name) {
  return options.tools.some((tool) => tool.name === name)
}

function latestHumanQuestion(messages) {
  return messages.filter((message) => message.role === 'user' && message.source.kind === 'user').at(-1)
    ?.content.find((block) => block.type === 'text')?.text ?? ''
}

function alreadyAnswered(messages) {
  return messages.some((message) => message.role === 'assistant' && message.content.some((block) => (
    block.type === 'text' && (block.text.includes(FIRST_ANSWER) || block.text.includes(FOLLOW_UP_ANSWER))
  )))
}

class FixtureAdapter extends LlmAdapter {
  providerInfo() {
    return { id: PROVIDER, name: 'CiteCiter Fixture' }
  }

  listModels() {
    return Promise.resolve([
      { provider: PROVIDER, id: MODEL, name: 'Fixture' },
      { provider: PROVIDER, id: ALTERNATE_MODEL, name: 'Fixture Alt' },
    ])
  }

  resolveModel(provider, model) {
    if (provider !== PROVIDER || model !== MODEL && model !== ALTERNATE_MODEL) {
      return Promise.reject(new Error(`Unknown fixture route ${provider}/${model}`))
    }
    return Promise.resolve({
      provider: PROVIDER,
      id: model,
      name: model === MODEL ? 'Fixture' : 'Fixture Alt',
      reasoning: {
        efforts: [
          { id: ReasoningEffortId('low'), name: 'Low' },
          { id: ReasoningEffortId('max'), name: 'Max' },
        ],
        defaultEffort: ReasoningEffortId('low'),
      },
    })
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
    else if (question.includes('运行中引用测试') && !hasToolResult(options.messages, 'citeciter-fixture-live-')) {
      chunks = toolChunks('ask_user_question', JSON.stringify({ questions: [{
        id: 'continue-live-test',
        header: '继续测试',
        question: '保持这个来源轮次开放，直到完成 CiteCiter 引用测试吗？',
        options: [
          { label: '保持开放（推荐）', description: '等待用户确认，让已提交模型调用保持可引用。' },
          { label: '结束测试', description: '立即结束来源轮次。' },
        ],
      }] }), 'citeciter-fixture-live', '运行中已提交回答：这一段在工具提问等待期间已经落盘，但整个来源轮次尚未结束。')
    } else if (hasTool(options, 'read_source_session') && !hasToolResult(options.messages, 'citeciter-fixture-source-')) {
      chunks = toolChunks('read_source_session', '{"fromSeq":0}', 'citeciter-fixture-source')
    } else if (question.includes('调查项目') && hasTool(options, 'glob') && !hasToolResult(options.messages, 'citeciter-fixture-glob-')) {
      chunks = toolChunks('glob', '{"pattern":"*","path":"."}', 'citeciter-fixture-glob')
    } else if (question.includes('调查项目') && hasTool(options, 'grep') && !hasToolResult(options.messages, 'citeciter-fixture-grep-')) {
      chunks = toolChunks('grep', '{"pattern":"CiteCiter","path":".","include":"*.json"}', 'citeciter-fixture-grep')
    } else if (question.includes('调查项目') && hasTool(options, 'read') && !hasToolResult(options.messages, 'citeciter-fixture-read-')) {
      chunks = toolChunks('read', '{"file_path":"package.json"}', 'citeciter-fixture-read')
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
        ? '项目调查完成：glob 已枚举文件，grep 已完成全局内容搜索，read 已读取命中文件。'
        : question.includes('向我提问')
          ? '已收到你的学习偏好，并据此继续解释。'
          : question.includes('工具能力')
            ? `当前工具：${options.tools.map((tool) => tool.name).sort().join('、')}`
            : alreadyAnswered(options.messages) ? FOLLOW_UP_ANSWER_WITH_CONTROL
              : question.includes('错误快捷问题') ? MALFORMED_FOLLOWUPS : FIRST_ANSWER_WITH_FOLLOWUPS
      chunks = reasoningTextChunks('正在把工具证据与当前问题整理成清晰回答。', answer)
    }
    const chunkDelayMs = question.includes('停止恢复测试')
      ? 500
      : chunks.some((chunk) => chunk.type === 'text-delta' && chunk.text.includes('<citeciter-next-')) ? 800 : 90
    for (const chunk of chunks) {
      options.signal?.throwIfAborted()
      await new Promise((resolve) => setTimeout(resolve, chunkDelayMs))
      yield chunk
    }
  }
}

/** Register the fixture route in the disposable Cordis plugin fiber. */
export function apply(ctx) {
  ctx.llm.registerAdapter([PROVIDER], new FixtureAdapter())
}

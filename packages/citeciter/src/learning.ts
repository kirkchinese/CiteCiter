import { z } from 'zod'
import type { TopicMessage } from './topic.ts'
import { learningExampleSchema, learningExampleMarkdown } from './learning-example.ts'

/** User-selected teaching stages; these indicate intent, never measured mastery. */
export const LEARNING_STAGES = [
  { id: 'logic', label: '底层逻辑', shortLabel: '逻辑', hint: '从定义、成立条件和因果机制讲起。', instruction: '请讲清当前主题的底层逻辑：先给出定义和成立条件，再解释因果机制与为什么成立。区分来源证据、一般知识和假设。只讲这一阶段，不自动推进。' },
  { id: 'qualitative', label: '定性分析', shortLabel: '定性', hint: '看方向、边界，以及改变条件会发生什么。', instruction: '请对当前主题做定性分析：解释变量或因素之间的关系、变化方向、边界与反例，用一个具体情境说明。只讲这一阶段，不自动推进。' },
  { id: 'quantitative', label: '定量分析（板书）', shortLabel: '定量', hint: '把变量、推导和算例写到板书上。', instruction: '请对当前主题做定量分析，并调用 blackboard_apply 整理板书：注明变量、单位、假设、推导步骤与一个可核查算例。示例数值必须标明是假设，不得伪造来源数据。如果此主题不适合定量或信息不足，请明确说明原因。只讲这一阶段，不自动推进。' },
  { id: 'connections', label: '概念关联', shortLabel: '关联', hint: '说明它与哪些概念相连，以及为什么。', instruction: '请围绕当前主题给出 2–4 个最有帮助的概念关联，逐一解释是前提、推论、类比还是对比，说明关联理由与类比的边界。需要时用板书画关系。只讲这一阶段，不自动推进。' },
  { id: 'summary', label: '总结学习卡片', shortLabel: '总结', hint: '先核对与纠错，再整理成学习卡片。', instruction: '请先核对本 Topic 的结论与已有板书：检查定义、成立条件、推导、数值和前后矛盾，不要把此前的模型回答当作证据；必要时读取可用来源。纠正发现的错误，将无法核实的内容明确标为“未核实”或省略，不要补造来源与定位。然后调用 learning_cards 生成 1–6 张学习卡片，每张包含核心结论、一个具体例子、可选自测问题和参考答案；逐项检查这些字段的一致性，纠错必须同步到例子和参考答案。涉及来源事实时保留真实可用的定位，区分来源证据与一般知识。完成后简短说明纠正了什么、还有哪些内容未核实；不安排复习计划。' },
] as const

export type LearningStageId = typeof LEARNING_STAGES[number]['id']

/** Make the entire stage instruction visible and durable as an ordinary Topic user message. */
export function learningQuestion(stageId: LearningStageId, question = ''): string {
  const stage = LEARNING_STAGES.find(candidate => candidate.id === stageId)!
  return `【学习阶段：${stage.label}】\n${stage.instruction}${question.trim() === '' ? '' : `\n\n我的问题：${question.trim()}`}`
}

/** The validation schema and model-visible native tool must expose the same field contract. */
export const LEARNING_CARD_FIELD_DESCRIPTIONS = {
  title: 'Non-empty title, at most 100 characters.',
  summary: 'Markdown summary, at most 2000 characters. Separate independent points with lists or paragraphs; include conditions and corrections.',
  question: 'Non-empty self-test question, at most 500 characters.',
  answer: 'Markdown reference answer, at most 2000 characters, consistent with the summary and example. Fence multiline code.',
} as const

export const learningCardSchema = z.object({
  title: z.string().trim().min(1).max(100).describe(LEARNING_CARD_FIELD_DESCRIPTIONS.title),
  summary: z.string().trim().min(1).max(2000).describe(LEARNING_CARD_FIELD_DESCRIPTIONS.summary),
  example: learningExampleSchema,
  question: z.string().trim().min(1).max(500).describe(LEARNING_CARD_FIELD_DESCRIPTIONS.question),
  answer: z.string().trim().min(1).max(2000).describe(LEARNING_CARD_FIELD_DESCRIPTIONS.answer),
}).strict()

export const learningCardsInputSchema = z.object({ cards: z.array(learningCardSchema).min(1).max(8) }).strict()
export type LearningCard = z.infer<typeof learningCardSchema>

// Legacy strings are accepted only at the log reader, never for new tool calls.
// Their original Markdown presentation is preserved without rewriting old records.
const persistedCardsInputSchema = z.object({ cards: z.array(learningCardSchema.extend({
  example: z.union([
    learningExampleSchema,
    z.string().trim().min(1).max(1500).transform(content => ({ kind: 'text' as const, content })),
  ]),
})).min(1).max(8) }).strict()

export interface LearningCardsProjection {
  readonly cards: readonly LearningCard[]
  /** Successful tool message owning this set, or null before any valid set exists. */
  readonly messageId: string | null
  readonly invalid: number
}

/**
 * Recover the latest complete card set from successful Topic tool records.
 * Pending, failed and malformed records cannot replace the previous valid set.
 * No separate storage or migration is needed; older sets remain in the Topic log.
 */
export function projectLearningCards(messages: readonly TopicMessage[]): LearningCardsProjection {
  let result: LearningCardsProjection = { cards: [], messageId: null, invalid: 0 }
  for (const message of messages) {
    if (message.role !== 'tool' || message.name !== 'learning_cards' || message.running || message.isError || message.result === null) continue
    try {
      const input = persistedCardsInputSchema.parse(JSON.parse(message.arguments))
      const output = z.object({ saved: z.number().int().min(1).max(8) }).strict().parse(JSON.parse(message.result))
      if (output.saved !== input.cards.length) throw new Error('card count does not match the committed result')
      result = { ...result, cards: input.cards, messageId: message.id }
    } catch {
      // A malformed persisted tool record must not erase an earlier usable set.
      result = { ...result, invalid: result.invalid + 1 }
    }
  }
  return result
}

/** Export the visible set with its Topic provenance; content is plain Markdown, never executed. */
export function learningCardsMarkdown(cards: readonly LearningCard[], topicTitle: string, topicId: string, source: string): string {
  return `# ${topicTitle}\n\nTopic: ${topicId}\n\n来源：${source}\n\n${cards.map((card, index) => `## ${index + 1}. ${card.title}\n\n${card.summary}\n\n**例子**\n\n${learningExampleMarkdown(card.example)}\n\n**可选自测**\n\n${card.question}\n\n**参考答案**\n\n${card.answer}`).join('\n\n---\n\n')}\n`
}

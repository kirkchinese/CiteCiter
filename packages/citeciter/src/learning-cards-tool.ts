/** The model-facing learning_cards tool; card sets are read back from committed tool records. */
import { defineTool } from '@deepseek-ai/dsh-tools'
import { LEARNING_CARD_FIELD_DESCRIPTIONS, learningCardsInputSchema } from './learning.ts'
import { LEARNING_EXAMPLE_PARAMETER } from './learning-example.ts'

/**
 * Create the learning_cards tool. It validates structure only and stores nothing outside the Topic log.
 * @returns a tool definition for one Topic tool registry.
 */
export function createLearningCardsTool() {
  return defineTool({
    name: 'learning_cards',
    description: 'Save a complete set of 1–8 summary learning cards inside this Topic only. Use only when asked to summarize or revise cards. First check conclusions against available evidence, correct errors in every field including examples and answers, and label unresolved claims as unverified or omit them. Replaces the displayed set; older sets remain in the Topic log. This tool validates structure, not factual accuracy.',
    parameters: {
      cards: {
        type: 'array', required: true, description: 'Complete set of 1–8 cards.',
        items: {
          type: 'object', additionalProperties: false,
          properties: {
            title: { type: 'string', required: true, description: LEARNING_CARD_FIELD_DESCRIPTIONS.title },
            summary: { type: 'string', required: true, description: LEARNING_CARD_FIELD_DESCRIPTIONS.summary },
            example: LEARNING_EXAMPLE_PARAMETER,
            question: { type: 'string', required: true, description: LEARNING_CARD_FIELD_DESCRIPTIONS.question },
            answer: { type: 'string', required: true, description: LEARNING_CARD_FIELD_DESCRIPTIONS.answer },
          },
        },
      },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: { saved: { type: 'integer', required: true } } },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }],
      presentationMeta: (_args, value) => ({ saved: value.saved }),
    },
    execute: async (args, exec) => {
      if (exec.agent?.session === undefined) throw new Error('learning_cards requires a Topic Session')
      const { cards } = learningCardsInputSchema.parse(args)
      return { saved: cards.length }
    },
    presentCall: () => ({ card: 'generic', title: '整理学习卡片' }),
    presentResult: (_args, result) => ({ card: 'generic', title: result.isError ? '学习卡片未保存' : '学习卡片已保存' }),
  })
}

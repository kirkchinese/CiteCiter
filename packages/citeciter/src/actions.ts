import { z } from 'zod'
import { learningQuestion } from './learning.ts'

/**
 * One persisted wheel slot; its prompt is sent as a durable user message.
 * Fields saved by older versions, such as `scenario`, are dropped when read.
 */
export const citeActionSchema = z.object({
  label: z.string().trim().min(1).max(20),
  prompt: z.string().max(4000),
  ask: z.boolean(),
  presentation: z.enum(['side', 'floating']),
  target: z.enum(['current', 'new']).optional(),
}).refine(action => action.ask || action.prompt.trim() !== '', '直接执行的模式需要提示词')
export type CiteAction = z.infer<typeof citeActionSchema>
export const wheelSlotsSchema = z.array(citeActionSchema.nullable()).length(8)
export const wheelTriggerSchema = z.enum(['right-button', 'Alt', 'Control', 'Shift', 'Meta'])
export type WheelTrigger = z.infer<typeof wheelTriggerSchema>
export type PanelPresentation = CiteAction['presentation']
export const actionModelSchema = z.object({ provider: z.string().min(1).max(200), model: z.string().min(1).max(200) }).strict()
export type ActionModel = z.infer<typeof actionModelSchema>

/** Clockwise from twelve o'clock. Empty slots retain their positions. */
export const DEFAULT_WHEEL_SLOTS: readonly (CiteAction | null)[] = [
  { label: '自由提问', prompt: '', ask: true, presentation: 'side', target: 'current' },
  { label: '解释这段', prompt: learningQuestion('logic'), ask: false, presentation: 'side' },
  { label: '找错误', prompt: '请审查引用内容的错误、遗漏和成立条件。区分可确认的错误与需要补充的信息。', ask: false, presentation: 'floating' },
  { label: '翻译', prompt: '请将引用内容翻译为中文，保留重要术语的原文。', ask: false, presentation: 'floating' },
  { label: '定量板书', prompt: learningQuestion('quantitative'), ask: false, presentation: 'side' },
  { label: '总结卡片', prompt: learningQuestion('summary', '围绕本次引用的内容整理。'), ask: false, presentation: 'side' },
  null,
  null,
]

/** Slots saved before targets existed append only when they are the unchanged built-in free question. */
export function actionTarget(action: CiteAction): 'current' | 'new' {
  if (action.target !== undefined) return action.target
  return action.label === '自由提问' && action.prompt === '' && action.ask && action.presentation === 'side' ? 'current' : 'new'
}

/** Combine a mode and optional user question without hidden system state. */
export function actionQuestion(action: CiteAction, question: string): string {
  return [action.prompt.trim(), question.trim() === '' ? '' : `我的问题：${question.trim()}`].filter(Boolean).join('\n\n')
}

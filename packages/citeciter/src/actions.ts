import { z } from 'zod'
import { learningQuestion } from './learning.ts'

/**
 * One persisted action slot, shown in the selection toolbar and the optional wheel.
 * An `ask` action opens the composer for the user's own question; any other action
 * sends its prompt as a durable user message. Fields saved by older versions, such as
 * `scenario` and `target`, are read but no longer change where an action goes.
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
/** Whether a preset action sends at once or only fills the composer. */
export const actionDeliverySchema = z.enum(['send', 'draft'])
export type ActionDelivery = z.infer<typeof actionDeliverySchema>
export type PanelPresentation = CiteAction['presentation']
export const actionModelSchema = z.object({ provider: z.string().min(1).max(200), model: z.string().min(1).max(200) }).strict()
export type ActionModel = z.infer<typeof actionModelSchema>

/** Toolbar order, and clockwise from twelve o'clock on the wheel. Empty slots retain their positions. */
export const DEFAULT_WHEEL_SLOTS: readonly (CiteAction | null)[] = [
  { label: '问 Citer', prompt: '', ask: true, presentation: 'side' },
  { label: '解释', prompt: learningQuestion('logic'), ask: false, presentation: 'side' },
  { label: '找错误', prompt: '请审查引用内容的错误、遗漏和成立条件。区分可确认的错误与需要补充的信息。', ask: false, presentation: 'floating' },
  { label: '翻译', prompt: '请将引用内容翻译为中文，保留重要术语的原文。', ask: false, presentation: 'floating' },
  { label: '板书', prompt: learningQuestion('quantitative'), ask: false, presentation: 'side' },
  { label: '学习卡', prompt: learningQuestion('summary', '围绕本次引用的内容整理。'), ask: false, presentation: 'side' },
  null,
  null,
]

/** English built-in actions, used only when the active UI language is not Chinese. */
export const ENGLISH_WHEEL_SLOTS: readonly (CiteAction | null)[] = [
  { label: 'Ask Citer', prompt: '', ask: true, presentation: 'side' },
  { label: 'Explain', prompt: englishLearningQuestion('Underlying logic'), ask: false, presentation: 'side' },
  { label: 'Find errors', prompt: 'Review the quoted content for errors, omissions, and conditions under which its claims hold. Distinguish confirmed errors from information that still needs to be checked.', ask: false, presentation: 'floating' },
  { label: 'Translate', prompt: 'Translate the quoted content into English, preserving important terms in their original language.', ask: false, presentation: 'floating' },
  { label: 'Blackboard', prompt: englishLearningQuestion('Quantitative analysis (blackboard)'), ask: false, presentation: 'side' },
  { label: 'Study cards', prompt: englishLearningQuestion('Summary study cards', 'Organize the content around this quote.'), ask: false, presentation: 'side' },
  null,
  null,
]

function englishLearningQuestion(stage: 'Underlying logic' | 'Quantitative analysis (blackboard)' | 'Summary study cards', question = ''): string {
  const instructions = {
    'Underlying logic': 'Explain the underlying logic of the current topic: start with definitions and conditions, then explain the causal mechanism and why it works. Distinguish source evidence, general knowledge, and assumptions. Cover this stage only; do not advance automatically.',
    'Quantitative analysis (blackboard)': 'Analyze the current topic quantitatively and use blackboard_apply to organize the blackboard: specify variables, units, assumptions, derivation steps, and one verifiable worked example. Mark example values as hypothetical; do not invent source data. If quantitative analysis is unsuitable or information is insufficient, explain why. Cover this stage only; do not advance automatically.',
    'Summary study cards': 'First check and correct the conclusions and existing blackboard in this Topic: review definitions, conditions, derivations, numbers, and contradictions. Do not treat earlier model responses as evidence; consult available sources if needed. Correct mistakes and mark unverifiable claims as unverified or omit them; do not invent sources or locations. Then call learning_cards to create 1–6 study cards, each with a key conclusion, a concrete example, an optional self-test question, and a reference answer. Check that these fields agree, including corrections in examples and answers. Preserve real source locations for source-dependent facts and distinguish evidence from general knowledge. Briefly report corrections and remaining unverified claims; do not schedule reviews.',
  } as const
  return `[Learning stage: ${stage}]\n${instructions[stage]}${question.trim() === '' ? '' : `\n\nMy question: ${question.trim()}`}`
}

/** Built-in actions as earlier versions saved them, by their position in the built-in list. */
const EARLIER_BUILT_INS: readonly (readonly [number, CiteAction])[] = [
  [0, { label: '提问', prompt: '', ask: true, presentation: 'side' }],
  [0, { label: 'Ask', prompt: '', ask: true, presentation: 'side' }],
]

/** Which built-in action `slot` is, in any language or earlier version; -1 when the user changed it. */
function builtInIndex(slot: CiteAction): number {
  const same = (original: CiteAction | null) => original !== null && slot.label === original.label
    && slot.prompt === original.prompt && slot.ask === original.ask && slot.presentation === original.presentation
  const current = [DEFAULT_WHEEL_SLOTS, ENGLISH_WHEEL_SLOTS].map(list => list.findIndex(same)).find(index => index >= 0)
  return current ?? EARLIER_BUILT_INS.find(([, original]) => same(original))?.[0] ?? -1
}

/**
 * Resolve the actions for the current UI language without changing persisted settings. Saving
 * actions stores the whole list, so each slot is judged on its own: a built-in action the user
 * left unchanged (even if moved, saved in another language or by an earlier version) shows in the
 * current language; an edited or added action stays as written.
 */
export function localizedWheelSlots(slots: readonly (CiteAction | null)[] | undefined, chinese: boolean): readonly (CiteAction | null)[] {
  const builtIns = chinese ? DEFAULT_WHEEL_SLOTS : ENGLISH_WHEEL_SLOTS
  if (slots === undefined) return builtIns
  const localized = slots.map((slot) => {
    if (slot === null) return null
    const builtIn = builtIns[builtInIndex(slot)]
    if (builtIn == null || builtIn.label === slot.label && builtIn.prompt === slot.prompt) return slot
    return { ...builtIn, ...(slot.target === undefined ? {} : { target: slot.target }) }
  })
  return localized.every((slot, index) => slot === slots[index]) ? slots : localized
}

/**
 * Decide how a chosen action is delivered.
 * @param action - the chosen slot.
 * @param preference - the user's preset-action setting.
 * @returns `draft` for questions the user writes, otherwise the preference.
 */
export function actionDelivery(action: CiteAction, preference: ActionDelivery | undefined): ActionDelivery {
  return action.ask ? 'draft' : preference ?? 'send'
}

/** Combine a mode and optional user question without hidden system state. */
export function actionQuestion(action: CiteAction, question: string): string {
  return [action.prompt.trim(), question.trim() === '' ? '' : `我的问题：${question.trim()}`].filter(Boolean).join('\n\n')
}

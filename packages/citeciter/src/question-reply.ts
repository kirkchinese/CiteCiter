import { z } from 'zod'

/** Client-safe presentation of a durable late answer; the original model payload stays in the Session log. */
export const questionReplySchema = z.object({
  callId: z.string().min(1),
  items: z.array(z.object({
    id: z.string().min(1),
    question: z.string(),
    header: z.string().optional(),
    values: z.array(z.string()),
  }).strict()),
}).strict()

export type QuestionReply = z.infer<typeof questionReplySchema>

const payloadSchema = z.object({
  kind: z.literal('answer_to_pending_question'),
  tool: z.literal('ask_user_question'),
  callId: z.string(),
  questions: z.array(z.object({ id: z.string().min(1), question: z.string(), header: z.string().optional() })).min(1),
  answers: z.array(z.object({ id: z.string().min(1), selected: z.array(z.string()), custom: z.string().optional() })),
})

/**
 * Read the official late-answer payload at the persisted-data boundary.
 * @param text - Text of one committed user-question-reply message.
 * @param callId - Identity from the message source, which the payload must match.
 * @returns Question/answer pairs, or an empty presentation for unreadable history; never raw internal JSON.
 */
export function readQuestionReply(text: string, callId: string): QuestionReply {
  const unreadable: QuestionReply = { callId, items: [] }
  let value: unknown
  try { value = JSON.parse(text) }
  catch { return unreadable } // Old or damaged reply text cannot safely be displayed as structured answers.
  const parsed = payloadSchema.safeParse(value)
  if (!parsed.success || parsed.data.callId !== callId) return unreadable
  const { questions, answers } = parsed.data
  const byId = new Map(answers.map(answer => [answer.id, answer]))
  if (new Set(questions.map(question => question.id)).size !== questions.length
    || byId.size !== answers.length || questions.length !== answers.length
    || questions.some(question => !byId.has(question.id))) return unreadable
  return { callId, items: questions.map(question => {
    const answer = byId.get(question.id)!
    const custom = answer.custom ?? ''
    return { ...question, values: [...answer.selected, ...(custom.trim() === '' ? [] : [custom])] }
  }) }
}

/** Human-readable transcript text for copying and other plain-text consumers. */
export function questionReplyText(reply: QuestionReply): string {
  if (reply.items.length === 0) return '已补答；这条历史回答的格式无法解析。'
  return '补答\n\n' + reply.items.map(item => `${item.question}\n${item.values.length === 0 ? '已跳过' : `回答：${item.values.join('、')}`}`).join('\n\n')
}

/** Derived tool-row summary; never replaces the original recorded tool result. */
export function questionReplySummary(reply: QuestionReply): string {
  const values = reply.items.flatMap(item => item.values.length === 0 ? ['已跳过'] : item.values)
  return values.length === 0 ? '已补答' : `已补答 · ${values.join('、')}`
}

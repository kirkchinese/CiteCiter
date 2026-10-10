import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { ToolCallId } from '@deepseek-ai/dsh-llm/brand'
import { createUserMessage, type MessageId } from '@deepseek-ai/dsh-llm'
import type { AskUserQuestionAnswer, AskUserQuestionItem, AskUserQuestionRequest } from '@deepseek-ai/dsh-user-questions'
import type { PendingQuestion, QuestionAnswer } from './topic.ts'

type Reply = (callId: ToolCallId, answer: AskUserQuestionAnswer) => boolean

/** Keep late replies inside an explicitly injected contribution owned by the exact Topic Agent. */
export class TopicQuestionReplies {
  private readonly replies = new WeakMap<Agent, Reply>()
  private readonly recoveredReplies = new WeakMap<Agent, Map<string, { messageId: MessageId; turn?: number }>>()

  /**
   * Bind the official answer service in a child of the Topic contribution scope.
   * @param ctx - Topic-owned contribution context; its teardown releases this binding.
   * @param agent - Exact live Agent receiving replies, never a Host list lookup.
   */
  async attach(ctx: Context, agent: Agent): Promise<void> {
    await ctx.plugin({
      name: 'citeciter-question-replies',
      inject: ['userQuestions'],
      apply: (scope: Context) => {
        const reply: Reply = (callId, answer) => scope.userQuestions.answer(agent, callId, answer)
        scope.effect(() => {
          this.replies.set(agent, reply)
          return () => {
            if (this.replies.get(agent) === reply) this.replies.delete(agent)
            this.recoveredReplies.delete(agent)
          }
        }, 'citeciter: scoped question replies')
        scope.on('agent/inbox/claimed', ({ agent: owner, message, turn }) => {
          if (owner !== agent || message.source.kind !== 'user-question-reply') return
          const pending = this.recoveredReplies.get(agent)?.get(message.source.callId)
          if (pending?.messageId === message.id) pending.turn = turn
        }, { global: true })
        scope.on('agent/inbox/discarded', ({ agent: owner, message }) => {
          if (owner !== agent || message.source.kind !== 'user-question-reply') return
          const pending = this.recoveredReplies.get(agent)
          if (pending?.get(message.source.callId)?.messageId === message.id) pending.delete(message.source.callId)
        }, { global: true })
        scope.on('session/event', (session, event) => {
          if (session !== agent.session) return
          const pending = this.recoveredReplies.get(agent)
          if (pending === undefined) return
          if (event.type === 'user/message' && event.data.source.kind === 'user-question-reply') pending.delete(event.data.source.callId)
          else if (event.type === 'turn/end') {
            for (const [id, reply] of pending) if (reply.turn === event.data.turn) pending.delete(id)
          }
        }, { global: true })
      },
    })
  }

  /** Route a continued answer through its live injected service; absence must never recreate the Agent. */
  answer(agent: Agent, callId: ToolCallId, answer: AskUserQuestionAnswer): boolean {
    const reply = this.replies.get(agent)
    if (reply === undefined) throw new Error('这个 Topic 的提问服务已结束，请重新打开后重试')
    return reply(callId, answer)
  }

  /** A queued answer is hidden until the Host admits or explicitly discards it. */
  isQueued(agent: Agent, callId: string): boolean {
    return this.recoveredReplies.get(agent)?.has(callId) === true || [...agent.inbox.nextTurn, ...agent.inbox.nextStep].some(message =>
      message.source.kind === 'user-question-reply' && message.source.callId === callId)
  }

  /**
   * Manually continue an interrupted legacy ask through the public Agent Inbox.
   * The old tool result remains intact; the new, durable user message names the
   * original call and preserves its question/answer batch for model replay.
   * Caller validates the exact recovered question and holds Topic admission/CAS.
   */
  answerRecoveredBlocking(agent: Agent, question: PendingQuestion, answer: AskUserQuestionAnswer): void {
    if (!this.replies.has(agent) || question.blocking !== true || question.callId === undefined) throw new Error('此问题的补答服务已结束')
    const callId = question.callId as ToolCallId
    if (this.isQueued(agent, callId)) throw new Error('这条问题的回答已经排队，未重复提交')
    const message = createUserMessage({
      source: { kind: 'user-question-reply', callId, outcome: 'answered' },
      content: [{ type: 'text', text: JSON.stringify({ kind: 'answer_to_pending_question', tool: 'ask_user_question', callId,
        questions: question.questions, answers: answer.answers }) }],
    })
    const pending = this.recoveredReplies.get(agent) ?? new Map<string, { messageId: MessageId; turn?: number }>()
    pending.set(callId, { messageId: message.id })
    this.recoveredReplies.set(agent, pending)
    try { agent.steer(message) }
    catch (error) { pending.delete(callId); throw error }
  }
}

/** A named Host call keeps one answer identity across the foreground/continued boundary. */
export function questionKey(sessionId: string, callId: string): string {
  return `question:${sessionId}:${callId}`
}

/** Copy only the public question presentation, including supporting plan/detail text. */
export function questionPresentation(questions: readonly AskUserQuestionItem[]): PendingQuestion['questions'] {
  return questions.map(question => ({
    id: question.id, question: question.question,
    ...(question.header === undefined ? {} : { header: question.header }),
    ...(question.detail === undefined ? {} : { detail: question.detail }),
    ...(question.options === undefined ? {} : { options: question.options.map(option => ({ ...option })) }),
    ...(question.multiSelect === undefined ? {} : { multiSelect: question.multiSelect }),
  }))
}

/** Project a live private waterfall without assuming that every question blocks indefinitely. */
export function openQuestion(
  key: string, questions: readonly AskUserQuestionItem[], wait: AskUserQuestionRequest['wait'], callId?: string,
): PendingQuestion {
  return { key, questions: questionPresentation(questions), state: 'open',
    ...(wait === undefined ? { blocking: true, ...(callId === undefined ? {} : { callId }) } : { callId: String(wait.callId), timed: wait.timed === true }) }
}

/**
 * Read the Host's durable question projection for this exact owned Agent.
 * Replies already in its native Inbox are excluded until admitted/discarded.
 * No Session is registered in the Host list and no log format is rewritten.
 */
export function continuedQuestions(agent: Agent): PendingQuestion[] {
  const state = agent.ctx.get('sessionProjections')?.stateOf(agent.session, 'userQuestions')
  const queued = [...agent.inbox.nextTurn, ...agent.inbox.nextStep]
  return (state?.questions.active ?? [])
    .filter(question => question.state === 'continued' && !queued.some(message =>
      message.source.kind === 'user-question-reply' && message.source.callId === question.callId))
    .map(question => ({ key: questionKey(String(agent.session.header.id), String(question.callId)),
      callId: String(question.callId), state: 'continued', questions: questionPresentation(question.questions) }))
}

/**
 * Validate a complete answer against the exact Host question before it is submitted.
 * @param questions - the pending question items.
 * @param answer - one answer per question.
 * @param allowSkipped - whether an unanswered optional item may be submitted empty.
 * @returns the answer in the Host's format.
 */
export function validateQuestionAnswer(
  questions: readonly { readonly id: string; readonly options?: readonly { readonly label: string }[] | undefined; readonly multiSelect?: boolean | undefined }[],
  answer: QuestionAnswer,
  allowSkipped = false,
): AskUserQuestionAnswer {
  if (answer.answers.length !== questions.length) throw new Error('每个问题都需要回答')
  const byId = new Map(answer.answers.map((item) => [item.id, item]))
  if (byId.size !== answer.answers.length) throw new Error('问题回答包含重复 id')
  return {
    answers: questions.map((question) => {
      const item = byId.get(question.id)
      if (item === undefined) throw new Error(`缺少问题 ${question.id} 的回答`)
      const selected = [...new Set(item.selected)]
      if (selected.length !== item.selected.length) throw new Error(`问题 ${question.id} 包含重复选项`)
      const labels = new Set(question.options?.map((option) => option.label) ?? [])
      if (selected.some((label) => !labels.has(label))) throw new Error(`问题 ${question.id} 包含未知选项`)
      const custom = item.custom
      const hasCustom = custom !== undefined && custom.trim() !== ''
      if (allowSkipped && selected.length === 0 && !hasCustom) return { id: question.id, selected: [] }
      if (question.multiSelect !== true && selected.length + (hasCustom ? 1 : 0) !== 1) {
        throw new Error(`问题 ${question.id} 只能选择一个答案`)
      }
      if (question.multiSelect === true && selected.length === 0 && !hasCustom) {
        throw new Error(`问题 ${question.id} 尚未回答`)
      }
      return {
        id: question.id,
        selected,
        ...(hasCustom ? { custom } : {}),
      }
    }),
  }
}

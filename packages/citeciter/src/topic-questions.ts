import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { ToolCallId } from '@deepseek-ai/dsh-llm/brand'
import type { AskUserQuestionAnswer, AskUserQuestionItem, AskUserQuestionRequest } from '@deepseek-ai/dsh-user-questions'
import type { PendingQuestion } from './topic.ts'

type Reply = (callId: ToolCallId, answer: AskUserQuestionAnswer) => boolean

/** Keep late replies inside an explicitly injected contribution owned by the exact Topic Agent. */
export class TopicQuestionReplies {
  private readonly replies = new WeakMap<Agent, Reply>()

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
          return () => { if (this.replies.get(agent) === reply) this.replies.delete(agent) }
        }, 'citeciter: scoped question replies')
      },
    })
  }

  /** Route a continued answer through its live injected service; absence must never recreate the Agent. */
  answer(agent: Agent, callId: ToolCallId, answer: AskUserQuestionAnswer): boolean {
    const reply = this.replies.get(agent)
    if (reply === undefined) throw new Error('这个 Topic 的提问服务已结束，请重新打开后重试')
    return reply(callId, answer)
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
  key: string, questions: readonly AskUserQuestionItem[], wait: AskUserQuestionRequest['wait'],
): PendingQuestion {
  return { key, questions: questionPresentation(questions), state: 'open',
    ...(wait === undefined ? {} : { callId: String(wait.callId), timed: wait.timed === true }) }
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

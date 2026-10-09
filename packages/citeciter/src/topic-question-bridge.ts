import { AsyncLocalStorage } from 'node:async_hooks'
import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { AskUserQuestionAnswer, AskUserQuestionRequest } from '@deepseek-ai/dsh-user-questions'
import type {} from '@deepseek-ai/dsh-tools'

/**
 * Bind one owned Agent's ordinary question waterfall before generic Client answerers.
 * The legacy tool omits wait.callId; its public execution boundary supplies the exact
 * identity across async work and parallel PTC dispatches without guessing from logs.
 * Plan-review and unidentified/non-owned requests retain their native answerer.
 */
export function bindTopicQuestionBridge(
  ctx: Context,
  agent: Agent,
  answer: (request: AskUserQuestionRequest, callId: string) => Promise<AskUserQuestionAnswer>,
): void {
  const calls = new AsyncLocalStorage<string>()
  ctx.effect(() => () => calls.disable(), 'citeciter: question execution identity')
  ctx.on('tools/execute', (execution, next) => {
    if (execution.agent !== agent || execution.name !== 'ask_user_question') return next()
    return calls.run(String(execution.callId), next)
  }, { global: true, prepend: true })
  ctx.on('user-questions/request', (request, next) => {
    if (request.agent !== agent || request.questions.some(question => question.intent?.kind === 'plan-review')) return next()
    const callId = request.wait?.callId ?? calls.getStore()
    return callId === undefined ? next() : answer(request, String(callId))
  }, { global: true, prepend: true })
}

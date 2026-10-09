import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { AskUserQuestionAnswer, AskUserQuestionRequest } from '@deepseek-ai/dsh-user-questions';
/**
 * Bind one owned Agent's ordinary question waterfall before generic Client answerers.
 * The legacy tool omits wait.callId; its public execution boundary supplies the exact
 * identity across async work and parallel PTC dispatches without guessing from logs.
 * Plan-review and unidentified/non-owned requests retain their native answerer.
 */
export declare function bindTopicQuestionBridge(ctx: Context, agent: Agent, answer: (request: AskUserQuestionRequest, callId: string) => Promise<AskUserQuestionAnswer>): void;

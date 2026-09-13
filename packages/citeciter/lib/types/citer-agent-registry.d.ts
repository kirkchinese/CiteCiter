import type { Context } from '@deepseek-ai/cordis';
import AgentRegistry, { type Agent } from '@deepseek-ai/dsh-agent';
import type { SessionId } from '@deepseek-ai/dsh-session';
/** Own a separate factory while publishing live identities through DSH's public registry for its conversation, upload and queue APIs. */
export declare class CiterAgentRegistry extends AgentRegistry {
    private readonly options;
    constructor(ctx: Context, options: {
        readonly registry: AgentRegistry;
    });
    enter(agent: Agent, owner: Agent | undefined): () => void;
    announce(agent: Agent): void;
    register(agent: Agent): () => void;
    get(id: SessionId): Agent | undefined;
    list(): Agent[];
    roots(): Agent[];
    isOwnedBy(id: SessionId, owner: Agent): boolean;
    currentInitiator(): Agent | undefined;
    requireInitiator(): Agent;
    withInitiator<T>(agent: Agent, operation: () => T): T;
    withoutInitiator<T>(operation: () => T): T;
}

import type { Context } from '@deepseek-ai/cordis';
import AgentRegistry from '@deepseek-ai/dsh-agent';
/** Own a separate factory while publishing live identities through DSH's public registry for its conversation, upload and queue APIs. */
export declare class CiterAgentRegistry extends AgentRegistry {
    constructor(ctx: Context, options: {
        readonly registry: AgentRegistry;
    });
}

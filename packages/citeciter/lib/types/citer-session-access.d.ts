import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type SessionStore from '@deepseek-ai/dsh-session';
import type { Session } from '@deepseek-ai/dsh-session';
/**
 * Route durability checkpoints to owned stores, and answer the Host store's id lookups for a Topic while its
 * Agent prepares a model request, without publishing Topic identities to the rest of the Host.
 */
export declare class CiterSessionAccess {
    private readonly owners;
    /** The Topic whose Agent is inside its `agent/request` waterfall in this asynchronous chain. */
    private readonly requesting;
    /** Install one reversible adapter for this plugin's lifetime. No Host files or Agent Loop methods change. */
    constructor(ctx: Context, drain: () => Promise<void>);
    /** Register after native enter; unregister after native detach, including failed publication. */
    enter(session: Session, store: SessionStore): () => void;
    /**
     * Mark one Topic Agent's request waterfall. Registered on the Agent's own context after the Host plugins
     * started, with `prepend`, so it runs before their listeners and they see the Topic while it is marked.
     * @param agentCtx - the Topic Agent's contribution context; the listener leaves with it.
     */
    attach(agentCtx: Context, agent: Agent): void;
}

import type { Context } from '@deepseek-ai/cordis';
import type { AgentHandle } from '@deepseek-ai/dsh-agent';
import type { CiterSessionAccess } from './citer-session-access.ts';
/** A Topic-owned DSH factory and JSONL backend; live conversation APIs stay shared, disk ownership does not. */
export declare class CiterSessionWorld {
    private fiber;
    private readonly started;
    private disposal;
    private readonly handles;
    private release;
    private closing;
    /** @param host - owning plugin context. @param root - verified Topic-owned JSONL directory. */
    constructor(host: Context, root: string, access: CiterSessionAccess);
    /** Wait for the isolated factory before creating or restoring a Topic. */
    context(): Promise<Context>;
    /** Retain the native handle so Agents settle while their persistence listeners are still mounted. */
    own(handle: AgentHandle): Promise<AgentHandle>;
    private start;
    /** Stop and drain all factory-owned Agents before the caller can delete this Topic's files. */
    dispose(): Promise<void>;
}

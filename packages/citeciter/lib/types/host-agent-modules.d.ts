import type { Context } from '@deepseek-ai/cordis';
import type AgentLoop from '@deepseek-ai/dsh-agent-loop';
import type SessionStore from '@deepseek-ai/dsh-session';
interface HostScope {
    readonly ctx: Context;
    dispose(): Promise<void>;
}
export interface HostAgentModules {
    readonly AgentLoop: typeof AgentLoop;
    readonly SessionStore: typeof SessionStore;
    readonly createScope: (ctx: Context, key: object) => HostScope;
}
/** Resolve published runtime modules from the actual launcher, preserving Desktop's module identities across external-plugin fallback paths. */
export declare function loadHostAgentModules(): Promise<HostAgentModules>;
export {};

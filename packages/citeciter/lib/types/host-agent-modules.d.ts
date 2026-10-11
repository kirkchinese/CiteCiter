import type { Context, Plugin } from '@deepseek-ai/cordis';
import type AgentLoop from '@deepseek-ai/dsh-agent-loop';
import type SessionStore from '@deepseek-ai/dsh-session';
import type SessionTitleService from '@deepseek-ai/dsh-session-title';
interface HostScope {
    readonly ctx: Context;
    dispose(): Promise<void>;
}
/** Required policy of DSH's model-backed title provider; all fields are required by its Loader schema. */
export interface SessionTitleLlmConfig {
    readonly targetWords: number;
    readonly targetCjkCharacters: number;
    readonly maxInputBytes: number;
    readonly maxOutputTokens: number;
    readonly timeoutMs: number;
}
export interface HostAgentModules {
    readonly AgentLoop: typeof AgentLoop;
    readonly SessionStore: typeof SessionStore;
    readonly SessionTitleService: typeof SessionTitleService;
    /** DSH's own first-prompt model title provider, the one `dsh-base` mounts for host sessions. */
    readonly SessionTitleProvider: Plugin<SessionTitleLlmConfig>;
    readonly createScope: (ctx: Context, key: object) => HostScope;
}
/**
 * Load the declared SDK peers through DSH's active profile resolver.
 * File URLs bypass peer routing and can create a second private scope identity,
 * particularly when Electron ASAR paths use different casing on Windows.
 * Bare imports also leave CLI symlinks and Desktop packaging to the host resolver.
 * @returns the host's AgentLoop, SessionStore, title service and provider, and scope factory.
 */
export declare function loadHostAgentModules(): Promise<HostAgentModules>;
export {};

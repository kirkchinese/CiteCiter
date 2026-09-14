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
/**
 * Resolve runtime modules from the host installation, not the plugin's dependencies.
 * CLI argv can name an npm/pnpm symlink; canonicalize it before walking node_modules.
 * Desktop retains its app.asar anchor and module identities without filesystem realpath.
 * @returns the host's AgentLoop, SessionStore and scope factory.
 * @throws when the launcher cannot be located or its runtime exports are unavailable.
 */
export declare function loadHostAgentModules(): Promise<HostAgentModules>;
export {};

import type { Context } from '@deepseek-ai/cordis';
import type AgentLoop from '@deepseek-ai/dsh-agent-loop';
import type SessionStore from '@deepseek-ai/dsh-session';
import type SessionTitleService from '@deepseek-ai/dsh-session-title';
interface HostScope {
    readonly ctx: Context;
    dispose(): Promise<void>;
}
export interface HostAgentModules {
    readonly AgentLoop: typeof AgentLoop;
    readonly SessionStore: typeof SessionStore;
    readonly SessionTitleService: typeof SessionTitleService;
    readonly createScope: (ctx: Context, key: object) => HostScope;
}
/**
 * Resolve runtime modules from the host installation, not the plugin's dependencies.
 * CLI argv can name an npm/pnpm symlink; canonicalize it before walking node_modules.
 * Desktop accepts app.asar and unpacked app layouts without canonicalizing virtual paths.
 * @returns the host's AgentLoop, SessionStore, title service and scope factory.
 * @throws when the launcher cannot be located or its runtime exports are unavailable.
 */
export declare function loadHostAgentModules(): Promise<HostAgentModules>;
export {};

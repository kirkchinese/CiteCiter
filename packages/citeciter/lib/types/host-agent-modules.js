var __rewriteRelativeImportExtension = (this && this.__rewriteRelativeImportExtension) || function (path, preserveJsx) {
    if (typeof path === "string" && /^\.\.?\//.test(path)) {
        return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function (m, tsx, d, ext, cm) {
            return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : (d + ext + "." + cm.toLowerCase() + "js");
        });
    }
    return path;
};
import { realpath } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { isAbsolute, join } from 'node:path';
import { pathToFileURL } from 'node:url';
/**
 * Resolve runtime modules from the host installation, not the plugin's dependencies.
 * CLI argv can name an npm/pnpm symlink; canonicalize it before walking node_modules.
 * Desktop retains its app.asar anchor and module identities without filesystem realpath.
 * @returns the host's AgentLoop, SessionStore and scope factory.
 * @throws when the launcher cannot be located or its runtime exports are unavailable.
 */
export async function loadHostAgentModules() {
    const resources = process.resourcesPath;
    const entry = resources === undefined ? process.argv[1] : join(resources, 'app.asar', 'package.json');
    if (entry === undefined || !isAbsolute(entry))
        throw new Error('Citer 无法定位当前 DSH 的运行模块');
    const require = createRequire(resources === undefined ? await realpath(entry) : entry);
    const [loop, scope, session] = await Promise.all([
        import(__rewriteRelativeImportExtension(pathToFileURL(require.resolve('@deepseek-ai/dsh-agent-loop')).href)),
        import(__rewriteRelativeImportExtension(pathToFileURL(require.resolve('@deepseek-ai/dsh-scope')).href)),
        import(__rewriteRelativeImportExtension(pathToFileURL(require.resolve('@deepseek-ai/dsh-session')).href)),
    ]);
    if (typeof loop.AgentLoop !== 'function' || typeof scope.createScope !== 'function' || typeof session.SessionStore !== 'function')
        throw new Error('当前 DSH 未提供 Citer 所需的 Agent 组合接口');
    return { AgentLoop: loop.AgentLoop, SessionStore: session.SessionStore, createScope: scope.createScope };
}

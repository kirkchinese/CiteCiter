var __rewriteRelativeImportExtension = (this && this.__rewriteRelativeImportExtension) || function (path, preserveJsx) {
    if (typeof path === "string" && /^\.\.?\//.test(path)) {
        return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function (m, tsx, d, ext, cm) {
            return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : (d + ext + "." + cm.toLowerCase() + "js");
        });
    }
    return path;
};
import { createRequire } from 'node:module';
import { isAbsolute, join } from 'node:path';
import { pathToFileURL } from 'node:url';
/** Resolve published runtime modules from the actual launcher, preserving Desktop's module identities across external-plugin fallback paths. */
export async function loadHostAgentModules() {
    const resources = process.resourcesPath;
    const entry = resources === undefined ? process.argv[1] : join(resources, 'app.asar', 'package.json');
    if (entry === undefined || !isAbsolute(entry))
        throw new Error('Citer 无法定位当前 DSH 的运行模块');
    const require = createRequire(entry);
    const [loop, scope, session] = await Promise.all([
        import(__rewriteRelativeImportExtension(pathToFileURL(require.resolve('@deepseek-ai/dsh-agent-loop')).href)),
        import(__rewriteRelativeImportExtension(pathToFileURL(require.resolve('@deepseek-ai/dsh-scope')).href)),
        import(__rewriteRelativeImportExtension(pathToFileURL(require.resolve('@deepseek-ai/dsh-session')).href)),
    ]);
    if (typeof loop.AgentLoop !== 'function' || typeof scope.createScope !== 'function' || typeof session.SessionStore !== 'function')
        throw new Error('当前 DSH 未提供 Citer 所需的 Agent 组合接口');
    return { AgentLoop: loop.AgentLoop, SessionStore: session.SessionStore, createScope: scope.createScope };
}

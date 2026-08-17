/**
 * Shared tsdown preset for the CiteCiter browser plugin bundle.
 *
 * This is an adaptation of the DSH repository's
 * `packages/client/tsdown.client.ts` (MIT licensed, source read from the
 * master branch via jsDelivr on 2026-08-17). It emits the same
 * closure-factory artifact contract the product client loader consumes:
 * the bundle calls `window.__ModuleLoader__.load({ id, factory })` and
 * resolves externals through the injected `require` (module table — no
 * globals, no import map). CSS Modules are compiled by lightningcss inside
 * the bundle: importing `x.module.css` yields the hashed class map and the
 * css text auto-injects a `<style data-plugin="<id>">` tag at factory
 * execution (the loader removes plugin-owned tags on unload).
 */
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { basename, dirname, relative, resolve as resolvePath, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { UserConfig } from 'tsdown'
import { transform } from 'lightningcss'

/** See packages/client/web/src/platform.ts in the DSH repository. */
const PLATFORM_MODULES = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-web-react',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-attachment',
  '@deepseek-ai/dsh-client-schema-form',
] as const

const CSS_VIRTUAL_PREFIX = '\0dsh-css:'
const CSS_VIRTUAL_SUFFIX = '.mjs'

/**
 * Wire/type layers a client bundle may inline: browser-safe contracts with no
 * runtime identity to share. Everything else under @deepseek-ai/* is either a
 * module-table entry (external) or a leak the purity gate rejects.
 */
const INLINE_SAFE = /^@deepseek-ai\/dsh-(host-apiproxy|session|llm|tools|brand)(\/|$)/

/** Vendored framework libraries with no cross-plugin runtime identity. */
const VENDORED_LIBRARY = /^@deepseek-ai\/(cosmokit|schemastery)(\/|$)/

/** Generated descriptor/codec contribution with no shared runtime identity. */
const GENERATED_REMOTE = /^@deepseek-ai\/dsh-[a-z0-9]+(?:-[a-z0-9]+)*\/remote$/

/** The documented runtime store-engine exemption (module-table entry). */
const RUNTIME_STORE_EXEMPTION = '@deepseek-ai/dsh-client-runtime/client'

/** Externals resolved from the loader module table. */
const CLIENT_EXTERNALS: readonly string[] = [...PLATFORM_MODULES, RUNTIME_STORE_EXEMPTION]

const PACKAGE_ROOT = fileURLToPath(new URL('..', import.meta.url))

function browserSourcePath(source: string): string {
  if (!source.startsWith('.')) return source
  return source.replaceAll(sep, '/')
}

interface ClientBundleOptions {
  readonly lib?: UserConfig
}

/**
 * Build the tsdown config for the CiteCiter package: the node-half lib build
 * plus the browser client bundle, emitted during the Client build pass.
 */
export function clientBundle(id: string, libEntry: readonly string[], options: ClientBundleOptions = {}): (inlineConfig: Pick<UserConfig, 'env'>) => UserConfig[] {
  const lib: UserConfig = {
    name: id,
    entry: [...libEntry],
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    fixedExtension: false,
    dts: false,
    clean: false,
    ...options.lib,
  }
  const client = clientConfig(id, 'lib/types/client/index.js')
  return ({ env }) => {
    if (env?.DSH_BUILD_FACE === 'host') return []
    return [lib, client]
  }
}

function clientConfig(id: string, entry: string): UserConfig {
  const cssAssets = new Map<string, string>()
  return {
    name: `${id}/client`,
    entry: { client: entry },
    outDir: 'lib',
    format: 'cjs',
    platform: 'browser',
    dts: false,
    sourcemap: 'hidden',
    clean: false,
    deps: {
      neverBundle: [...CLIENT_EXTERNALS],
      alwaysBundle: (specifier: string) => (CLIENT_EXTERNALS.includes(specifier) ? undefined : true),
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      'import.meta.env': JSON.stringify({ MODE: process.env.NODE_ENV ?? 'production' }),
    },
    plugins: [{
      name: 'dsh-client-bundle-purity',
      resolveId(source: string) {
        if (!source.startsWith('@deepseek-ai/')) return null
        if (CLIENT_EXTERNALS.includes(source)) return null
        if (VENDORED_LIBRARY.test(source)) return null
        if (INLINE_SAFE.test(source) || GENERATED_REMOTE.test(source)) return null
        throw new Error(
          `client bundle purity: "${source}" is not a platform module (CLIENT_EXTERNALS), an inline-safe wire layer, or a generated /remote contribution — `
          + 'cross-plugin value imports are forbidden; collaborate through cordis services (type-only imports are erased and never reach this gate)',
        )
      },
    }, {
      name: 'dsh-css-modules-inline',
      resolveId(source: string, importer: string | undefined) {
        if (!source.endsWith('.module.css')) return null
        const abs = importer !== undefined ? sourceAssetPath(source, importer) : source
        const virtualId = CSS_VIRTUAL_PREFIX + browserSourcePath(relative(PACKAGE_ROOT, abs)) + CSS_VIRTUAL_SUFFIX
        cssAssets.set(virtualId, abs)
        return virtualId
      },
      async load(virtualId: string) {
        if (!virtualId.startsWith(CSS_VIRTUAL_PREFIX)) return null
        const fileId = cssAssets.get(virtualId)
        if (fileId === undefined) throw new Error(`unknown CSS module ${virtualId}`)
        this.addWatchFile(fileId)
        const source = await readFile(fileId)
        const { code, exports: cssExports } = transform({
          filename: fileId,
          code: source,
          cssModules: { pattern: '[hash]_[local]' },
          minify: true,
        })
        const classMap: Record<string, string> = {}
        const sortedExports = Object.entries(cssExports ?? {}).sort(([left], [right]) => left.localeCompare(right))
        for (const [local, exp] of sortedExports) classMap[local] = exp.name
        return [
          `const css = ${JSON.stringify(code.toString())};`,
          `const tagId = ${JSON.stringify(`${id}/${basename(fileId)}`)};`,
          'if (typeof document !== \'undefined\' && document.querySelector(\'style[data-plugin-css=\' + JSON.stringify(tagId) + \']\') === null) {',
          '  const tag = document.createElement(\'style\');',
          `  tag.dataset.plugin = ${JSON.stringify(id)};`,
          '  tag.dataset.pluginCss = tagId;',
          '  tag.textContent = css;',
          '  document.head.appendChild(tag);',
          '}',
          `export default ${JSON.stringify(classMap)};`,
        ].join('\n')
      },
    }],
    outputOptions: {
      entryFileNames: 'client.js',
      sourcemapPathTransform: browserSourcePath,
      banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(id)}, factory: (require) => {`,
      footer: 'return module.exports; } });',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
    },
  }
}

/** Resolve an emitted JS asset import against its source-tree counterpart. */
function sourceAssetPath(source: string, importer: string): string {
  const emitted = resolvePath(dirname(importer), source)
  if (existsSync(emitted)) return emitted
  const marker = `${sep}lib${sep}types${sep}`
  const boundary = emitted.indexOf(marker)
  if (boundary < 0) return emitted
  const root = emitted.slice(0, boundary)
  const rel = emitted.slice(boundary + marker.length)
  // For this standalone package, the source tree sits next to lib/types.
  return resolvePath(root, 'src', rel)
}

export { PACKAGE_ROOT }

/**
 * Keep the repository's Git-install entry aligned with the canonical npm package.
 * pnpm's Git fetcher reads the repository root and does not apply
 * publishConfig.directory. The root therefore exposes the same committed files
 * directly, without a prepare hook, a nested file dependency or an npm redirect.
 * Run with --check in CI; without it, update only the root manifest.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { isDeepStrictEqual } from 'node:util'

const rootUrl = new URL('../../../package.json', import.meta.url)
const packageUrl = new URL('../package.json', import.meta.url)
const [root, canonical] = await Promise.all([rootUrl, packageUrl].map(async url => JSON.parse(await readFile(url, 'utf8'))))
const prefix = './packages/citeciter/'
const rootPath = value => `${prefix}${value.replace(/^\.\//u, '')}`
const prefixExports = value => {
  if (typeof value === 'string') return value.startsWith('./') ? rootPath(value) : value
  if (Array.isArray(value)) return value.map(prefixExports)
  if (value !== null && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, prefixExports(nested)]))
  return value
}

const expected = { ...root }
for (const key of ['name', 'version', 'description', 'keywords', 'homepage', 'repository', 'bugs', 'license', 'author', 'type', 'engines', 'dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies', 'peerDependenciesMeta', 'os', 'cpu']) {
  delete expected[key]
  if (canonical[key] !== undefined) expected[key] = canonical[key]
}
for (const key of ['main', 'module', 'types', 'typings']) {
  delete expected[key]
  if (typeof canonical[key] === 'string') expected[key] = rootPath(canonical[key])
}
expected.exports = { ...prefixExports(canonical.exports), './package.json': './package.json' }
const patches = canonical.dsh?.bundle?.patch
if (typeof patches !== 'string' && !(Array.isArray(patches) && patches.every(value => typeof value === 'string'))) {
  throw new Error('The canonical plugin must declare dsh.bundle.patch before its Git entry can be synchronized.')
}
expected.dsh = { ...canonical.dsh, bundle: { ...canonical.dsh.bundle, patch: Array.isArray(patches) ? patches.map(rootPath) : rootPath(patches) } }
expected.files = [...new Set(['packages/citeciter/package.json', ...canonical.files.map(value => rootPath(value).slice(2))])]
expected.private = true
expected.publishConfig = { directory: 'packages/citeciter' }

if (process.argv.includes('--check')) {
  if (!isDeepStrictEqual(root, expected)) {
    console.error('The Git install entry is out of sync. Run pnpm sync:git-entry, then pnpm install to refresh the lockfile.')
    process.exitCode = 1
  } else console.log('Git install metadata matches packages/citeciter/package.json.')
} else {
  await writeFile(rootUrl, `${JSON.stringify(expected, null, 2)}\n`)
  console.log('Updated the repository Git install entry from the canonical plugin manifest.')
}
